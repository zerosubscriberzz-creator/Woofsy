import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { donorEmail, donorName, amount, transactionId, txnid } = await request.json()

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3B82F6; margin: 0;">🐕 Woofsy</h1>
          <p style="color: #6B7280; margin: 5px 0;">Thank you for your donation!</p>
        </div>
        
        <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1F2937; margin-top: 0;">Donation Receipt</h2>
          <p><strong>Donor:</strong> ${donorName}</p>
          <p><strong>Amount:</strong> ₹${amount}</p>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
          <p><strong>Reference ID:</strong> ${txnid}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString("en-IN")}</p>
        </div>
        
        <div style="background: #EFF6FF; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1E40AF; margin-top: 0;">Your Impact</h3>
          <p style="color: #374151;">Your generous donation of ₹${amount} will help provide:</p>
          <ul style="color: #374151;">
            <li>${Math.floor(amount / 80)} days of nutritious food for stray dogs</li>
            <li>Medical care and vaccinations</li>
            <li>Safe shelter and rehabilitation</li>
          </ul>
        </div>
        
        <div style="text-align: center; color: #6B7280; font-size: 14px;">
          <p>Thank you for supporting Woofsy! Your kindness helps give stray dogs a better life.</p>
          <p>This is an automated receipt. Please keep it for your records.</p>
        </div>
      </div>
    `

    await resend.emails.send({
      from: "Woofsy <noreply@woofsy.com>",
      to: [donorEmail],
      subject: `Donation Receipt - ₹${amount} for Woofsy`,
      html: emailHtml,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Send receipt error:", error)
    return NextResponse.json({ success: false, error: "Failed to send receipt" }, { status: 500 })
  }
}
