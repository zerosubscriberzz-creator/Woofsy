import { type NextRequest, NextResponse } from "next/server"
import { verifyPayUResponse } from "@/lib/payu"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const status = formData.get("status") as string
    const key = formData.get("key") as string
    const txnid = formData.get("txnid") as string
    const amount = formData.get("amount") as string
    const productinfo = formData.get("productinfo") as string
    const firstname = formData.get("firstname") as string
    const email = formData.get("email") as string
    const hash = formData.get("hash") as string
    const payuMoneyId = formData.get("payuMoneyId") as string

    const salt = process.env.PAYU_MERCHANT_SALT
    const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000"

    if (!salt) {
      return NextResponse.json({ error: "PayU configuration missing" }, { status: 500 })
    }

    // Verify hash
    const isValidHash = verifyPayUResponse(status, key, txnid, amount, productinfo, firstname, email, salt, hash)

    if (!isValidHash) {
      console.error("Invalid PayU hash verification")
      return NextResponse.json({ error: "Invalid hash" }, { status: 400 })
    }

    // Update donation status
    const updateResponse = await fetch(`${baseUrl}/api/donations/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        txnid,
        status: status === "success" ? "completed" : "failed",
        payuMoneyId,
        paymentDetails: {
          status,
          amount,
          email,
          firstname,
        },
      }),
    })

    if (status === "success") {
      // Send receipt email
      await fetch(`${baseUrl}/api/donations/receipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstname,
          amount,
          txnid,
          payuMoneyId,
        }),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("PayU webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
