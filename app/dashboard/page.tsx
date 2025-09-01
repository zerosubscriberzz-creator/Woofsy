"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Heart,
  MessageCircle,
  MapPin,
  Bell,
  Search,
  Upload,
  Compass,
  DollarSign,
  MoreHorizontal,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
  LucideCaptions as Notifications,
  Shield,
  Home,
  Send,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DonationSection from "@/components/donation-section"

interface Dog {
  id: string
  name: string
  images: string[]
  location: string
  lastSeenLocation: string
  description: string
  uploadedBy: string
  uploadedDate: string
  status: "available" | "adopted" | "fostered"
  uploadedByUserId?: string
  likes: number
  comments: number
  isLiked: boolean
  isSaved: boolean
}

export const dynamic = "force-dynamic"

export default function DashboardPage() {
  const [user, setUser] = useState<any | null>(null)
  const [recentDogs, setRecentDogs] = useState<Dog[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({})
  const router = useRouter()

  useEffect(() => {
    if (typeof window === "undefined") return

    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    const userData = localStorage.getItem("currentUser")
    if (userData) {
      setUser(JSON.parse(userData))
    }

    loadDogs()
  }, [router])

  const loadDogs = () => {
    if (typeof window === "undefined") return

    const uploadedDogs = JSON.parse(localStorage.getItem("uploadedDogs") || "[]")

    const adminPlaceholderDogs: Dog[] = [
      {
        id: "admin_1",
        name: "Happy Street Friend",
        images: ["/images/happy-street-dog.png"],
        location: "T. Nagar, Chennai",
        lastSeenLocation: "Near local shops, T. Nagar Main Road",
        description:
          "This incredibly happy and friendly dog has been living near the local shops. Always greets people with a big smile and wagging tail. The shopkeepers feed him regularly and he's become a beloved part of the community. 🐕❤️",
        uploadedBy: "Admin",
        uploadedDate: "2024-01-15",
        status: "available",
        uploadedByUserId: "admin",
        likes: 24,
        comments: 8,
        isLiked: false,
        isSaved: false,
      },
      {
        id: "admin_2",
        name: "Puppy Siblings",
        images: ["/images/two-puppies.jpeg"],
        location: "Velachery, Chennai",
        lastSeenLocation: "Playing in the vacant lot behind residential area",
        description:
          "These two adorable puppies were found together and are inseparable. The brown one is more adventurous while the lighter one is gentle and calm. They play together all day and sleep cuddled up. Looking for a home that can take both. 🐶🐶",
        uploadedBy: "Admin",
        uploadedDate: "2024-01-14",
        status: "fostered",
        uploadedByUserId: "admin",
        likes: 42,
        comments: 15,
        isLiked: true,
        isSaved: true,
      },
      {
        id: "admin_3",
        name: "Little Explorer",
        images: ["/images/young-puppy.jpeg"],
        location: "Anna Nagar, Chennai",
        lastSeenLocation: "Near the community feeding spot, Anna Nagar",
        description:
          "This curious young puppy has been coming to the community feeding area daily. Very alert and intelligent, always watching everything with those bright eyes. Gets along well with other dogs and loves human attention. 🔍🐕",
        uploadedBy: "Admin",
        uploadedDate: "2024-01-13",
        status: "available",
        uploadedByUserId: "admin",
        likes: 18,
        comments: 5,
        isLiked: false,
        isSaved: false,
      },
    ]

    const enhancedUploadedDogs = uploadedDogs.map((dog: any) => ({
      ...dog,
      images: dog.image ? [dog.image] : ["/placeholder.svg"],
      likes: Math.floor(Math.random() * 50) + 5,
      comments: Math.floor(Math.random() * 20) + 1,
      isLiked: Math.random() > 0.7,
      isSaved: Math.random() > 0.8,
    }))

    const allDogs = [...enhancedUploadedDogs, ...adminPlaceholderDogs]
    setRecentDogs(allDogs.slice(0, 10))
  }

  const handleLogout = () => {
    if (typeof window === "undefined") return
    localStorage.removeItem("currentUser")
    localStorage.removeItem("isAuthenticated")
    router.push("/")
  }

  const toggleLike = (dogId: string) => {
    setRecentDogs((prevDogs) =>
      prevDogs.map((dog) => {
        if (dog.id === dogId) {
          return {
            ...dog,
            isLiked: !dog.isLiked,
            likes: dog.isLiked ? dog.likes - 1 : dog.likes + 1,
          }
        }
        return dog
      }),
    )
  }

  const toggleSave = (dogId: string) => {
    setRecentDogs((prevDogs) =>
      prevDogs.map((dog) => {
        if (dog.id === dogId) {
          return { ...dog, isSaved: !dog.isSaved }
        }
        return dog
      }),
    )
  }

  const nextImage = (dogId: string, totalImages: number) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [dogId]: ((prev[dogId] || 0) + 1) % totalImages,
    }))
  }

  const prevImage = (dogId: string, totalImages: number) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [dogId]: ((prev[dogId] || 0) - 1 + totalImages) % totalImages,
    }))
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const posted = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "now"
    if (diffInHours < 24) return `${diffInHours}h`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-600/20 text-green-300 hover:bg-green-600/20"
      case "adopted":
        return "bg-violet-600/20 text-violet-300 hover:bg-violet-600/20"
      case "fostered":
        return "bg-orange-600/20 text-orange-300 hover:bg-orange-600/20"
      default:
        return "bg-muted/20 text-muted-foreground hover:bg-muted/20"
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <img src="/images/purple-paw-icon.png" alt="Loading Paw" className="w-6 h-6 rounded-full object-cover" />
          </div>
          <div className="text-lg font-medium text-white">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-card border-b border-violet-500/20 sticky top-0 z-50 backdrop-blur-md bg-black/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push("/")}>
                <img
                  src="/images/purple-paw-icon.png"
                  alt="Woofsy Logo"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h1 className="text-xl font-heading font-black text-white">Woofsy</h1>
                  <p className="text-xs text-muted-foreground">Dog Rescue Platform</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                  <Home className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white relative">
                <Bell className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                <Search className="h-5 w-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-violet-600/20 text-violet-300 text-sm font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-white hidden md:block">{user.username}</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-card border-violet-500/20" align="end">
                  <DropdownMenuItem className="text-white hover:bg-violet-600/20">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-violet-600/20">
                    <Notifications className="mr-2 h-4 w-4" />
                    <span>Notifications</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-violet-600/20">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Privacy & Safety</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-violet-500/20" />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-400 hover:bg-red-600/20">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome back, {user.username}</h2>
          <p className="text-muted-foreground">Ready to help some amazing dogs find their forever homes?</p>
        </div>

        <div className="mb-6">
          <DonationSection showTitle={false} compact={true} />
        </div>

        <div className="mb-8">
          <div className="flex space-x-4 overflow-x-auto pb-2">
            <Link href="/upload">
              <div className="flex flex-col items-center space-y-2 min-w-[80px] cursor-pointer group">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <span className="text-xs text-white font-medium">Upload</span>
              </div>
            </Link>

            <Link href="/browse">
              <div className="flex flex-col items-center space-y-2 min-w-[80px] cursor-pointer group">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Compass className="h-8 w-8 text-white" />
                </div>
                <span className="text-xs text-white font-medium">Browse</span>
              </div>
            </Link>

            <Link href="/chat">
              <div className="flex flex-col items-center space-y-2 min-w-[80px] cursor-pointer group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <span className="text-xs text-white font-medium">Chat</span>
              </div>
            </Link>

            <Link href="/donate">
              <div className="flex flex-col items-center space-y-2 min-w-[80px] cursor-pointer group">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <span className="text-xs text-white font-medium">Donate</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          {recentDogs.length === 0 ? (
            <Card className="bg-card border border-violet-500/20">
              <CardContent className="text-center py-16">
                <div className="w-16 h-16 bg-violet-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <img
                    src="/images/purple-paw-icon.png"
                    alt="No Posts Paw"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </div>
                <h4 className="text-lg font-medium text-white mb-2">No posts yet</h4>
                <p className="text-muted-foreground mb-6">Be the first to help a stray dog find a loving home!</p>
                <Link href="/upload">
                  <Button className="bg-violet-600 hover:bg-violet-700 text-white">Upload First Dog</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            recentDogs.map((dog) => (
              <Card key={dog.id} className="bg-card border border-violet-500/20 overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-violet-600/20 text-violet-300 font-medium">
                          {dog.uploadedBy.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-white">{dog.uploadedBy}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          {dog.location} • {getTimeAgo(dog.uploadedDate)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${getStatusColor(dog.status)} text-xs font-medium`}>
                        {dog.status.charAt(0).toUpperCase() + dog.status.slice(1)}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-card border-violet-500/20" align="end">
                          <DropdownMenuItem className="text-white hover:bg-violet-600/20">Report Post</DropdownMenuItem>
                          <DropdownMenuItem className="text-white hover:bg-violet-600/20">Hide Post</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="relative aspect-square">
                    <img
                      src={dog.images[currentImageIndex[dog.id] || 0] || "/placeholder.svg"}
                      alt={dog.name}
                      className="w-full h-full object-cover"
                    />
                    {dog.images.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                          onClick={() => prevImage(dog.id, dog.images.length)}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                          onClick={() => nextImage(dog.id, dog.images.length)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
                          {dog.images.map((_, index) => (
                            <div
                              key={index}
                              className={`w-2 h-2 rounded-full ${
                                index === (currentImageIndex[dog.id] || 0) ? "bg-white" : "bg-white/50"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-auto hover:bg-transparent group"
                          onClick={() => toggleLike(dog.id)}
                        >
                          <Heart
                            className={`h-6 w-6 transition-all duration-200 group-hover:scale-110 ${
                              dog.isLiked ? "text-red-500 fill-red-500" : "text-muted-foreground hover:text-red-400"
                            }`}
                          />
                        </Button>
                        <Link href={`/chat?dog=${dog.id}`}>
                          <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent group">
                            <MessageCircle className="h-6 w-6 text-muted-foreground hover:text-violet-400 transition-all duration-200 group-hover:scale-110" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent group">
                          <Send className="h-6 w-6 text-muted-foreground hover:text-violet-400 transition-all duration-200 group-hover:scale-110" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto hover:bg-transparent group"
                        onClick={() => toggleSave(dog.id)}
                      >
                        <Bookmark
                          className={`h-6 w-6 transition-all duration-200 group-hover:scale-110 ${
                            dog.isSaved
                              ? "text-violet-400 fill-violet-400"
                              : "text-muted-foreground hover:text-violet-400"
                          }`}
                        />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {dog.likes > 0 && <p className="text-sm font-medium text-white">{dog.likes} likes</p>}

                      <div>
                        <h4 className="font-semibold text-white inline">{dog.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{dog.description}</p>
                      </div>

                      <div className="text-sm text-muted-foreground bg-black/50 border border-violet-500/20 rounded-lg p-3">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-violet-400" />
                          <span className="font-medium">Last seen: {dog.lastSeenLocation}</span>
                        </div>
                      </div>

                      {dog.comments > 0 && (
                        <Button variant="ghost" className="p-0 h-auto text-muted-foreground hover:text-white text-sm">
                          View all {dog.comments} comments
                        </Button>
                      )}

                      <div className="flex space-x-2 pt-2">
                        {dog.status === "available" && (
                          <>
                            <Link href={`/dog/${dog.id}`} className="flex-1">
                              <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium">
                                🏠 Adopt {dog.name}
                              </Button>
                            </Link>
                            <Link href={`/chat?dog=${dog.id}`}>
                              <Button
                                variant="outline"
                                className="border-violet-500/50 text-violet-300 hover:bg-violet-600/20 bg-transparent"
                              >
                                💬 Chat
                              </Button>
                            </Link>
                          </>
                        )}
                        {dog.status === "fostered" && (
                          <Link href={`/dog/${dog.id}`} className="flex-1">
                            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium">
                              🤝 Support Foster Care
                            </Button>
                          </Link>
                        )}
                        {dog.status === "adopted" && (
                          <Button disabled className="w-full bg-muted/20 text-muted-foreground font-medium">
                            ✅ Successfully Adopted
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
