"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, AlertCircle, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export const dynamic = "force-dynamic"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError("")

    await new Promise((resolve) => setTimeout(resolve, 1000))

    try {
      if (typeof window === "undefined") {
        throw new Error("Browser environment required")
      }

      const existingUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")

      console.log("[v0] Login attempt:", {
        input: formData.usernameOrEmail,
        totalUsers: existingUsers.length,
        userList: existingUsers.map((u: any) => ({ username: u.username, email: u.email })),
      })

      const user = existingUsers.find(
        (u: any) =>
          u.username.toLowerCase() === formData.usernameOrEmail.toLowerCase() ||
          u.email.toLowerCase() === formData.usernameOrEmail.toLowerCase(),
      )

      console.log("[v0] User found:", !!user)

      if (!user) {
        setLoginError("Account not found. Please check your username/email or Sign Up first.")
        toast({
          title: "Account Not Found",
          description:
            "No account found with this username or email. Please check your credentials or create an account first.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (user.password !== formData.password) {
        setLoginError("Incorrect password. Please try again.")
        toast({
          title: "Incorrect Password",
          description: "The password you entered is incorrect. Please try again or reset your password.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (!user.emailVerified) {
        setLoginError("Please verify your email address before logging in.")
        toast({
          title: "Email Not Verified",
          description: "Please verify your email address before logging in.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const lastLogin = localStorage.getItem(`lastLogin_${user.id}`)
      const isFirstLogin = !lastLogin

      localStorage.setItem("currentUser", JSON.stringify(user))
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem(`lastLogin_${user.id}`, new Date().toISOString())

      console.log("[v0] Login successful:", {
        username: user.username,
        isFirstLogin,
        redirecting: true,
      })

      toast({
        title: isFirstLogin ? "Welcome to Woofsy!" : "Welcome Back!",
        description: isFirstLogin
          ? `Welcome to Woofsy, ${user.username}! Ready to help some furry friends?`
          : `Welcome back, ${user.username}!`,
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("[v0] Login error:", error)
      setLoginError("An unexpected error occurred. Please try again.")
      toast({
        title: "Login Error",
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
          <CardTitle className="text-2xl font-heading font-black text-card-foreground">Welcome back</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to your account to continue helping dogs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {loginError && (
              <div className="flex items-center space-x-2 p-3 bg-red-950/20 border border-red-800 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-300">{loginError}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="usernameOrEmail" className="text-card-foreground font-heading font-semibold">
                Username or Email
              </Label>
              <Input
                id="usernameOrEmail"
                type="text"
                placeholder="Enter your username or email"
                value={formData.usernameOrEmail}
                onChange={(e) => {
                  setFormData({ ...formData, usernameOrEmail: e.target.value })
                  setLoginError("")
                }}
                required
                className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-card-foreground font-heading font-semibold">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value })
                    setLoginError("")
                  }}
                  required
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 pr-10 rounded-xl"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold py-3 rounded-xl paw-shadow transition-all duration-200 hover:scale-105"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link
              href="/forgot-password"
              className="text-primary hover:text-primary/80 font-heading font-medium text-sm"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:text-primary/80 font-heading font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
