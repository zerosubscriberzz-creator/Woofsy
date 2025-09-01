"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail, MapPin, Send } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function ContactUsPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    })
    setFormData({ name: "", email: "", message: "" })
  }

  const contactDetails = [
    {
      icon: Mail,
      label: "Email",
      value: "support@woofsy.com",
    },
    {
      icon: MapPin,
      label: "Address",
      value: "Woofsy HQ, Chennai, India",
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
            <Mail className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-heading font-bold text-foreground">Contact Us</h1>
          </div>
          <p className="text-xl text-muted-foreground">We'd love to hear from you.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl">
          <div className="space-y-6">
            {contactDetails.map((contact, index) => {
              const IconComponent = contact.icon
              return (
                <Card key={index} className="dark-card">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-card-foreground">{contact.label}</p>
                        <p className="text-muted-foreground">{contact.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card className="dark-card">
            <CardHeader>
              <CardTitle className="text-xl font-heading text-card-foreground">Send us a message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Textarea
                  placeholder="Your Message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
                <Button type="submit" className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
