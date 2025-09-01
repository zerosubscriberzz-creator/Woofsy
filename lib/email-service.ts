interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

// Production-ready email service using Resend
class EmailService {
  private apiKey: string

  constructor() {
    // Use Resend API key instead of SendGrid
    this.apiKey = process.env.RESEND_API_KEY || ""
  }

  async sendOTP(
    email: string,
    username: string,
    otp: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string; emailSent?: boolean }> {
    try {
      console.log(`🚀 Client: Requesting OTP send to ${email}`)

      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          otp,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        console.log(`✅ Client: OTP email sent successfully! Message ID: ${result.messageId}`)

        return {
          success: true,
          messageId: result.messageId,
          emailSent: result.emailSent || true,
        }
      } else {
        console.error(`❌ Client: OTP request failed: ${result.error}`)

        return {
          success: false,
          error: result.error || "Failed to send OTP email",
        }
      }
    } catch (error) {
      console.error("❌ Client: Network error:", error)

      return {
        success: false,
        error: "Network error occurred while sending OTP",
      }
    }
  }

  async sendPasswordResetOTP(
    email: string,
    username: string,
    otp: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string; emailSent?: boolean }> {
    try {
      console.log(`🚀 Client: Requesting password reset OTP send to ${email}`)

      const response = await fetch("/api/send-password-reset-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          otp,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        console.log(`✅ Client: Password reset OTP email sent successfully! Message ID: ${result.messageId}`)

        return {
          success: true,
          messageId: result.messageId,
          emailSent: result.emailSent || true,
        }
      } else {
        console.error(`❌ Client: Password reset OTP request failed: ${result.error}`)

        return {
          success: false,
          error: result.error || "Failed to send password reset OTP email",
        }
      }
    } catch (error) {
      console.error("❌ Client: Network error:", error)

      return {
        success: false,
        error: "Network error occurred while sending password reset OTP",
      }
    }
  }
}

export const emailService = new EmailService()
