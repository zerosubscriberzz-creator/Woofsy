"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft, Shield, Users, Heart, AlertTriangle } from "lucide-react"

export default function SafetyGuidelinesPage() {
  const router = useRouter()

  const guidelines = [
    {
      icon: Users,
      text: "Always meet adopters in safe, public spaces.",
    },
    {
      icon: Heart,
      text: "Ensure every dog has proper vaccination and medical records.",
    },
    {
      icon: Shield,
      text: "Do not exchange money for adoption.",
    },
    {
      icon: AlertTriangle,
      text: "Report suspicious activity immediately.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back()
              } else {
                router.push("/")
              }
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-heading font-bold text-foreground">Safety Guidelines</h1>
          </div>
        </div>

        <div className="grid gap-6 max-w-4xl">
          {guidelines.map((guideline, index) => {
            const IconComponent = guideline.icon
            return (
              <Card key={index} className="dark-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-lg text-card-foreground">{guideline.text}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
