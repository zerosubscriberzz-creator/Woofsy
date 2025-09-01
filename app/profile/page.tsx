"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import {
  Settings,
  Edit3,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Shield,
  Upload,
  Grid3X3,
  Bookmark,
  DollarSign,
  Info,
  ArrowRight,
  LogOut,
  Bell,
  Eye,
  Heart,
  MessageCircle,
  Share,
  CheckCircle,
  TrendingUp,
  Award,
  Target,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { BottomNav } from "@/components/bottom-nav"
import { realTimeDB } from "@/lib/real-time-database"
import { paymentService } from "@/lib/payment-service"

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  bio?: string
  avatar?: string
  location?: string
  joinedDate: string
  isVerified: boolean
  shelterLinked?: {
    id: string
    name: string
    verified: boolean
  }
  stats: {
    dogsPosted: number
    dogsAdopted: number
    totalDonations: number
    totalLikes: number
    totalComments: number
    totalShares: number
    impactScore: number
  }
}

interface Dog {
  id: string
  name: string
  images: string[]
  status: "available" | "adopted"
  uploadedDate: string
  likes: number
  comments: any[]
  location: string
}

interface Donation {
  id: string
  amount: number
  date: string
  allocation: string
  status: string
  transactionId: string
  purpose: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userPosts, setUserPosts] = useState<Dog[]>([])
  const [savedDogs, setSavedDogs] = useState<Dog[]>([])
  const [donations, setDonations] = useState<Donation[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    phone: "",
    location: "",
  })
  const [settings, setSettings] = useState({
    notifications: {
      newMessages: true,
      adoptionUpdates: true,
      donationReceipts: true,
    },
    privacy: {
      showEmail: false,
      showPhone: true,
      profileVisible: true,
    },
  })

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window === "undefined") return

    const currentUser = localStorage.getItem("currentUser")
    if (!currentUser) {
      router.push("/login")
      return
    }

    loadUserProfile()
    loadUserPosts()
    loadSavedDogs()
    loadDonations()

    const unsubscribeDogsUpdated = realTimeDB.subscribe("dogsUpdated", () => {
      loadUserProfile()
      loadUserPosts()
    })

    const unsubscribeDonationsUpdated = paymentService.subscribe("donationsUpdated", () => {
      loadDonations()
      loadUserProfile()
    })

    return () => {
      unsubscribeDogsUpdated()
      unsubscribeDonationsUpdated()
    }
  }, [])

  const loadUserProfile = async () => {
    try {
      if (typeof window === "undefined") return

      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")

      const allDogs = await realTimeDB.getAllDogs()
      const userDogs = allDogs.filter((dog: any) => dog.uploadedByUserId === currentUser.id)
      const adoptedCount = userDogs.filter((dog: any) => dog.status === "adopted").length

      // Calculate engagement stats
      const totalLikes = userDogs.reduce((sum: number, dog: any) => sum + (dog.likes || 0), 0)
      const totalComments = userDogs.reduce((sum: number, dog: any) => sum + (dog.comments?.length || 0), 0)
      const totalShares = userDogs.reduce((sum: number, dog: any) => sum + (dog.shares || 0), 0)

      // Get donation stats
      const donationStats = paymentService.getDonationStats()

      // Calculate impact score (dogs helped + engagement + donations)
      const impactScore =
        adoptedCount * 100 + totalLikes * 2 + totalComments * 5 + Math.floor(donationStats.totalAmount / 100)

      const mockUser: UserProfile = {
        id: currentUser.id || "user_1",
        name: currentUser.username || "User",
        email: currentUser.email || "user@email.com",
        phone: "+91 98765 43210",
        bio: "Dog lover and volunteer rescuer. I help stray dogs find loving homes and provide medical care when needed. Every dog deserves a chance at happiness!",
        avatar: "/diverse-woman-smiling.png",
        location: "Chennai, India",
        joinedDate: "2023-08-15T00:00:00Z",
        isVerified: true,
        stats: {
          dogsPosted: userDogs.length,
          dogsAdopted: adoptedCount,
          totalDonations: donationStats.totalAmount || 0,
          totalLikes,
          totalComments,
          totalShares,
          impactScore,
        },
      }

      setUser(mockUser)
      setEditForm({
        name: mockUser.name,
        bio: mockUser.bio || "",
        phone: mockUser.phone || "",
        location: mockUser.location || "",
      })
    } catch (error) {
      console.error("[v0] Error loading user profile:", error)
    }
  }

  const loadUserPosts = async () => {
    try {
      if (typeof window === "undefined") return

      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
      const allDogs = await realTimeDB.getAllDogs()
      const userDogs = allDogs
        .filter((dog: any) => dog.uploadedByUserId === currentUser.id)
        .sort((a: any, b: any) => new Date(b.uploadedDate).getTime() - new Date(a.uploadedDate).getTime())

      setUserPosts(userDogs)
    } catch (error) {
      console.error("[v0] Error loading user posts:", error)
    }
  }

  const loadSavedDogs = () => {
    // Mock saved dogs - in real app this would come from user preferences
    const mockSavedDogs: Dog[] = []
    setSavedDogs(mockSavedDogs)
  }

  const loadDonations = () => {
    const donationHistory = paymentService.getDonationHistory()
    const formattedDonations = donationHistory.map((donation: any) => ({
      id: donation.id,
      amount: donation.amount,
      date: donation.timestamp,
      allocation: donation.purpose === "donation" ? "General Dog Welfare" : donation.purpose,
      status: donation.status,
      transactionId: donation.transactionId,
      purpose: donation.purpose,
    }))

    setDonations(formattedDonations)
  }

  const handleEditProfile = () => {
    setIsEditing(true)
  }

  const handleSaveProfile = () => {
    if (!user) return

    const updatedUser = {
      ...user,
      name: editForm.name,
      bio: editForm.bio,
      phone: editForm.phone,
      location: editForm.location,
    }

    setUser(updatedUser)
    setIsEditing(false)

    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    })
  }

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentUser")
    }
    router.push("/login")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getImpactLevel = (score: number) => {
    if (score >= 1000) return { level: "Hero", color: "text-yellow-600", icon: Award }
    if (score >= 500) return { level: "Champion", color: "text-purple-600", icon: Target }
    if (score >= 100) return { level: "Helper", color: "text-blue-600", icon: Heart }
    return { level: "Beginner", color: "text-green-600", icon: TrendingUp }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  const impactLevel = getImpactLevel(user.stats.impactScore)
  const ImpactIcon = impactLevel.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 rounded-2xl mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 h-32"></div>
          <CardContent className="relative">
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-6">
              <div className="relative mb-4 md:mb-0">
                <img
                  src={user.avatar || "/placeholder.svg?height=120&width=120&query=user"}
                  alt={user.name}
                  className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl object-cover"
                />
                {user.isVerified && (
                  <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-full shadow-lg">
                    <Shield className="h-4 w-4" />
                  </div>
                )}
              </div>

              <div className="flex-1 md:ml-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-4xl font-heading font-black text-gray-900 mb-2">{user.name}</h1>
                    <div className="flex items-center space-x-4 text-gray-600 mb-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {user.location}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Joined {formatDate(user.joinedDate)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Badge className={`${impactLevel.color} bg-transparent border-current`}>
                        <ImpactIcon className="h-4 w-4 mr-1" />
                        {impactLevel.level}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Impact Score: {user.stats.impactScore}</span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button variant="outline" onClick={() => setShowSettings(true)} className="rounded-xl">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                    <Button
                      onClick={handleEditProfile}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 rounded-xl shadow-lg"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 rounded-xl bg-transparent"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-200">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-2xl text-white text-center shadow-lg">
                    <div className="text-2xl font-heading font-black mb-1">{user.stats.dogsPosted}</div>
                    <div className="text-sm font-medium">Dogs Posted</div>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-500 to-blue-500 p-4 rounded-2xl text-white text-center shadow-lg">
                    <div className="text-2xl font-heading font-black mb-1">{user.stats.dogsAdopted}</div>
                    <div className="text-sm font-medium">Dogs Adopted</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-4 rounded-2xl text-white text-center shadow-lg">
                    <div className="text-2xl font-heading font-black mb-1">
                      {formatCurrency(user.stats.totalDonations)}
                    </div>
                    <div className="text-sm font-medium">Donated</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 p-4 rounded-2xl text-white text-center shadow-lg">
                    <div className="text-2xl font-heading font-black mb-1">
                      {user.stats.totalLikes + user.stats.totalComments}
                    </div>
                    <div className="text-sm font-medium">Engagement</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 rounded-2xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">Upload Dog</h3>
              <p className="text-gray-600 mb-4">Help a stray find a home</p>
              <Link href="/upload">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 rounded-xl shadow-lg">
                  Upload Now
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 rounded-2xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">Messages</h3>
              <p className="text-gray-600 mb-4">Chat with adopters</p>
              <Link href="/messages">
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90 rounded-xl shadow-lg">
                  View Chats
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 rounded-2xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">Donate</h3>
              <p className="text-gray-600 mb-4">Support dog welfare</p>
              <Link href="/donate">
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90 rounded-xl shadow-lg">
                  Donate Now
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 rounded-2xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Share className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">Share App</h3>
              <p className="text-gray-600 mb-4">Spread awareness</p>
              <Button
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 rounded-xl shadow-lg"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    if (navigator.share) {
                      navigator.share({
                        title: "Woofsy - Help Dogs Find Homes",
                        text: "Join me in helping stray dogs find loving homes!",
                        url: window.location.origin,
                      })
                    } else {
                      navigator.clipboard.writeText(window.location.origin)
                      toast({ title: "Link copied to clipboard!" })
                    }
                  }
                }}
              >
                Share Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="posts" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/95 backdrop-blur-sm shadow-xl border-0 rounded-2xl p-2">
            <TabsTrigger
              value="posts"
              className="rounded-xl font-heading font-semibold text-lg py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              <Grid3X3 className="h-5 w-5 mr-2" />
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="rounded-xl font-heading font-semibold text-lg py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              <Bookmark className="h-5 w-5 mr-2" />
              Saved
            </TabsTrigger>
            <TabsTrigger
              value="donations"
              className="rounded-xl font-heading font-semibold text-lg py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              <DollarSign className="h-5 w-5 mr-2" />
              Donations
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="rounded-xl font-heading font-semibold text-lg py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              <Info className="h-5 w-5 mr-2" />
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            {userPosts.length === 0 ? (
              <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-16 text-center">
                  <Grid3X3 className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-3xl font-heading font-bold text-gray-900 mb-4">No posts yet</h3>
                  <p className="text-xl text-gray-600 mb-6 max-w-md mx-auto font-sans">
                    Share your first dog to help them find a home!
                  </p>
                  <Link href="/upload">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 font-medium px-8 py-3 text-lg rounded-xl shadow-lg">
                      <Upload className="h-5 w-5 mr-2" />
                      Upload First Dog
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {userPosts.map((dog) => (
                  <Link key={dog.id} href={`/dog/${dog.id}`}>
                    <Card className="group overflow-hidden bg-white/95 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-200 rounded-2xl">
                      <div className="aspect-square relative">
                        <img
                          src={dog.images[0] || "/placeholder.svg?height=200&width=200&query=dog"}
                          alt={dog.name}
                          className="w-full h-full object-cover"
                        />
                        <Badge
                          className={`absolute top-2 right-2 text-xs ${
                            dog.status === "available"
                              ? "bg-primary/20 text-primary border-primary/30"
                              : "bg-secondary/20 text-secondary border-secondary/30"
                          }`}
                        >
                          {dog.status === "available" ? "Available" : "Adopted"}
                        </Badge>
                        <div className="absolute bottom-2 left-2 flex items-center space-x-2">
                          <div className="flex items-center bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                            <Heart className="h-3 w-3 mr-1" />
                            {dog.likes || 0}
                          </div>
                          <div className="flex items-center bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            {dog.comments?.length || 0}
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-heading font-semibold text-gray-900 mb-1">{dog.name}</h4>
                        <p className="text-sm text-gray-500">{dog.location}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(dog.uploadedDate)}</p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            {savedDogs.length === 0 ? (
              <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-16 text-center">
                  <Bookmark className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-3xl font-heading font-bold text-gray-900 mb-4">No saved dogs</h3>
                  <p className="text-xl text-gray-600 mb-6 max-w-md mx-auto font-sans">
                    Save dogs you're interested in to view them later
                  </p>
                  <Link href="/feed">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 font-medium px-8 py-3 text-lg rounded-xl shadow-lg">
                      Browse Dogs
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {savedDogs.map((dog) => (
                  <Link key={dog.id} href={`/dog/${dog.id}`}>
                    <Card className="group overflow-hidden bg-white/95 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-200 rounded-2xl">
                      <div className="aspect-square relative">
                        <img
                          src={dog.images[0] || "/placeholder.svg?height=200&width=200&query=dog"}
                          alt={dog.name}
                          className="w-full h-full object-cover"
                        />
                        <Badge
                          className={`absolute top-2 right-2 text-xs ${
                            dog.status === "available"
                              ? "bg-primary/20 text-primary border-primary/30"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {dog.status === "available" ? "Available" : "Adopted"}
                        </Badge>
                      </div>
                      <div className="p-4">
                        <h4 className="font-heading font-semibold text-gray-900 mb-1">{dog.name}</h4>
                        <p className="text-sm text-gray-500">{formatDate(dog.uploadedDate)}</p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="donations" className="space-y-6">
            {donations.length === 0 ? (
              <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-16 text-center">
                  <DollarSign className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-3xl font-heading font-bold text-gray-900 mb-4">No donations yet</h3>
                  <p className="text-xl text-gray-600 mb-6 max-w-md mx-auto font-sans">
                    Make your first donation to help dogs in need
                  </p>
                  <Link href="/donate">
                    <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90 font-medium px-8 py-3 text-lg rounded-xl shadow-lg">
                      <DollarSign className="h-5 w-5 mr-2" />
                      Donate Now
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-2xl font-heading font-bold text-gray-900 flex items-center">
                      <DollarSign className="h-6 w-6 mr-3" />
                      Donation History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {donations.map((donation) => (
                        <div key={donation.id} className="flex items-center justify-between p-4 bg-gray-100 rounded-xl">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-heading font-semibold text-gray-900">
                                {formatCurrency(donation.amount)}
                              </div>
                              <Badge
                                className={
                                  donation.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {donation.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500 mb-1">{donation.allocation}</div>
                            <div className="text-xs text-gray-400">
                              Transaction ID: {donation.transactionId?.slice(-8)}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 ml-4">{formatDate(donation.date)}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="font-heading font-semibold text-gray-900">Total Donated:</span>
                        <span className="text-xl font-heading font-bold text-primary">
                          {formatCurrency(user.stats.totalDonations)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-heading font-bold text-gray-900 flex items-center">
                  <Info className="h-6 w-6 mr-3" />
                  About Me
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-heading font-semibold text-gray-900 mb-2">Bio</h4>
                    <p className="text-gray-600 leading-relaxed">{user.bio}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-heading font-semibold text-gray-900 mb-2">Contact</h4>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center text-gray-600">
                            <Phone className="h-4 w-4 mr-2" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-heading font-semibold text-gray-900 mb-2">Impact Level</h4>
                      <div className="flex items-center space-x-2">
                        <ImpactIcon className={`h-5 w-5 ${impactLevel.color}`} />
                        <span className={`font-semibold ${impactLevel.color}`}>{impactLevel.level}</span>
                        <span className="text-gray-500">({user.stats.impactScore} points)</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Based on dogs helped, engagement, and donations</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold">Edit Profile</DialogTitle>
            <DialogDescription>Update your profile information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSaveProfile} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold">Settings</DialogTitle>
            <DialogDescription>Manage your preferences</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h4 className="font-heading font-semibold mb-3">Notifications</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4" />
                    <span>New Messages</span>
                  </div>
                  <Switch
                    checked={settings.notifications.newMessages}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, newMessages: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Adoption Updates</span>
                  </div>
                  <Switch
                    checked={settings.notifications.adoptionUpdates}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, adoptionUpdates: checked },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-heading font-semibold mb-3">Privacy</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>Profile Visible</span>
                  </div>
                  <Switch
                    checked={settings.privacy.profileVisible}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, profileVisible: checked },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <Button onClick={() => setShowSettings(false)} className="w-full">
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  )
}
