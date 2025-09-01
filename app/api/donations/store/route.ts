import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { txnid, amount, email, firstname, status } = await request.json()

    // TODO: Store in actual database
    // For now, just log the donation
    console.log("Storing donation:", {
      txnid,
      amount,
      email,
      firstname,
      status,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Store donation error:", error)
    return NextResponse.json({ error: "Failed to store donation" }, { status: 500 })
  }
}
