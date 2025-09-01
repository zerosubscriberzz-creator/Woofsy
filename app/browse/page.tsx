"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Heart, Search, MapPin, Calendar, ArrowLeft, Filter, Grid3X3, List } from "lucide-react"

export const dynamic = "force-dynamic"

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

export default function BrowsePage() {
  const router = useRouter()
  const [dogs, setDogs] = useState<Dog[]>([])
  const [filteredDogs, setFilteredDogs] = useState<Dog[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("adopted") // Show adopted dogs by default
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    loadDogs()
  }, [])

  const loadDogs = () => {
    if (typeof window === "undefined") return

    // Get real uploaded dogs
    const uploadedDogs = JSON.parse(localStorage.getItem("uploadedDogs") || "[]")

    // Admin placeholder dogs with your authentic photos
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

    // Combine real uploads with admin placeholders
    const allDogs = [...uploadedDogs, ...adminPlaceholderDogs]
    setDogs(allDogs)
    setFilteredDogs(allDogs.filter((dog) => dog.status === "adopted")) // Default to adopted
  }

  useEffect(() => {
    let filtered = dogs

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (dog) =>
          dog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dog.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dog.lastSeenLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dog.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((dog) => dog.status === statusFilter)
    }

    setFilteredDogs(filtered)
  }, [dogs, searchTerm, statusFilter])

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

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="backdrop-blur-md bg-black/90 border-b border-violet-900/30 sticky top-0 z-50">
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
                  router.push("/dashboard")
                }
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-violet-500" />
              <h1 className="text-2xl font-bold text-white">Browse Dogs</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={
                viewMode === "grid"
                  ? "bg-violet-600 hover:bg-violet-700 text-white"
                  : "text-white hover:bg-violet-900/20"
              }
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={
                viewMode === "list"
                  ? "bg-violet-600 hover:bg-violet-700 text-white"
                  : "text-white hover:bg-violet-900/20"
              }
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-8 border border-violet-900/30 bg-gray-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="h-5 w-5 text-violet-400" />
              <h3 className="text-lg font-semibold text-white">Filter Dogs</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search dogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-violet-900/30 bg-gray-800/50 backdrop-blur-sm text-white placeholder:text-gray-400"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-violet-900/30 bg-gray-800/50 backdrop-blur-sm text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-violet-900/30">
                  <SelectItem value="available" className="text-white hover:bg-violet-900/20">
                    Available Only
                  </SelectItem>
                  <SelectItem value="adopted" className="text-white hover:bg-violet-900/20">
                    Adopted Only
                  </SelectItem>
                  <SelectItem value="all" className="text-white hover:bg-violet-900/20">
                    All Status
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("available")
                }}
                className="border-violet-900/30 bg-gray-800/50 backdrop-blur-sm hover:bg-violet-900/20 text-white"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing {filteredDogs.length} of {dogs.length} dogs
          </p>
        </div>

        {/* Dogs Grid/List */}
        {filteredDogs.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No dogs found</h3>
            <p className="text-gray-400 mb-4">
              {statusFilter === "available"
                ? "No dogs are currently available for adoption. Check back later or upload a dog you've found!"
                : "Try adjusting your search filters."}
            </p>
            <Link href="/upload">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white">Upload a Dog</Button>
            </Link>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDogs.map((dog) => (
              <Card
                key={dog.id}
                className="group overflow-hidden border border-violet-900/30 bg-gray-900/50 backdrop-blur-sm hover:bg-gray-800/50 hover:shadow-xl hover:shadow-violet-900/20 transition-all duration-300"
              >
                {/* Image First - Prioritized */}
                <div className="aspect-square relative">
                  <img src={dog.image || "/placeholder.svg"} alt={dog.name} className="w-full h-full object-cover" />
                  <Badge className={`absolute top-3 right-3 ${getStatusColor(dog.status)}`}>
                    {dog.status === "available" ? "Available" : "Adopted"}
                  </Badge>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="font-semibold text-lg mb-1">{dog.name}</h3>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate">{dog.location}</span>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-white">{dog.name}</h3>
                  </div>

                  <div className="flex items-center text-sm text-gray-400 mb-2">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{dog.lastSeenLocation}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-400 mb-3">
                    <Calendar className="h-4 w-4 mr-1" />
                    {getTimeAgo(dog.uploadedDate)}
                  </div>

                  <p className="text-sm text-gray-300 mb-4 line-clamp-2">{dog.description}</p>

                  <div className="flex space-x-2">
                    <Link href={`/dog/${dog.id}`} className="flex-1">
                      <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white" size="sm">
                        View Details
                      </Button>
                    </Link>
                    {dog.status === "available" && (
                      <Link href={`/chat?dog=${dog.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-violet-900/30 hover:bg-violet-900/20 bg-transparent text-white"
                        >
                          Chat
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDogs.map((dog) => (
              <Card
                key={dog.id}
                className="border border-violet-900/30 bg-gray-900/50 backdrop-blur-sm hover:bg-gray-800/50 hover:shadow-lg hover:shadow-violet-900/20 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex space-x-4">
                    {/* Image First - Prioritized */}
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={dog.image || "/placeholder.svg"}
                        alt={dog.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg text-white">{dog.name}</h3>
                          <div className="flex items-center text-sm text-gray-400">
                            <MapPin className="h-4 w-4 mr-1" />
                            {dog.lastSeenLocation}
                          </div>
                        </div>
                        <Badge className={getStatusColor(dog.status)}>
                          {dog.status === "available" ? "Available" : "Adopted"}
                        </Badge>
                      </div>
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">{dog.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-violet-600 text-white text-xs">
                              {dog.uploadedBy.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-400">{dog.uploadedBy}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{getTimeAgo(dog.uploadedDate)}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Link href={`/dog/${dog.id}`}>
                            <Button className="bg-violet-600 hover:bg-violet-700 text-white" size="sm">
                              View Details
                            </Button>
                          </Link>
                          {dog.status === "available" && (
                            <Link href={`/chat?dog=${dog.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-violet-900/30 hover:bg-violet-900/20 bg-transparent text-white"
                              >
                                Chat
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
