import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const data: Record<string, string> = {}

    // Convert FormData to object
    formData.forEach((value, key) => {
      data[key] = value.toString()
    })

    const {
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      status,
      hash,
      mihpayid,
      mode,
      bankcode,
      PG_TYPE,
      bank_ref_num,
      udf1,
    } = data

    // Verify hash
    const merchantSalt = process.env.PAYU_MERCHANT_SALT!
    const reverseHashString = `${merchantSalt}|${status}|||||||||||${udf1 || ""}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`
    const expectedHash = crypto.createHash("sha512").update(reverseHashString).digest("hex")

    if (hash !== expectedHash) {
      console.error("[v0] PayU webhook hash verification failed")
      return NextResponse.json({ success: false, error: "Hash verification failed" }, { status: 400 })
    }

    // Update donation record
    const updateResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/update-donation`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txnid,
          status: status.toLowerCase(),
          paymentId: mihpayid,
          paymentMode: mode,
          bankRefNum: bank_ref_num,
          pgType: PG_TYPE,
          bankCode: bankcode,
        }),
      },
    )

    // Send email receipt for successful payments
    if (status === "success") {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/send-donation-receipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorEmail: email,
          donorName: firstname,
          amount: Number.parseFloat(amount),
          transactionId: mihpayid,
          txnid,
        }),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] PayU webhook error:", error)
    return NextResponse.json({ success: false, error: "Webhook processing failed" }, { status: 500 })
  }
}
