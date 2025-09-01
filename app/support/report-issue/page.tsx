"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { ArrowLeft, AlertTriangle, Upload } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function ReportIssuePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    description: "",
    screenshot: null as File | null,
  })
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Issue Reported!",
      description: "Our support team will respond within 24 hours.",
    })
    setFormData({ description: "", screenshot: null })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData({ ...formData, screenshot: file })
  }

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
            <AlertTriangle className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-heading font-bold text-foreground">Report an Issue</h1>
          </div>
          <p className="text-xl text-muted-foreground">Help us improve by reporting problems.</p>
        </div>

        <Card className="dark-card max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-heading text-card-foreground">Describe the issue</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Short description</label>
                <Textarea
                  placeholder="Please describe the issue you're experiencing..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Upload screenshot (optional)
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <Input type="file" accept="image/*" onChange={handleFileChange} className="max-w-xs mx-auto" />
                  {formData.screenshot && (
                    <p className="text-sm text-muted-foreground mt-2">Selected: {formData.screenshot.name}</p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full">
                Submit Report
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Our support team will respond within 24 hours.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
