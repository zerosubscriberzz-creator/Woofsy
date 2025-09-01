"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, AlertCircle, Send, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { emailService } from "@/lib/email-service"

export const dynamic = "force-dynamic"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "verify" | "reset">("email")
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [emailSentTime, setEmailSentTime] = useState<number | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (typeof window === "undefined") {
        throw new Error("Browser environment required")
      }

      const existingUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
      const user = existingUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase())

      if (!user) {
        setError("No account found with this email address.")
        toast({
          title: "Account Not Found",
          description: "No account found with this email address. Please check your email or create a new account.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const code = generateVerificationCode()
      setGeneratedCode(code)

      const result = await emailService.sendPasswordResetOTP(email, user.username, code)

      if (result.success) {
        setEmailSentTime(Date.now())
        setStep("verify")
        toast({
          title: "Reset Code Sent",
          description: `Password reset code sent to ${email}. Please check your inbox and spam folder.`,
        })
      } else {
        setError("Failed to send reset code. Please try again.")
        toast({
          title: "Failed to Send Code",
          description: "Unable to send password reset code. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (emailSentTime && Date.now() - emailSentTime > 5 * 60 * 1000) {
      setError("Verification code has expired. Please request a new one.")
      toast({
        title: "Code Expired",
        description: "Your verification code has expired. Please request a new one.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (verificationCode === generatedCode) {
      setStep("reset")
      toast({
        title: "Code Verified",
        description: "Verification successful. You can now reset your password.",
      })
    } else {
      setError("Invalid verification code. Please try again.")
      toast({
        title: "Invalid Code",
        description: "The verification code you entered is incorrect.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.")
      setIsLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      setIsLoading(false)
      return
    }

    try {
      if (typeof window === "undefined") {
        throw new Error("Browser environment required")
      }

      const existingUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
      const userIndex = existingUsers.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase())

      if (userIndex !== -1) {
        existingUsers[userIndex].password = newPassword
        localStorage.setItem("registeredUsers", JSON.stringify(existingUsers))

        toast({
          title: "Password Reset Successful",
          description: "Your password has been reset successfully. You can now sign in with your new password.",
        })

        router.push("/login")
      } else {
        setError("Account not found. Please try again.")
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md dark-card paw-shadow-lg rounded-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-between items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => {
                if (step === "email") {
                  if (typeof window !== "undefined" && window.history.length > 1) {
                    router.back()
                  } else {
                    router.push("/login")
                  }
                } else {
                  setStep("email")
                  setError("")
                }
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Button
                variant="ghost"
                size="sm"
                className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center paw-shadow hover:scale-105 transition-transform p-0"
                onClick={() => router.push("/")}
              >
                <img src="/images/woofsy-paw-logo.png" alt="Woofsy Paw Logo" className="w-8 h-8 object-contain" />
              </Button>
            </div>
            <div></div>
          </div>
          <CardTitle className="text-2xl font-heading font-black text-card-foreground">
            {step === "email" && "Reset Password"}
            {step === "verify" && "Verify Email"}
            {step === "reset" && "New Password"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {step === "email" && "Enter your email to receive a password reset code"}
            {step === "verify" && "Enter the 6-digit code sent to your email"}
            {step === "reset" && "Create a new password for your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-950/20 border border-red-800 rounded-lg mb-6">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-card-foreground font-heading font-semibold">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError("")
                  }}
                  required
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 rounded-xl"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold py-3 rounded-xl paw-shadow transition-all duration-200 hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Send className="h-4 w-4 mr-2 animate-pulse" />
                    Sending Code...
                  </>
                ) : (
                  "Send Reset Code"
                )}
              </Button>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerifySubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-card-foreground font-heading font-semibold">
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
                    setError("")
                  }}
                  required
                  maxLength={6}
                  className="text-center text-xl tracking-widest font-mono bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 rounded-xl"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold py-3 rounded-xl paw-shadow transition-all duration-200 hover:scale-105"
                disabled={isLoading || verificationCode.length !== 6}
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-card-foreground font-heading font-semibold">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value)
                      setError("")
                    }}
                    required
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 pr-10 rounded-xl"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-card-foreground font-heading font-semibold">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setError("")
                    }}
                    required
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 pr-10 rounded-xl"
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
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold py-3 rounded-xl paw-shadow transition-all duration-200 hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Remember your password?{" "}
              <Link href="/login" className="text-primary hover:text-primary/80 font-heading font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
