import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { amount, donorName, donorEmail, message } = await request.json()

    // Validate required fields
    if (!amount || !donorEmail) {
      return NextResponse.json({ success: false, error: "Amount and email are required" }, { status: 400 })
    }

    // PayU configuration
    const merchantKey = process.env.PAYU_MERCHANT_KEY!
    const merchantSalt = process.env.PAYU_MERCHANT_SALT!
    const payuEnv = process.env.PAYU_ENV || "test"

    // Generate unique transaction ID
    const txnid = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // PayU URLs
    const paymentUrl = payuEnv === "prod" ? "https://secure.payu.in/_payment" : "https://test.payu.in/_payment"

    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/donate?status=success&txnid=${txnid}`
    const failureUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/donate?status=failure&txnid=${txnid}`

    // PayU parameters
    const payuParams = {
      key: merchantKey,
      txnid,
      amount: amount.toString(),
      productinfo: "Donation for Woofsy - Stray Dog Support",
      firstname: donorName || "Anonymous",
      email: donorEmail,
      phone: "9999999999", // PayU requires phone, using dummy for donations
      surl: successUrl,
      furl: failureUrl,
      service_provider: "payu_paisa",
      udf1: message || "",
      udf2: "",
      udf3: "",
      udf4: "",
      udf5: "",
    }

    // Generate hash
    const hashString = `${merchantKey}|${txnid}|${amount}|Donation for Woofsy - Stray Dog Support|${donorName || "Anonymous"}|${donorEmail}|||||||||||${merchantSalt}`
    const hash = crypto.createHash("sha512").update(hashString).digest("hex")

    // Add hash to parameters
    const finalParams = {
      ...payuParams,
      hash,
    }

    // Store donation record in database
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/store-donation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        txnid,
        amount,
        donorName: donorName || "Anonymous",
        donorEmail,
        message: message || "",
        status: "pending",
      }),
    })

    return NextResponse.json({
      success: true,
      paymentUrl,
      params: finalParams,
      txnid,
    })
  } catch (error) {
    console.error("[v0] PayU payment creation error:", error)
    return NextResponse.json({ success: false, error: "Failed to create payment" }, { status: 500 })
  }
}
