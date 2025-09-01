"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft, Heart } from "lucide-react"

export default function SuccessStoriesPage() {
  const router = useRouter()

  const stories = [
    {
      title: "Lucky finds a family in Chennai",
      image: "/images/happy-street-dog.png",
      story:
        "Lakshmi, a teacher from Chennai, adopted Lucky, a 3-year-old indie who was rescued from a busy road. Lucky was scared of people at first, but with love and patience, he now happily follows Lakshmi's children to school every morning. The family says Lucky has brought joy and protection into their home.",
    },
    {
      title: "Bella's new life in Coimbatore",
      image: "/images/two-puppies.jpeg",
      story:
        "Arun Kumar, an IT professional from Coimbatore, found Bella through Woofsy when she was rescued during the monsoon floods. Bella was weak and undernourished, but today she is healthy and enjoys long evening walks in the neighborhood. Arun says adopting Bella gave him a true companion during his work-from-home days.",
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
            <Heart className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-heading font-bold text-foreground">Success Stories</h1>
          </div>
          <p className="text-xl text-muted-foreground">Real adoption stories from South India.</p>
        </div>

        <div className="grid gap-8 max-w-4xl">
          {stories.map((story, index) => (
            <Card key={index} className="dark-card overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <img
                    src={story.image || "/placeholder.svg"}
                    alt={story.title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-2/3">
                  <CardHeader>
                    <CardTitle className="text-2xl font-heading text-card-foreground">{story.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed text-lg">{story.story}</p>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
