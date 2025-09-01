import { type NextRequest, NextResponse } from "next/server"
import { storeOTP } from "../verify-otp/route"

interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

// Server-side email service for Resend
class ServerEmailService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || ""

    console.log("🔍 Environment check:")
    console.log("- NODE_ENV:", process.env.NODE_ENV)
    console.log("- RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY)
    console.log("- RESEND_API_KEY length:", process.env.RESEND_API_KEY?.length || 0)
    console.log("- RESEND_API_KEY starts with 're_':", process.env.RESEND_API_KEY?.startsWith("re_") || false)

    if (!this.apiKey) {
      console.error("❌ RESEND_API_KEY environment variable is not set!")
      console.error("💡 Please add RESEND_API_KEY to your Vercel environment variables")
    } else if (!this.apiKey.startsWith("re_")) {
      console.error("❌ RESEND_API_KEY appears to be invalid - should start with 're_'")
      console.error("💡 Expected format: re_xxxxxxxxxxxxxxxxxxxxxxxxx")
    } else {
      console.log("✅ RESEND_API_KEY is configured (length:", this.apiKey.length, ")")
      console.log("✅ API key format appears valid")
    }
  }

  async sendEmail(emailData: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log(`🚀 Attempting to send email via Resend to: ${emailData.to}`)

    if (!this.apiKey) {
      console.error("❌ Resend API key is missing")
      return {
        success: false,
        error: "Email service configuration error. Please contact support.",
      }
    }

    const fromEmail = "onboarding@resend.dev"
    console.log(`📧 Using sender email: ${fromEmail}`)

    try {
      console.log("🔑 Using API key starting with:", this.apiKey.substring(0, 8) + "...")

      // Resend API endpoint
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `Woofsy Team <${fromEmail}>`,
          to: [emailData.to],
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text || "Please enable HTML to view this email.",
        }),
      })

      if (response.ok) {
        const responseData = await response.json()
        const messageId = responseData.id || `msg_${Date.now()}`
        console.log(`✅ Email sent successfully via Resend! Message ID: ${messageId}`)
        return {
          success: true,
          messageId: messageId,
        }
      } else {
        // Parse the error response
        let errorData
        try {
          errorData = await response.json()
          console.error(`❌ Resend API error response:`, errorData)
        } catch (e) {
          errorData = { message: "Unknown Resend error" }
        }

        console.error(`❌ Resend API returned error status ${response.status}:`, errorData)

        let userFriendlyError = "Failed to send email"
        if (response.status === 401) {
          userFriendlyError = "Email service authentication failed. Please contact support."
        } else if (response.status === 403) {
          userFriendlyError = "Email service access denied. Please contact support."
        } else if (response.status === 422) {
          userFriendlyError = "Invalid email address or content. Please check and try again."
        }

        return {
          success: false,
          error: userFriendlyError,
        }
      }
    } catch (error) {
      console.error("❌ Resend API request failed:", error)

      return {
        success: false,
        error: "Network error occurred while sending email. Please check your internet connection and try again.",
      }
    }
  }

  generateOTPEmail(otp: string, username: string): EmailData {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Woofsy - Your OTP Code</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background: linear-gradient(135deg, #dbeafe, #fce7f3, #fef3c7);
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: white; 
            border-radius: 20px; 
            overflow: hidden; 
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1); 
            border: 2px solid #8b5cf6;
          }
          .header { 
            background: linear-gradient(135deg, #8b5cf6, #ec4899); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
            position: relative;
          }
          .header::before {
            content: '';
            position: absolute;
            top: -10px;
            right: -10px;
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
          }
          .header h1 { 
            margin: 0; 
            font-size: 32px; 
            font-weight: 900; 
            letter-spacing: 2px;
          }
          .header p { 
            margin: 10px 0 0 0; 
            opacity: 0.9; 
            font-size: 18px; 
            font-weight: 600;
          }
          .content { 
            padding: 40px 30px; 
          }
          .content h2 { 
            color: #1f2937; 
            margin-top: 0; 
            font-size: 28px; 
            font-weight: 800;
          }
          .otp-box { 
            background: linear-gradient(135deg, #fef3c7, #fde68a); 
            border: 3px solid #06d6a0; 
            border-radius: 20px; 
            padding: 30px; 
            text-align: center; 
            margin: 30px 0; 
            box-shadow: 0 10px 20px rgba(6, 214, 160, 0.2); 
            position: relative;
          }
          .otp-box::before {
            content: '🐕';
            position: absolute;
            top: -15px;
            left: 20px;
            font-size: 30px;
            background: white;
            padding: 5px 10px;
            border-radius: 50%;
            border: 2px solid #06d6a0;
          }
          .otp-code { 
            font-size: 42px; 
            font-weight: 900; 
            color: #065f46; 
            letter-spacing: 12px; 
            margin: 20px 0; 
            font-family: 'Courier New', monospace; 
            background: white; 
            padding: 20px; 
            border-radius: 15px; 
            border: 2px solid #06d6a0; 
            box-shadow: 0 5px 15px rgba(6, 214, 160, 0.3);
          }
          .otp-box h3 { 
            color: #065f46; 
            margin-top: 0; 
            font-size: 22px; 
            font-weight: 800;
          }
          .otp-box p { 
            color: #065f46; 
            margin-bottom: 0; 
            font-weight: 700; 
            font-size: 16px;
          }
          .info-section { 
            background: linear-gradient(135deg, #f0f9ff, #fef7ff); 
            border-radius: 15px; 
            padding: 25px; 
            margin: 25px 0; 
            border: 2px solid #e0e7ff;
          }
          .info-section h3 { 
            color: #1f2937; 
            margin-top: 0; 
            font-size: 20px; 
            font-weight: 800;
          }
          .info-section ul { 
            margin: 15px 0; 
            padding-left: 20px; 
          }
          .info-section li { 
            margin: 10px 0; 
            color: #4b5563; 
            font-weight: 500;
          }
          .footer { 
            background: linear-gradient(135deg, #6366f1, #ec4899); 
            padding: 30px; 
            text-align: center; 
            color: white;
          }
          .footer p { 
            margin: 5px 0; 
            font-weight: 600;
          }
          .warning { 
            background: linear-gradient(135deg, #fef2f2, #fee2e2); 
            border: 2px solid #fecaca; 
            border-radius: 12px; 
            padding: 20px; 
            margin: 20px 0; 
            color: #991b1b; 
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🐾 WOOFSY</h1>
            <p>Where Paws Meet Hearts!</p>
          </div>
          
          <div class="content">
            <h2>Hello ${username}! 👋</h2>
            <p>Welcome to the Woofsy family! 🎉 To complete your registration and start helping amazing dogs find their forever homes, please verify your email address using the code below.</p>
            
            <div class="otp-box">
              <h3>Your Verification Code</h3>
              <div class="otp-code">${otp}</div>
              <p><strong>⏰ This code expires in 5 minutes</strong></p>
            </div>
            
            <p>Enter this 6-digit code in the Woofsy app to verify your email and activate your account. Once verified, you'll be able to:</p>
            
            <div class="info-section">
              <h3>🌟 What You Can Do Next:</h3>
              <ul>
                <li>🐕 Upload dogs you've found and help them find homes</li>
                <li>💬 Chat with other dog lovers in our community</li>
                <li>❤️ Browse and adopt amazing dogs looking for love</li>
                <li>💰 Support our cause with donations</li>
                <li>📱 Get notifications about dogs you're interested in</li>
                <li>🏠 Help create success stories of dogs finding families</li>
              </ul>
            </div>
            
            <div class="warning">
              <strong>🔒 Security Notice:</strong> If you didn't create a Woofsy account, please ignore this email. Never share your verification code with anyone. Our team will never ask for your code via phone or email.
            </div>
          </div>
          
          <div class="footer">
            <p><strong>🐾 This email was sent by Woofsy</strong></p>
            <p>Where every stray finds a home 🏠</p>
            <p>💌 Need help? Contact us at support@woofsy.app</p>
            <p>© 2024 Woofsy. Made with 💕 for every soul seeking love.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
🐾 WOOFSY - Email Verification

Hello ${username}!

Welcome to the Woofsy family! 🎉

To complete your registration and start helping amazing dogs find their forever homes, please verify your email address.

Your verification code is: ${otp}

⏰ This code expires in 5 minutes.

Enter this code in the Woofsy app to complete your registration.

What You Can Do Next:
• Upload dogs you've found and help them find homes
• Chat with other dog lovers in our community  
• Browse and adopt amazing dogs looking for love
• Support our cause with donations
• Get notifications about dogs you're interested in
• Help create success stories of dogs finding families

🔒 Security Notice: If you didn't create a Woofsy account, please ignore this email. Never share your verification code with anyone.

Need help? Contact us at support@woofsy.app

- The Woofsy Team 🐾
🏠 Where every stray finds a home
    `

    return {
      to: "",
      subject: "🐾 Woofsy – Your Verification Code is Here!",
      html,
      text,
    }
  }
}

const emailService = new ServerEmailService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, username, otp } = body

    console.log(`📧 API Route: Processing OTP request for ${email} (user: ${username}, otp: ${otp})`)

    // Validate input
    if (!email || !username || !otp) {
      console.error("❌ API Route: Missing required fields")
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.error("❌ API Route: Invalid email format")
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 })
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      console.error("❌ API Route: Invalid OTP format")
      return NextResponse.json({ success: false, error: "Invalid OTP format" }, { status: 400 })
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("❌ API Route: RESEND_API_KEY not configured")
      return NextResponse.json(
        {
          success: false,
          error: "Email service not configured. Please contact support.",
          message: "The email service is temporarily unavailable. Please try again later or contact support.",
        },
        { status: 503 },
      )
    }

    storeOTP(email, otp, "registration")

    // Generate email content
    const emailData = emailService.generateOTPEmail(otp, username)
    emailData.to = email

    const result = await emailService.sendEmail(emailData)

    if (result.success) {
      console.log(`✅ API Route: Email sent successfully via Resend! Message ID: ${result.messageId}`)
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: "OTP sent successfully to your email",
        emailSent: true,
      })
    } else {
      console.error(`❌ API Route: Failed to send email via Resend: ${result.error}`)
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to send OTP email",
          message: "Please check your email address and try again, or contact support if the problem persists.",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ API Route Error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An unexpected error occurred. Please try again or contact support.",
      },
      { status: 500 },
    )
  }
}
