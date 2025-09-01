import { type NextRequest, NextResponse } from "next/server"

// In-memory OTP storage (in production, use Redis or database)
const otpStorage = new Map<string, { code: string; timestamp: number; type: string }>()

export async function POST(request: NextRequest) {
  try {
    const { email, otp, type = "registration" } = await request.json()

    console.log(`[v0] OTP Verification API: Processing request for ${email}`)
    console.log(`[v0] Received OTP: "${otp}", Type: ${type}`)

    // Validate input
    if (!email || !otp) {
      console.log(`[v0] Missing required fields: email=${!!email}, otp=${!!otp}`)
      return NextResponse.json({ success: false, error: "Missing email or OTP" }, { status: 400 })
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      console.log(`[v0] Invalid OTP format: "${otp}"`)
      return NextResponse.json({ success: false, error: "Invalid OTP format. Must be 6 digits." }, { status: 400 })
    }

    // Get stored OTP data
    const otpKey = `${email}_${type}`
    const storedOtpData = otpStorage.get(otpKey)

    console.log(`[v0] Looking for OTP key: "${otpKey}"`)
    console.log(`[v0] Stored OTP data exists: ${!!storedOtpData}`)

    if (!storedOtpData) {
      console.log(`[v0] No OTP found for ${email}`)
      return NextResponse.json({ success: false, error: "No OTP found. Please request a new one." }, { status: 404 })
    }

    console.log(`[v0] Stored OTP: "${storedOtpData.code}", Timestamp: ${storedOtpData.timestamp}`)

    // Check if OTP has expired (5 minutes = 300000ms)
    const currentTime = Date.now()
    const otpAge = currentTime - storedOtpData.timestamp
    const maxAge = 5 * 60 * 1000 // 5 minutes

    console.log(`[v0] OTP age: ${otpAge}ms, Max age: ${maxAge}ms`)

    if (otpAge > maxAge) {
      console.log(`[v0] OTP expired for ${email}`)
      // Remove expired OTP
      otpStorage.delete(otpKey)
      return NextResponse.json({ success: false, error: "OTP has expired. Please request a new one." }, { status: 410 })
    }

    // Verify OTP
    const isValid = otp.trim() === storedOtpData.code.trim()
    console.log(`[v0] OTP verification result: ${isValid}`)

    if (isValid) {
      // Remove used OTP
      otpStorage.delete(otpKey)
      console.log(`[v0] ✅ OTP verified successfully for ${email}`)

      return NextResponse.json({
        success: true,
        message: "OTP verified successfully",
        verified: true,
      })
    } else {
      console.log(`[v0] ❌ OTP verification failed for ${email}`)
      console.log(`[v0] Expected: "${storedOtpData.code}", Received: "${otp}"`)

      return NextResponse.json({ success: false, error: "Invalid OTP. Please check and try again." }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] OTP Verification API Error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to store OTP (called by send-otp route)
export function storeOTP(email: string, code: string, type = "registration") {
  const otpKey = `${email}_${type}`
  otpStorage.set(otpKey, {
    code,
    timestamp: Date.now(),
    type,
  })
  console.log(`[v0] Stored OTP for ${otpKey}: "${code}"`)
}
