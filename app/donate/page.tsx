"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Heart, IndianRupee, Loader2, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export const dynamic = "force-dynamic"

export default function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState<string>("")
  const [customAmount, setCustomAmount] = useState("")
  const [donorName, setDonorName] = useState("")
  const [donorEmail, setDonorEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [transactionId, setTransactionId] = useState("")
  const [donationStats, setDonationStats] = useState<any>({})
  const { toast } = useToast()
  const router = useRouter()

  const quickAmounts = ["80", "200", "500", "1000"]

  useEffect(() => {
    // Load donation stats
    setDonationStats({
      totalAmount: 45680,
      dogsHelped: 89,
      totalDonations: 234,
    })
  }, [])

  const handleAmountSelect = (amount: string) => {
    setSelectedAmount(amount)
    setCustomAmount(amount)
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    if (quickAmounts.includes(value)) {
      setSelectedAmount(value)
    } else {
      setSelectedAmount("")
    }
  }

  const getFinalAmount = () => {
    return customAmount || selectedAmount
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = getFinalAmount()

    if (!amount || Number.parseInt(amount) < 1) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid donation amount.",
        variant: "destructive",
      })
      return
    }

    if (!donorEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your email for the receipt.",
        variant: "destructive",
      })
      return
    }

    await processPayUPayment()
  }

  const processPayUPayment = async () => {
    const amount = Number.parseInt(getFinalAmount())
    setIsSubmitting(true)

    try {
      // Create PayU payment request
      const paymentResponse = await fetch("/api/create-payu-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          donorName: donorName || "Anonymous",
          donorEmail,
          message,
        }),
      })

      const paymentData = await paymentResponse.json()

      if (!paymentData.success) {
        throw new Error(paymentData.error || "Failed to create payment")
      }

      if (typeof document !== "undefined") {
        // Create form and submit to PayU
        const form = document.createElement("form")
        form.method = "POST"
        form.action = paymentData.paymentUrl

        // Add all PayU parameters as hidden inputs
        Object.entries(paymentData.params).forEach(([key, value]) => {
          const input = document.createElement("input")
          input.type = "hidden"
          input.name = key
          input.value = value as string
          form.appendChild(input)
        })

        document.body.appendChild(form)
        form.submit()
        document.body.removeChild(form)
      }
    } catch (error) {
      console.error("[v0] Payment error:", error)
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const status = urlParams.get("status")
      const txnid = urlParams.get("txnid")

      if (status === "success" && txnid) {
        setTransactionId(txnid)
        setShowSuccessDialog(true)
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40 paw-shadow">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="mr-4 hover:bg-muted"
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
          <div className="flex items-center space-x-2">
            <img src="/images/purple-paw-icon.png" alt="Woofsy Paw" className="w-8 h-8 rounded-full object-cover" />
            <h1 className="text-2xl font-heading font-black text-foreground">Help Dogs, Transparently</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section with Live Stats */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-heading font-black text-foreground mb-4">Help Dogs, Transparently</h2>
          <p className="text-xl text-muted-foreground mb-6">
            100% of donations go directly to helping stray dogs find loving homes.
          </p>

          {/* Live Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-primary/10 border-primary/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  ₹{donationStats.totalAmount?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Raised</div>
              </CardContent>
            </Card>
            <Card className="bg-secondary/10 border-secondary/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-secondary">{donationStats.dogsHelped || 0}</div>
                <div className="text-sm text-muted-foreground">Dogs Helped</div>
              </CardContent>
            </Card>
            <Card className="bg-accent/10 border-accent/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-accent">{donationStats.totalDonations || 0}</div>
                <div className="text-sm text-muted-foreground">Kind Hearts</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Donation Form */}
          <Card className="bg-card border border-border paw-shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="font-heading font-bold text-card-foreground">Make a Donation</CardTitle>
              <CardDescription className="text-muted-foreground">
                Every rupee makes a difference in a dog's life
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Quick Amount Selection */}
                <div className="space-y-4">
                  <Label className="font-heading font-semibold">Choose Amount</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant={selectedAmount === amount ? "default" : "outline"}
                        className={`rounded-xl font-medium transition-all duration-200 ${
                          selectedAmount === amount
                            ? "bg-primary text-primary-foreground shadow-lg scale-105"
                            : "border-border hover:bg-muted hover:scale-105"
                        }`}
                        onClick={() => handleAmountSelect(amount)}
                      >
                        ₹{amount}
                      </Button>
                    ))}
                    <Button
                      type="button"
                      variant={!quickAmounts.includes(customAmount) && customAmount ? "default" : "outline"}
                      className={`rounded-xl font-medium transition-all duration-200 col-span-2 ${
                        !quickAmounts.includes(customAmount) && customAmount
                          ? "bg-primary text-primary-foreground shadow-lg scale-105"
                          : "border-border hover:bg-muted hover:scale-105"
                      }`}
                      onClick={() => {
                        setSelectedAmount("")
                        if (typeof document !== "undefined") {
                          document.getElementById("customAmount")?.focus()
                        }
                      }}
                    >
                      Custom Amount
                    </Button>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="customAmount" className="font-heading font-semibold">
                    Enter Amount
                  </Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="customAmount"
                      type="number"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      className="pl-10 rounded-xl"
                      min="1"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ₹80 provides 1 day of nutritious food for a stray dog.
                  </p>
                </div>

                {/* Donor Information */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="donorName" className="font-heading font-semibold">
                      Name (Optional)
                    </Label>
                    <Input
                      id="donorName"
                      placeholder="Your name"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="donorEmail" className="font-heading font-semibold">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="donorEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      className="rounded-xl"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Required for donation receipt</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="font-heading font-semibold">
                      Message (Optional)
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Leave a message of support..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-bold py-4 text-lg rounded-xl paw-shadow transition-all duration-200 hover:scale-105"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <IndianRupee className="h-5 w-5 mr-2" />
                      Pay Now ₹{getFinalAmount()}
                      <Heart className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Information */}
          <div className="space-y-6">
            {/* Impact Examples */}
            <Card className="bg-card border border-border paw-shadow rounded-2xl">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Heart className="h-6 w-6 text-primary" />
                  <CardTitle className="font-heading font-bold text-card-foreground">Your Impact</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="font-medium text-card-foreground">₹80</span>
                    <span className="text-muted-foreground">1 day of nutritious food</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="font-medium text-card-foreground">₹200</span>
                    <span className="text-muted-foreground">Basic medical checkup</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="font-medium text-card-foreground">₹500</span>
                    <span className="text-muted-foreground">Complete vaccination</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="font-medium text-card-foreground">₹1,000</span>
                    <span className="text-muted-foreground">Emergency medical treatment</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border paw-shadow rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <img
                    src="/happy-dog-with-food-bowl-illustration.png"
                    alt="Happy dog with food bowl"
                    className="w-24 h-24 mx-auto rounded-full"
                  />
                </div>
                <h3 className="font-heading font-bold text-card-foreground mb-2">Every Donation Counts</h3>
                <p className="text-muted-foreground text-sm">
                  Your kindness helps give stray dogs a better life with proper nutrition, medical care, and love.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <DialogTitle className="font-heading font-bold text-xl">Thank You!</DialogTitle>
            <DialogDescription className="text-base">
              Thank you for supporting Woofsy! Your kindness helps give stray dogs a better life.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Transaction ID</p>
              <p className="font-mono text-sm font-medium">{transactionId}</p>
            </div>
            <p className="text-sm text-muted-foreground">A receipt has been sent to your email address.</p>
            <Button onClick={() => setShowSuccessDialog(false)} className="w-full">
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
