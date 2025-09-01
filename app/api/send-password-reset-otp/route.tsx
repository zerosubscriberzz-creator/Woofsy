import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, username, otp } = await request.json()

    if (!email || !username || !otp) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: email, username, or otp" },
        { status: 400 },
      )
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY environment variable is not set")
      return NextResponse.json({ success: false, error: "Email service not configured" }, { status: 500 })
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - Woofsy</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🐾 Woofsy</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Dog Rescue Platform</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #8b5cf6; margin-top: 0;">Password Reset Request</h2>
            
            <p>Hi <strong>${username}</strong>,</p>
            
            <p>We received a request to reset your password for your Woofsy account. Use the verification code below to reset your password:</p>
            
            <div style="background: white; border: 2px solid #8b5cf6; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
              <p style="margin: 0; color: #666; font-size: 14px;">Your Password Reset Code</p>
              <h1 style="margin: 10px 0; color: #8b5cf6; font-size: 36px; letter-spacing: 8px; font-family: monospace;">${otp}</h1>
              <p style="margin: 0; color: #666; font-size: 12px;">This code expires in 5 minutes</p>
            </div>
            
            <p><strong>Important:</strong></p>
            <ul style="color: #666;">
              <li>This code is valid for 5 minutes only</li>
              <li>If you didn't request this password reset, please ignore this email</li>
              <li>Never share this code with anyone</li>
            </ul>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;"><strong>Security Tip:</strong> Keep your account secure by using a strong, unique password and never sharing your login credentials.</p>
            </div>
            
            <p>Thank you for helping stray dogs find loving homes! 🐕❤️</p>
            
            <p style="margin-top: 30px;">
              Best regards,<br>
              <strong>The Woofsy Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>This is an automated email from Woofsy. Please do not reply to this email.</p>
            <p>© 2024 Woofsy - Dog Rescue Platform</p>
          </div>
        </body>
      </html>
    `

    const emailText = `
      Woofsy - Password Reset Request
      
      Hi ${username},
      
      We received a request to reset your password for your Woofsy account.
      
      Your Password Reset Code: ${otp}
      
      This code expires in 5 minutes.
      
      If you didn't request this password reset, please ignore this email.
      Never share this code with anyone.
      
      Thank you for helping stray dogs find loving homes!
      
      Best regards,
      The Woofsy Team
      
      This is an automated email from Woofsy. Please do not reply to this email.
    `

    console.log(`🚀 Server: Attempting to send password reset OTP to ${email}`)

    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: [email],
      subject: "🐾 Reset Your Woofsy Password",
      html: emailHtml,
      text: emailText,
    })

    if (error) {
      console.error("❌ Resend API error:", error)
      return NextResponse.json({ success: false, error: `Email service error: ${error.message}` }, { status: 500 })
    }

    console.log(`✅ Password reset OTP email sent successfully! Message ID: ${data?.id}`)

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      emailSent: true,
    })
  } catch (error) {
    console.error("❌ Server error while sending password reset OTP:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
