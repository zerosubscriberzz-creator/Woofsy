import { type NextRequest, NextResponse } from "next/server"
import { generatePayUHash, generateTransactionId } from "@/lib/payu"

export async function POST(request: NextRequest) {
  try {
    const { amount, firstname, email, phone } = await request.json()

    if (!amount || !firstname || !email) {
      return NextResponse.json({ error: "Missing required fields: amount, firstname, email" }, { status: 400 })
    }

    const key = process.env.PAYU_MERCHANT_KEY
    const salt = process.env.PAYU_MERCHANT_SALT
    const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000"

    if (!key || !salt) {
      return NextResponse.json({ error: "PayU configuration missing" }, { status: 500 })
    }

    const txnid = generateTransactionId()
    const productinfo = "Dog Welfare Donation"
    const surl = `${baseUrl}/donate/success`
    const furl = `${baseUrl}/donate/failure`

    const hash = generatePayUHash(key, txnid, amount.toString(), productinfo, firstname, email, salt)

    const payuData = {
      key,
      txnid,
      amount: amount.toString(),
      productinfo,
      firstname,
      email,
      phone: phone || "",
      surl,
      furl,
      hash,
    }

    // Store donation record as pending
    await fetch(`${baseUrl}/api/donations/store`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        txnid,
        amount,
        email,
        firstname,
        status: "pending",
      }),
    })

    return NextResponse.json({
      success: true,
      payuData,
      paymentUrl: process.env.PAYU_ENV === "prod" ? "https://secure.payu.in/_payment" : "https://test.payu.in/_payment",
    })
  } catch (error) {
    console.error("PayU order creation error:", error)
    return NextResponse.json({ error: "Failed to create PayU order" }, { status: 500 })
  }
}
