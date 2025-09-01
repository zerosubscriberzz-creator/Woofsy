"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Heart, ArrowLeft, MapPin, Calendar, User, MessageCircle, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Dog {
  id: string
  name: string
  image: string
  location: string
  lastSeenLocation: string
  description: string
  uploadedBy: string
  uploadedDate: string
  status: "available" | "adopted"
  uploadedByUserId?: string
}

export default function DogDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [dog, setDog] = useState<Dog | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window === "undefined") return

    // Get real uploaded dogs
    const uploadedDogs = JSON.parse(localStorage.getItem("uploadedDogs") || "[]")

    // Admin placeholder dogs with the exact same data as browse page
    const adminPlaceholderDogs: Dog[] = [
      {
        id: "admin_1",
        name: "Happy Street Friend",
        image: "/images/happy-street-dog.png",
        location: "T. Nagar, Chennai",
        lastSeenLocation: "Near local shops, T. Nagar Main Road",
        description:
          "This incredibly happy and friendly dog has been living near the local shops. Always greets people with a big smile and wagging tail. The shopkeepers feed him regularly and he's become a beloved part of the community.",
        uploadedBy: "Admin",
        uploadedDate: "2024-01-15",
        status: "adopted",
        uploadedByUserId: "admin",
      },
      {
        id: "admin_2",
        name: "Puppy Siblings",
        image: "/images/two-puppies.jpeg",
        location: "Velachery, Chennai",
        lastSeenLocation: "Playing in the vacant lot behind residential area",
        description:
          "These two adorable puppies were found together and are inseparable. The brown one is more adventurous while the lighter one is gentle and calm. They play together all day and sleep cuddled up. Looking for a home that can take both.",
        uploadedBy: "Admin",
        uploadedDate: "2024-01-14",
        status: "adopted",
        uploadedByUserId: "admin",
      },
      {
        id: "admin_3",
        name: "Little Explorer",
        image: "/images/young-puppy.jpeg",
        location: "Anna Nagar, Chennai",
        lastSeenLocation: "Near the community feeding spot, Anna Nagar",
        description:
          "This curious young puppy has been coming to the community feeding area daily. Very alert and intelligent, always watching everything with those bright eyes. Gets along well with other dogs and loves human attention.",
        uploadedBy: "Admin",
        uploadedDate: "2024-01-13",
        status: "adopted",
        uploadedByUserId: "admin",
      },
    ]

    // Combine real uploads with admin placeholders - same as browse page
    const allDogs = [...uploadedDogs, ...adminPlaceholderDogs]
    const foundDog = allDogs.find((d) => d.id === params.id)
    setDog(foundDog || null)
  }, [params.id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-violet-900/20 text-violet-300 hover:bg-violet-900/30 border-violet-700"
      case "adopted":
        return "bg-gray-800/50 text-gray-300 hover:bg-gray-800/70 border-gray-600"
      default:
        return "bg-gray-800/50 text-gray-300 hover:bg-gray-800/70 border-gray-600"
    }
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const posted = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Posted just now"
    if (diffInHours < 24) return `Posted ${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `Posted ${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
  }

  if (!dog) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 text-violet-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Dog not found</h2>
          <p className="text-muted-foreground mb-4">The dog you're looking for doesn't exist or has been removed.</p>
          <Link href="/browse">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white">Browse Other Dogs</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-card border-b border-violet-900/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="mr-4 hover:bg-violet-900/20 text-white"
              onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  router.back()
                } else {
                  router.push("/browse")
                }
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-violet-400" />
              <h1 className="text-2xl font-bold text-white">{dog.name}</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <Card className="overflow-hidden bg-card border-violet-900/20">
              <div className="aspect-video relative">
                <img src={dog.image || "/placeholder.svg"} alt={dog.name} className="w-full h-full object-cover" />
                <Badge className={`absolute top-4 right-4 ${getStatusColor(dog.status)}`}>
                  {dog.status === "available" ? "Available" : "Adopted"}
                </Badge>
              </div>
            </Card>

            {/* Description */}
            <Card className="bg-card border-violet-900/20">
              <CardHeader>
                <CardTitle className="text-white">About {dog.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{dog.description}</p>
              </CardContent>
            </Card>

            {/* Location Details */}
            <Card className="bg-card border-violet-900/20">
              <CardHeader>
                <CardTitle className="text-white">Location Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 text-violet-400" />
                    <span className="font-medium">General Area:</span>
                    <span className="ml-2">{dog.location}</span>
                  </div>
                  <div className="flex items-start text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-violet-400" />
                    <div>
                      <span className="font-medium">Last Seen:</span>
                      <p className="ml-2 mt-1">{dog.lastSeenLocation}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card className="bg-card border-violet-900/20">
              <CardHeader>
                <CardTitle className="text-white">Quick Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={getStatusColor(dog.status)}>
                    {dog.status === "available" ? "Available" : "Adopted"}
                  </Badge>
                </div>
                <Separator className="bg-violet-900/20" />
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  {dog.location}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  {getTimeAgo(dog.uploadedDate)}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="h-4 w-4 mr-2" />
                  Posted by {dog.uploadedBy}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="bg-card border-violet-900/20">
              <CardHeader>
                <CardTitle className="text-white">Interested in {dog.name}?</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Connect with the community to learn more about this dog
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dog.status === "available" && (
                  <Link href={`/chat?dog=${dog.id}`}>
                    <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat with Poster
                    </Button>
                  </Link>
                )}

                <Button
                  variant="outline"
                  className={`w-full ${
                    dog.status === "available"
                      ? "border-violet-600 text-violet-400 hover:bg-violet-900/20 bg-transparent"
                      : "border-gray-600 text-gray-500 bg-gray-800/30 cursor-not-allowed"
                  }`}
                  disabled={dog.status === "adopted"}
                  onClick={() => {
                    if (dog.status === "available") {
                      toast({
                        title: "Added to Favorites!",
                        description: `${dog.name} has been saved to your favorites.`,
                      })
                    }
                  }}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Save to Favorites
                </Button>

                <Link href="/donate">
                  <Button
                    variant="outline"
                    className="w-full border-violet-600 text-violet-400 hover:bg-violet-900/20 bg-transparent"
                  >
                    Donate to Save Paws
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card className="bg-card border-violet-900/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-violet-400" />
                  <span>Safety Tips</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="text-violet-400 font-bold">•</span>
                    <div>
                      <span className="text-white font-semibold">Meet in a safe, public place first</span>
                      <span className="text-muted-foreground"> – choose a neutral spot to approach the dog.</span>
                    </div>
                  </li>

                  <li className="flex items-start space-x-3">
                    <span className="text-violet-400 font-bold">•</span>
                    <div>
                      <span className="text-white font-semibold">Bring a friend or family member</span>
                      <span className="text-muted-foreground"> – for safety and support.</span>
                    </div>
                  </li>

                  <li className="flex items-start space-x-3">
                    <span className="text-violet-400 font-bold">•</span>
                    <div>
                      <span className="text-white font-semibold">Observe the dog's behavior</span>
                      <span className="text-muted-foreground"> – look for signs of aggression, fear, or stress.</span>
                    </div>
                  </li>

                  <li className="flex items-start space-x-3">
                    <span className="text-violet-400 font-bold">•</span>
                    <div>
                      <span className="text-white font-semibold">Avoid sudden movements</span>
                      <span className="text-muted-foreground"> – let the dog come to you at its own pace.</span>
                    </div>
                  </li>

                  <li className="flex items-start space-x-3">
                    <span className="text-violet-400 font-bold">•</span>
                    <div>
                      <span className="text-white font-semibold">Carry basic protection</span>
                      <span className="text-muted-foreground">
                        {" "}
                        – a leash, gloves, or treats can help you manage interactions safely.
                      </span>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
