export interface PaymentMethod {
  id: string
  type: "card" | "upi" | "netbanking" | "wallet"
  last4?: string
  brand?: string
  upiId?: string
  bankName?: string
  walletName?: string
}

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: "requires_payment_method" | "requires_confirmation" | "processing" | "succeeded" | "failed"
  clientSecret: string
  metadata: {
    donorName?: string
    message?: string
    dogId?: string
    purpose: "donation" | "adoption_fee" | "medical_support"
  }
}

export interface PaymentResult {
  success: boolean
  paymentIntent?: PaymentIntent
  error?: string
  transactionId?: string
}

export interface DonationRecord {
  id: string
  paymentIntentId: string
  amount: number
  currency: string
  donorName: string
  donorEmail?: string
  message: string
  timestamp: string
  status: "completed" | "pending" | "failed" | "refunded"
  paymentMethod: PaymentMethod
  transactionId: string
  purpose: "donation" | "adoption_fee" | "medical_support"
  dogId?: string
  publicNote: string
  receiptUrl?: string
}

class PaymentService {
  private apiKey = "pk_test_woofsy_demo_key"
  private baseUrl = "https://api.stripe.com/v1" // Demo URL
  private subscribers: Map<string, Set<(data: any) => void>> = new Map()

  constructor() {
    this.setupStorageListener()
  }

  private setupStorageListener() {
    window.addEventListener("storage", (e) => {
      if (e.key === "donationHistory") {
        this.notifySubscribers("donationsUpdated", this.getDonationHistory())
      }
    })
  }

