"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft, HelpCircle } from "lucide-react"

export default function HelpCenterPage() {
  const router = useRouter()

  const faqs = [
    {
      question: "How do I adopt a dog?",
      answer: "Browse available dogs, click adopt, and connect with the foster.",
    },
    {
      question: "Can I donate?",
      answer: "Yes, donations directly support NGOs, fosters, and vet care.",
    },
    {
      question: "How do I upload a stray dog?",
      answer: "Go to Upload, add dog details, and submit for review.",
    },
    {
      question: "What if I face an issue?",
      answer: "Use the Report Issue page or contact our team.",
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
            <HelpCircle className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-heading font-bold text-foreground">Help Center</h1>
          </div>
          <p className="text-xl text-muted-foreground">Find quick answers to common questions.</p>
        </div>

        <div className="grid gap-6 max-w-4xl">
          {faqs.map((faq, index) => (
            <Card key={index} className="dark-card">
              <CardHeader>
                <CardTitle className="text-lg font-heading text-card-foreground">Q: {faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">A: {faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
