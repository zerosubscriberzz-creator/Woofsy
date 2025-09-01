"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ArrowLeft, RefreshCw, CheckCircle, AlertCircle, Send, PartyPopper } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { emailService } from "@/lib/email-service"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [usernameError, setUsernameError] = useState("")
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [emailDeliveryStatus, setEmailDeliveryStatus] = useState<"sending" | "success" | "failed" | null>(null)
  const [resendAttempts, setResendAttempts] = useState(0)
  const [lastResendTime, setLastResendTime] = useState<number | null>(null)
  const [emailSentTime, setEmailSentTime] = useState<number | null>(null)
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const generateUserId = () => {
    return "user_" + Math.random().toString(36).substr(2, 9)
  }

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  const checkUsernameAvailability = async (username: string) => {
    const invalidChars = /[<>"/\\&'`;(){}[\]]/g
    const sqlInjectionPatterns = /(select|insert|update|delete|drop|union|script|javascript|onload|onerror|alert)/i
    const xssPatterns = /(<script|javascript:|data:|vbscript:|onload=|onerror=)/i

    if (username.length < 3) {
      setUsernameError("Username must be at least 3 characters long")
      return false
    }

    if (username.length > 30) {
      setUsernameError("Username must be less than 30 characters long")
      return false
    }

    if (invalidChars.test(username)) {
      setUsernameError(
        "Username contains invalid characters. Only letters, numbers, dots, dashes and underscores allowed.",
      )
      return false
    }

    if (sqlInjectionPatterns.test(username)) {
      setUsernameError("Username contains forbidden words or patterns")
      return false
    }

    if (xssPatterns.test(username)) {
      setUsernameError("Username contains potentially harmful content")
      return false
    }

    if (/[\u0000-\u001F\u007F-\u009F]/g.test(username)) {
      setUsernameError("Username contains control characters which are not allowed")
      return false
    }

    setIsCheckingUsername(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    const existingUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
    const isUsernameTaken = existingUsers.some((user: any) => user.username.toLowerCase() === username.toLowerCase())

    setIsCheckingUsername(false)

    if (isUsernameTaken) {
      setUsernameError("Username already taken. Please choose a different one.")
      return false
    }

    setUsernameError("")
    return true
  }

  const validateEmail = (email: string) => {
    const maxLength = 254
    const sqlInjectionPatterns = /(select|insert|update|delete|drop|union|script|javascript)/i
    const xssPatterns = /(<script|javascript:|data:|vbscript:|onload=|onerror=)/i

    if (email.length > maxLength) {
      return "Email address is too long (max 254 characters)"
    }

    if (sqlInjectionPatterns.test(email)) {
      return "Email contains forbidden content"
    }

    if (xssPatterns.test(email)) {
      return "Email contains potentially harmful content"
    }

    if (/[\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007\u0008\u000B\u000C\u000E-\u001F\u007F]/g.test(email)) {
      return "Email contains invalid control characters"
    }

    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

    if (!emailRegex.test(email)) {
      return "Please enter a valid email address"
    }

    return null
  }

  const validatePassword = (password: string) => {
    const maxLength = 128
    const minLength = 6

    if (password.length > maxLength) {
      return "Password is too long (max 128 characters)"
    }

    if (password.length < minLength) {
      return "Password must be at least 6 characters long"
    }

    if (/[\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007\u0008\u000B\u000C\u000E-\u001F\u007F]/g.test(password)) {
      return "Password contains invalid control characters"
    }

    return null
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const username = e.target.value
    setFormData({ ...formData, username })

    if (username.length >= 3) {
      checkUsernameAvailability(username)
    } else if (username.length > 0) {
      setUsernameError("Username must be at least 3 characters long")
    } else {
      setUsernameError("")
    }
  }

  const sendOTP = async (isResend = false) => {
    const code = generateVerificationCode()
    setGeneratedCode(code)
    setEmailDeliveryStatus("sending")
    setEmailError("")

    console.log("[v0] Generated OTP:", code)
    console.log("[v0] Sending OTP to:", formData.email)

    try {
      console.log(`🚀 Attempting to send OTP to ${formData.email}...`)

      const result = await emailService.sendOTP(formData.email, formData.username, code)

      if (result.success && result.emailSent) {
        setEmailDeliveryStatus("success")
        setEmailSentTime(Date.now())

        console.log("[v0] OTP stored in state:", code)

        if (isResend) {
          setResendAttempts((prev) => prev + 1)
          setLastResendTime(Date.now())
          toast({
            title: "OTP Resent Successfully!",
            description: `A new verification code has been sent to ${formData.email}. Please check your inbox and spam folder.`,
          })
        } else {
          toast({
            title: "OTP Sent Successfully!",
            description: `Verification code sent to ${formData.email}. Please check your inbox and spam folder. The code expires in 5 minutes.`,
          })
        }

        console.log(`✅ OTP email sent successfully! Message ID: ${result.messageId}`)
        return true
      } else {
        console.error("❌ Failed to send OTP email:", result.error)
        setEmailDeliveryStatus("failed")
        setEmailError(result.error || "Failed to send OTP email")

        toast({
          title: "Failed to Send OTP",
          description:
            result.error || "Unable to send verification email. Please check your email address and try again.",
          variant: "destructive",
        })

        return false
      }
    } catch (error) {
      console.error("❌ Network error while sending OTP:", error)
      setEmailDeliveryStatus("failed")
      setEmailError("Network error occurred")

      toast({
        title: "Network Error",
        description: "Unable to connect to email service. Please check your internet connection and try again.",
        variant: "destructive",
      })

      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const isUsernameAvailable = await checkUsernameAvailability(formData.username)
    if (!isUsernameAvailable) {
      setIsLoading(false)
      return
    }

    const emailValidation = validateEmail(formData.email)
    if (emailValidation) {
      setEmailError(emailValidation)
      toast({
        title: "Email Error",
        description: emailValidation,
        variant: "destructive",
      })
      setIsLoading(false)
      return
    } else {
      setEmailError("")
    }

    const passwordValidation = validatePassword(formData.password)
    if (passwordValidation) {
      setPasswordError(passwordValidation)
      toast({
        title: "Password Error",
        description: passwordValidation,
        variant: "destructive",
      })
      setIsLoading(false)
      return
    } else {
      setPasswordError("")
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    const existingUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
    if (existingUsers.some((user: any) => user.email.toLowerCase() === formData.email.toLowerCase())) {
      toast({
        title: "Email Already Registered",
        description: "This email is already registered. Please use a different email or try logging in.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (existingUsers.some((user: any) => user.username.toLowerCase() === formData.username.toLowerCase())) {
      setUsernameError("This username is already taken. Please choose another.")
      toast({
        title: "Username Taken",
        description: "This username is already taken. Please choose another.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    const otpSent = await sendOTP(false)
    if (otpSent) {
      setEmailSent(true)
    }
    setIsLoading(false)
  }

  const handleResendOTP = async () => {
    if (lastResendTime && Date.now() - lastResendTime < 30000) {
      const remainingTime = Math.ceil((30000 - (Date.now() - lastResendTime)) / 1000)
      toast({
        title: "Please Wait",
        description: `You can request a new OTP in ${remainingTime} seconds.`,
        variant: "destructive",
      })
      return
    }

    setIsResending(true)
    const otpSent = await sendOTP(true)
    if (otpSent) {
      setVerificationCode("")
    }
    setIsResending(false)
  }

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)

    console.log("[v0] Starting OTP verification...")
    console.log("[v0] User entered code:", `"${verificationCode}"`)

    const userCode = verificationCode.trim()

    console.log("[v0] Trimmed user code:", `"${userCode}"`)

    if (!userCode) {
      console.log("[v0] Empty code detected")
      toast({
        title: "Invalid Code",
        description: "Please enter the 6-digit verification code.",
        variant: "destructive",
      })
      setIsVerifying(false)
      return
    }

    if (userCode.length !== 6) {
      console.log("[v0] Invalid code length:", userCode.length)
      toast({
        title: "Invalid Code Length",
        description: "Please enter the complete 6-digit verification code.",
        variant: "destructive",
      })
      setIsVerifying(false)
      return
    }

    try {
      console.log("[v0] Calling OTP verification API...")

      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: userCode,
          type: "registration",
        }),
      })

      const result = await response.json()
      console.log("[v0] OTP verification API response:", result)

      if (result.success && result.verified) {
        console.log("[v0] ✅ OTP verification successful, creating account...")

        const userId = generateUserId()
        const userData = {
          id: userId,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          joinedDate: new Date().toISOString(),
          emailVerified: true,
        }

        try {
          const existingUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
          console.log("[v0] Existing users count:", existingUsers.length)

          // Check for duplicates before adding
          const isDuplicate = existingUsers.some(
            (user: any) =>
              user.username.toLowerCase() === formData.username.toLowerCase() ||
              user.email.toLowerCase() === formData.email.toLowerCase(),
          )

          if (isDuplicate) {
            console.log("[v0] ❌ Duplicate user detected")
            toast({
              title: "Account Already Exists",
              description: "An account with this username or email already exists.",
              variant: "destructive",
            })
            setIsVerifying(false)
            return
          }

          existingUsers.push(userData)
          localStorage.setItem("registeredUsers", JSON.stringify(existingUsers))

          localStorage.setItem("currentUser", JSON.stringify(userData))

          // Verify the account was stored correctly
          const verifyStorage = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
          const storedUser = verifyStorage.find((u: any) => u.username === formData.username)

          console.log("[v0] Account creation result:", {
            username: userData.username,
            email: userData.email,
            userId: userData.id,
            totalUsers: verifyStorage.length,
            accountStored: !!storedUser,
            storedUserData: storedUser
              ? { id: storedUser.id, username: storedUser.username, email: storedUser.email }
              : null,
          })

          if (!storedUser) {
            throw new Error("Failed to store account in localStorage")
          }

          console.log("[v0] ✅ Account successfully created and verified!")

          setGeneratedCode("")
          setVerificationCode("")

          toast({
            title: "Account Created Successfully!",
            description: `Welcome to Woofsy, ${formData.username}! Redirecting to your dashboard...`,
          })

          setTimeout(() => {
            router.push("/dashboard")
          }, 2000)
        } catch (error) {
          console.error("[v0] ❌ Failed to store account:", error)
          toast({
            title: "Account Creation Failed",
            description: "Failed to save your account. Please try again.",
            variant: "destructive",
          })
        }
      } else {
        console.log("[v0] ❌ OTP verification failed!")
        console.log("[v0] API response:", result)

        toast({
          title: "Verification Failed",
          description: result.error || "Invalid verification code. Please check and try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] ❌ OTP verification request failed:", error)
      toast({
        title: "Verification Error",
        description: "Failed to verify OTP. Please check your connection and try again.",
        variant: "destructive",
      })
    }

    setIsVerifying(false)
  }

  const handleGoToLogin = () => {
    router.push("/login")
  }

  const canResend = !lastResendTime || Date.now() - lastResendTime >= 30000
  const timeRemaining = lastResendTime ? Math.ceil((30000 - (Date.now() - lastResendTime)) / 1000) : 0

  if (showSuccessModal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md dark-card paw-shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                <PartyPopper className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-heading text-foreground mb-2">
              🎉 Account Created Successfully!
            </CardTitle>
            <CardDescription className="text-muted-foreground text-lg">
              Welcome to Woofsy, {formData.username}! Your account has been verified and you're ready to start helping
              stray dogs find loving homes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-violet-500/10 to-purple-600/10 p-4 rounded-lg border border-violet-500/20">
              <p className="text-violet-300 text-sm text-center">
                ✅ Email verified
                <br />✅ Account activated
                <br />✅ Ready to help dogs!
              </p>
            </div>

            <Button
              onClick={handleGoToLogin}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium py-3 text-lg vibrant-shadow"
            >
              Go to Login
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              You can now sign in and start browsing, uploading, and helping dogs in need!
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md dark-card paw-shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-6">
              {emailDeliveryStatus === "success" ? (
                <div className="w-12 h-12 bg-violet-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-violet-400" />
                </div>
              ) : emailDeliveryStatus === "failed" ? (
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-violet-500/20 rounded-full flex items-center justify-center animate-pulse">
                  <Send className="h-6 w-6 text-violet-400" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl font-heading text-foreground">
              {emailDeliveryStatus === "sending" ? "Sending Email..." : "Verify Your Email"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {emailDeliveryStatus === "success"
                ? `We've sent a 6-digit verification code to ${formData.email}. Please check your inbox and spam folder.`
                : emailDeliveryStatus === "failed"
                  ? `Failed to send email to ${formData.email}. Please try resending.`
                  : `Sending verification code to ${formData.email}...`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerification} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-foreground font-medium">
                  Verification Code
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => {
                    const sanitized = e.target.value.replace(/\D/g, "").slice(0, 6)
                    setVerificationCode(sanitized)
                  }}
                  required
                  maxLength={6}
                  className="text-center text-xl tracking-widest font-mono bg-card border-violet-500/30 focus:border-violet-500 focus:ring-violet-500/20 text-foreground"
                  disabled={emailDeliveryStatus !== "success"}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium py-2 vibrant-shadow"
                disabled={isVerifying || verificationCode.length !== 6 || emailDeliveryStatus !== "success"}
              >
                {isVerifying ? "Verifying..." : "Verify Email"}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <Button
                variant="outline"
                onClick={handleResendOTP}
                disabled={isResending || !canResend || emailDeliveryStatus === "sending"}
                className="w-full border-violet-500/30 text-violet-300 hover:bg-violet-500/10 bg-transparent"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending New OTP...
                  </>
                ) : !canResend ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Resend OTP ({timeRemaining}s)
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Resend OTP
                  </>
                )}
              </Button>

              {resendAttempts > 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  OTP resent {resendAttempts} time{resendAttempts > 1 ? "s" : ""}. Check your spam folder if you don't
                  see it.
                </p>
              )}

              <Button
                variant="ghost"
                onClick={() => {
                  setEmailSent(false)
                  setVerificationCode("")
                  setGeneratedCode("")
                  setEmailDeliveryStatus(null)
                  setResendAttempts(0)
                  setLastResendTime(null)
                  setEmailSentTime(null)
                }}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                Back to Registration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md dark-card paw-shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-between items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  router.back()
                } else {
                  router.push("/")
                }
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-1/2 transform -translate-x-1/2 w-10 h-10 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center hover:scale-105 transition-transform p-0"
              onClick={() => router.push("/")}
            >
              <img
                src="/images/woofsy-paw-logo-updated.png"
                alt="Woofsy Paw Logo"
                className="w-6 h-6 rounded-full object-cover"
              />
            </Button>
          </div>
          <CardTitle className="text-2xl font-heading text-foreground">Create Account</CardTitle>
          <CardDescription className="text-muted-foreground">
            Join Woofsy community and start helping stray dogs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground font-medium">
                Username *
              </Label>
              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a unique username"
                  value={formData.username}
                  onChange={handleUsernameChange}
                  required
                  className={`bg-card border-violet-500/30 focus:border-violet-500 focus:ring-violet-500/20 text-foreground ${
                    usernameError ? "border-red-500/50 focus:border-red-500" : ""
                  }`}
                />
                {isCheckingUsername && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <RefreshCw className="h-4 w-4 animate-spin text-violet-400" />
                  </div>
                )}
              </div>
              {usernameError && <p className="text-sm text-red-400">{usernameError}</p>}
              {formData.username.length >= 3 && !usernameError && !isCheckingUsername && (
                <p className="text-sm text-violet-400">✓ Username is available</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value })
                  setEmailError("")
                }}
                required
                className={`bg-card border-violet-500/30 focus:border-violet-500 focus:ring-violet-500/20 text-foreground ${
                  emailError ? "border-red-500/50 focus:border-red-500" : ""
                }`}
              />
              {emailError && <p className="text-sm text-red-400">{emailError}</p>}
              <p className="text-xs text-muted-foreground">We'll send a verification code to this email</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">
                Password *
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value })
                    setPasswordError("")
                  }}
                  required
                  className={`bg-card border-violet-500/30 focus:border-violet-500 focus:ring-violet-500/20 text-foreground ${
                    passwordError ? "border-red-500/50 focus:border-red-500" : ""
                  }`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {passwordError && <p className="text-sm text-red-400">{passwordError}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                Confirm Password *
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="bg-card border-violet-500/30 focus:border-violet-500 focus:ring-violet-500/20 text-foreground pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-sm text-red-400">Passwords do not match</p>
              )}
              {formData.confirmPassword &&
                formData.password === formData.confirmPassword &&
                formData.password.length > 0 && <p className="text-sm text-violet-400">✓ Passwords match</p>}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium py-2 vibrant-shadow"
              disabled={isLoading || usernameError !== "" || isCheckingUsername}
            >
              {isLoading ? (
                <>
                  <Send className="h-4 w-4 mr-2 animate-pulse" />
                  Sending Verification Email...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
