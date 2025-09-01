"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { ArrowLeft, MessageSquare, Users, Heart, MapPin } from "lucide-react"

export default function CommunityForumPage() {
  const router = useRouter()

  const categories = [
    {
      icon: Users,
      title: "First-time Adopters",
      description: "Questions, experiences, and support for new pet parents",
      posts: 24,
      color: "bg-blue-500/20 text-blue-500",
    },
    {
      icon: Heart,
      title: "Health & Vet Care",
      description: "Medical advice, vet recommendations, and health discussions",
      posts: 18,
      color: "bg-red-500/20 text-red-500",
    },
    {
      icon: MessageSquare,
      title: "Training & Behavior Tips",
      description: "Share training methods and behavioral insights",
      posts: 31,
      color: "bg-green-500/20 text-green-500",
    },
    {
      icon: MapPin,
      title: "Local Meetups in South India",
      description: "Organize and join local community events and meetups",
      posts: 12,
      color: "bg-purple-500/20 text-purple-500",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div
            className="inline-flex items-center gap-2 mb-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back()
              } else {
                router.push("/")
              }
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </div>
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-heading font-bold text-foreground">Community Forum</h1>
          </div>
          <p className="text-xl text-muted-foreground">Connect with other adopters and fosters.</p>
        </div>

        <div className="grid gap-6 max-w-4xl">
          {categories.map((category, index) => {
            const IconComponent = category.icon
            return (
              <Card key={index} className="dark-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${category.color}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-heading text-card-foreground">{category.title}</CardTitle>
                        <p className="text-muted-foreground text-sm mt-1">{category.description}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{category.posts} posts</Badge>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>

        <Card className="dark-card mt-8 max-w-4xl">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-heading font-semibold text-card-foreground mb-2">
              Community Forum Coming Soon
            </h3>
            <p className="text-muted-foreground">
              We're working on building an amazing community space for dog lovers to connect and share experiences.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
