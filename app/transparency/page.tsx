"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield, TrendingUp, Calendar, Receipt, Heart, Stethoscope, Home, Server } from "lucide-react"

interface Donation {
  id: string
  amount: number
  donorName: string
  message: string
  timestamp: string
  publicNote: string
}

interface TransparencyLog {
  id: string
  type: "income" | "expense"
  amount: number
  description: string
  category: "food" | "vet" | "foster" | "hosting" | "donation"
  receiptUrl?: string
  timestamp: string
}

export default function TransparencyPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [logs, setLogs] = useState<TransparencyLog[]>([])
  const [totalRaised, setTotalRaised] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)

  useEffect(() => {
    loadTransparencyData()
  }, [])

  const loadTransparencyData = () => {
    // Load real donations
    const realDonations = JSON.parse(localStorage.getItem("donations") || "[]")

    // Sample transparency logs for demonstration
    const sampleLogs: TransparencyLog[] = [
      {
        id: "log_1",
        type: "expense",
        amount: 2500,
        description: "Emergency surgery for injured street dog - Max",
        category: "vet",
        receiptUrl: "#",
        timestamp: "2024-01-20T10:30:00Z",
      },
      {
        id: "log_2",
        type: "expense",
        amount: 800,
        description: "Monthly food supplies for 15 dogs",
        category: "food",
        receiptUrl: "#",
        timestamp: "2024-01-18T14:20:00Z",
      },
      {
        id: "log_3",
        type: "expense",
        amount: 1200,
        description: "Foster care support for 3 puppies",
        category: "foster",
        receiptUrl: "#",
        timestamp: "2024-01-15T09:15:00Z",
      },
      {
        id: "log_4",
        type: "expense",
        amount: 450,
        description: "App hosting and server costs",
        category: "hosting",
        receiptUrl: "#",
        timestamp: "2024-01-10T16:45:00Z",
      },
      {
        id: "log_5",
        type: "expense",
        amount: 600,
        description: "Vaccination drive for 8 street dogs",
        category: "vet",
        receiptUrl: "#",
        timestamp: "2024-01-08T11:30:00Z",
      },
    ]

    // Combine with existing logs
    const existingLogs = JSON.parse(localStorage.getItem("transparencyLogs") || "[]")
    const allLogs = [...existingLogs, ...sampleLogs]

    // Add donation entries as income logs
    const donationLogs: TransparencyLog[] = realDonations.map((donation: Donation) => ({
      id: `income_${donation.id}`,
      type: "income" as const,
      amount: donation.amount,
      description: `Donation from ${donation.donorName}: ${donation.publicNote}`,
      category: "donation" as const,
      timestamp: donation.timestamp,
    }))

    const finalLogs = [...allLogs, ...donationLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )

    setDonations(realDonations)
    setLogs(finalLogs)

    // Calculate totals
    const raised = finalLogs.filter((log) => log.type === "income").reduce((sum, log) => sum + log.amount, 4568) // Starting with existing amount

    const spent = finalLogs.filter((log) => log.type === "expense").reduce((sum, log) => sum + log.amount, 0)

    setTotalRaised(raised)
    setTotalSpent(spent)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "vet":
        return <Stethoscope className="h-4 w-4" />
      case "food":
        return <Heart className="h-4 w-4" />
      case "foster":
        return <Home className="h-4 w-4" />
      case "hosting":
        return <Server className="h-4 w-4" />
      case "donation":
        return <Heart className="h-4 w-4" />
      default:
        return <Receipt className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "vet":
        return "bg-destructive/20 text-destructive border-destructive/30"
      case "food":
        return "bg-primary/20 text-primary border-primary/30"
      case "foster":
        return "bg-secondary/20 text-secondary border-secondary/30"
      case "hosting":
        return "bg-muted text-muted-foreground border-border"
      case "donation":
        return "bg-accent/20 text-accent border-accent/30"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40 paw-shadow">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Link href="/donate">
            <Button variant="ghost" size="sm" className="mr-4 hover:bg-muted">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Donate
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-heading font-black text-foreground">Transparency Report</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border border-border paw-shadow rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div className="text-3xl font-heading font-black text-foreground mb-2">
                ₹{totalRaised.toLocaleString()}
              </div>
              <p className="text-muted-foreground font-medium">Total Funds Raised</p>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border paw-shadow rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-6 w-6 text-secondary" />
              </div>
              <div className="text-3xl font-heading font-black text-foreground mb-2">
                ₹{totalSpent.toLocaleString()}
              </div>
              <p className="text-muted-foreground font-medium">Used for Dog Welfare</p>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border paw-shadow rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <div className="text-3xl font-heading font-black text-foreground mb-2">
                ₹{(totalRaised - totalSpent).toLocaleString()}
              </div>
              <p className="text-muted-foreground font-medium">Available Balance</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-card border border-border paw-shadow rounded-2xl">
          <CardHeader>
            <CardTitle className="font-heading font-bold text-card-foreground flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(log.category)}`}>
                        {getCategoryIcon(log.category)}
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">{log.description}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(log.timestamp)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${log.type === "income" ? "text-secondary" : "text-foreground"}`}>
                        {log.type === "income" ? "+" : "-"}₹{log.amount.toLocaleString()}
                      </p>
                      {log.receiptUrl && (
                        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground p-0 h-auto">
                          View Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Breakdown by Category */}
        <Card className="bg-card border border-border paw-shadow rounded-2xl mt-8">
          <CardHeader>
            <CardTitle className="font-heading font-bold text-card-foreground">Monthly Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-heading font-semibold text-card-foreground mb-4">Expenses by Category</h4>
                <div className="space-y-3">
                  {[
                    { category: "vet", label: "Veterinary Care", amount: 3100, color: "bg-destructive" },
                    { category: "food", label: "Food & Nutrition", amount: 800, color: "bg-primary" },
                    { category: "foster", label: "Foster Care", amount: 1200, color: "bg-secondary" },
                    { category: "hosting", label: "App Hosting", amount: 450, color: "bg-muted-foreground" },
                  ].map((item) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                      </div>
                      <span className="font-medium text-card-foreground">₹{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-heading font-semibold text-card-foreground mb-4">Impact This Month</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dogs helped with medical care</span>
                    <span className="font-medium text-card-foreground">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Days of food provided</span>
                    <span className="font-medium text-card-foreground">320</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dogs in foster care</span>
                    <span className="font-medium text-card-foreground">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Successful adoptions</span>
                    <span className="font-medium text-card-foreground">5</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