  // Subscription system for real-time updates
  subscribe(event: string, callback: (data: any) => void) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set())
    }
    this.subscribers.get(event)!.add(callback)

    return () => {
      this.subscribers.get(event)?.delete(callback)
    }
  }

  private notifySubscribers(event: string, data: any) {
    const callbacks = this.subscribers.get(event)
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error("[v0] Error in payment subscriber callback:", error)
        }
      })
    }
  }

  // Create payment intent
  async createPaymentIntent(
    amount: number,
    currency = "inr",
    metadata: PaymentIntent["metadata"],
  ): Promise<PaymentIntent> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const paymentIntent: PaymentIntent = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: amount * 100, // Convert to smallest currency unit (paise for INR)
      currency,
      status: "requires_payment_method",
      clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 16)}`,
      metadata,
    }

    return paymentIntent
  }

  // Process payment with different methods
  async processPayment(paymentIntentId: string, paymentMethod: Omit<PaymentMethod, "id">): Promise<PaymentResult> {
    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 3000))

      // Simulate payment success/failure (95% success rate)
      const isSuccess = Math.random() > 0.05

      if (!isSuccess) {
        return {
          success: false,
          error: "Payment failed. Please try again or use a different payment method.",
        }
      }

      const paymentMethodWithId: PaymentMethod = {
        ...paymentMethod,
        id: `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }

      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`

      // Update payment intent status
      const paymentIntent: PaymentIntent = {
        id: paymentIntentId,
        amount: 0, // Will be updated with actual amount
        currency: "inr",
        status: "succeeded",
        clientSecret: "",
        metadata: { purpose: "donation" },
      }

      return {
        success: true,
        paymentIntent,
        transactionId,
      }
    } catch (error) {
      console.error("[v0] Payment processing error:", error)
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      }
    }
  }

  // Complete donation flow
  async processDonation(
    amount: number,
    donorName: string,
    message: string,
    paymentMethodType: PaymentMethod["type"],
    paymentDetails: any = {},
  ): Promise<PaymentResult> {
    try {
      // Create payment intent
      const paymentIntent = await this.createPaymentIntent(amount, "inr", {
        donorName,
        message,
        purpose: "donation",
      })

      // Create payment method based on type
      let paymentMethod: Omit<PaymentMethod, "id">

      switch (paymentMethodType) {
        case "card":
          paymentMethod = {
            type: "card",
            last4: paymentDetails.cardNumber?.slice(-4) || "4242",
            brand: paymentDetails.brand || "visa",
          }
          break
        case "upi":
          paymentMethod = {
            type: "upi",
            upiId: paymentDetails.upiId || "user@paytm",
          }
          break
        case "netbanking":
          paymentMethod = {
            type: "netbanking",
            bankName: paymentDetails.bankName || "State Bank of India",
          }
          break
        case "wallet":
          paymentMethod = {
            type: "wallet",
            walletName: paymentDetails.walletName || "Paytm",
          }
          break
        default:
          paymentMethod = { type: "card", last4: "4242", brand: "visa" }
      }

      // Process payment
      const result = await this.processPayment(paymentIntent.id, paymentMethod)

      if (result.success && result.transactionId) {
        // Create donation record
        const donation: DonationRecord = {
          id: `donation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          paymentIntentId: paymentIntent.id,
          amount,
          currency: "inr",
          donorName: donorName || "Anonymous",
          message: message || "",
          timestamp: new Date().toISOString(),
          status: "completed",
          paymentMethod: { ...paymentMethod, id: `pm_${Date.now()}` },
          transactionId: result.transactionId,
          purpose: "donation",
          publicNote: message || "Supporting dog welfare",
          receiptUrl: `https://woofsy.app/receipt/${result.transactionId}`,
        }

        // Save donation record
        this.saveDonation(donation)

        // Update real-time stats
        this.updateDonationStats(amount)

        return {
          success: true,
          paymentIntent: result.paymentIntent,
          transactionId: result.transactionId,
        }
      }

      return result
    } catch (error) {
      console.error("[v0] Donation processing error:", error)
      return {
        success: false,
        error: "Failed to process donation. Please try again.",
      }
    }
  }

  // Save donation to storage and notify subscribers
  private saveDonation(donation: DonationRecord) {
    try {
      const existingDonations = this.getDonationHistory()
      const updatedDonations = [donation, ...existingDonations]

      localStorage.setItem("donationHistory", JSON.stringify(updatedDonations))

      // Notify subscribers
      this.notifySubscribers("donationCompleted", donation)
      this.notifySubscribers("donationsUpdated", updatedDonations)
    } catch (error) {
      console.error("[v0] Error saving donation:", error)
    }
  }

  // Update donation statistics
  private updateDonationStats(amount: number) {
    try {
      const currentStats = JSON.parse(localStorage.getItem("donationStats") || "{}")
      const updatedStats = {
        totalAmount: (currentStats.totalAmount || 0) + amount,
        totalDonations: (currentStats.totalDonations || 0) + 1,
        lastUpdated: new Date().toISOString(),
      }

      localStorage.setItem("donationStats", JSON.stringify(updatedStats))
      this.notifySubscribers("donationStatsUpdated", updatedStats)
    } catch (error) {
      console.error("[v0] Error updating donation stats:", error)
    }
  }

  // Get donation history
  getDonationHistory(): DonationRecord[] {
    try {
      return JSON.parse(localStorage.getItem("donationHistory") || "[]")
    } catch (error) {
      console.error("[v0] Error loading donation history:", error)
      return []
    }
  }

  // Get donation statistics
  getDonationStats() {
    try {
      const stats = JSON.parse(localStorage.getItem("donationStats") || "{}")
      const donations = this.getDonationHistory()

      return {
        totalAmount: stats.totalAmount || 0,
        totalDonations: stats.totalDonations || donations.length,
        averageDonation: stats.totalAmount ? Math.round(stats.totalAmount / stats.totalDonations) : 0,
        recentDonations: donations.slice(0, 5),
        monthlyTotal: this.getMonthlyTotal(),
        dogsHelped: this.calculateDogsHelped(),
      }
    } catch (error) {
      console.error("[v0] Error loading donation stats:", error)
      return {
        totalAmount: 0,
        totalDonations: 0,
        averageDonation: 0,
        recentDonations: [],
        monthlyTotal: 0,
        dogsHelped: 0,
      }
    }
  }

  // Calculate monthly donation total
  private getMonthlyTotal(): number {
    const donations = this.getDonationHistory()
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    return donations
      .filter((donation) => {
        const donationDate = new Date(donation.timestamp)
        return (
          donationDate.getMonth() === currentMonth &&
          donationDate.getFullYear() === currentYear &&
          donation.status === "completed"
        )
      })
      .reduce((total, donation) => total + donation.amount, 0)
  }

  // Calculate dogs helped based on donations and adoptions
  private calculateDogsHelped(): number {
    const donations = this.getDonationHistory()
    const totalDonated = donations.filter((d) => d.status === "completed").reduce((sum, d) => sum + d.amount, 0)

    // Get adopted dogs count
    const uploadedDogs = JSON.parse(localStorage.getItem("uploadedDogs") || "[]")
    const adoptedDogs = uploadedDogs.filter((dog: any) => dog.status === "adopted").length

    // Calculate dogs helped: 1 dog per ₹500 donated + adopted dogs
    const dogsHelpedByDonations = Math.floor(totalDonated / 500)

    return dogsHelpedByDonations + adoptedDogs
  }

  // Simulate webhook for real-time updates
  simulateWebhook(eventType: string, data: any) {
    setTimeout(() => {
      this.notifySubscribers(eventType, data)
    }, 100)
  }

  // Get supported payment methods
  getSupportedPaymentMethods() {
    return [
      { type: "upi", name: "UPI", icon: "📱", popular: true },
      { type: "card", name: "Credit/Debit Card", icon: "💳", popular: true },
      { type: "netbanking", name: "Net Banking", icon: "🏦", popular: false },
      { type: "wallet", name: "Digital Wallet", icon: "👛", popular: false },
    ]
  }
}

// Singleton instance
export const paymentService = new PaymentService()

export { PaymentService }
