import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, firstname, amount, txnid, payuMoneyId } = await request.json()

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8b5cf6;">Thank You for Your Donation!</h2>
        <p>Dear ${firstname},</p>
        <p>Thank you for your generous donation to Woofsy. Your contribution helps stray dogs find loving homes.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Donation Details:</h3>
          <p><strong>Amount:</strong> ₹${amount}</p>
          <p><strong>Transaction ID:</strong> ${txnid}</p>
          <p><strong>PayU Money ID:</strong> ${payuMoneyId}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <p>Your donation will be used for:</p>
        <ul>
          <li>Providing nutritious food for stray dogs</li>
          <li>Medical care and vaccinations</li>
          <li>Shelter maintenance and improvements</li>
          <li>Platform development and maintenance</li>
        </ul>
        
        <p>With love,<br>The Woofsy Team 🐾</p>
      </div>
    `

    await resend.emails.send({
      from: "Woofsy <donations@woofsy.com>",
      to: [email],
      subject: "Thank you for your donation - Receipt",
      html: emailContent,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Send receipt error:", error)
    return NextResponse.json({ error: "Failed to send receipt" }, { status: 500 })
  }
}
