"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Search, Filter, MapPin, Calendar, Heart, MessageCircle, X, SlidersHorizontal, Map } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

interface Dog {
  id: string
  name: string
  images: string[]
  location: string
  lastSeenLocation: string
  description: string
  uploadedBy: string
  uploadedDate: string
  status: "available" | "adopted"
  mood: "friendly" | "aggressive" | "unsure"
  wounds: "yes" | "no" | "unsure"
  coatColor?: string
  size?: string
  age?: string
  gender?: string
  isStray: boolean
  likes?: number
  comments?: Array<{
    id: string
    user: string
    text: string
    timestamp: string
  }>
}

interface SearchFilters {
  query: string
  location: string
  coatColor: string
  size: string
  age: string
  gender: string
  mood: string
  wounds: string
  status: string
  dogType: string // stray or shelter
  mediaType: string // photos, videos, all
  sortBy: string
}

export default function SearchPage() {
  const [dogs, setDogs] = useState<Dog[]>([])
  const [filteredDogs, setFilteredDogs] = useState<Dog[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    location: "",
    coatColor: "",
    size: "",
    age: "",
    gender: "",
    mood: "",
    wounds: "",
    status: "available", // Default to available dogs
    dogType: "",
    mediaType: "all",
    sortBy: "newest",
  })

  useEffect(() => {
    loadDogs()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [dogs, filters])

  const loadDogs = () => {
    const uploadedDogs = JSON.parse(localStorage.getItem("uploadedDogs") || "[]")

    // Enhanced admin placeholder dogs with complete metadata
    const adminPlaceholderDogs: Dog[] = [
      {
        id: "admin_1",
        name: "Happy Street Friend",
        images: ["/images/happy-street-dog.png"],
        location: "T. Nagar, Chennai",
        lastSeenLocation: "Near local shops, T. Nagar Main Road",
        description:
          "This incredibly happy and friendly dog has been living near the local shops. Always greets people with a big smile and wagging tail. The shopkeepers feed him regularly and he's become a beloved part of the community.",
        uploadedBy: "Admin",
        uploadedDate: "2024-01-15T10:30:00Z",
        status: "available",
        mood: "friendly",
        wounds: "no",
        coatColor: "Brown",
        size: "Medium",
        age: "Adult",
        gender: "Male",
        isStray: true,
        likes: 12,
        comments: [
          { id: "1", user: "DogLover123", text: "Such a sweet face! Is he still available?", timestamp: "2024-01-16" },
          {
            id: "2",
            user: "Chennai_Helper",
            text: "I know this dog! He's so friendly with kids.",
            timestamp: "2024-01-16",
          },
        ],
      },
      {
        id: "admin_2",
        name: "Puppy Siblings",
        images: ["/images/two-puppies.jpeg"],
        location: "Velachery, Chennai",
        lastSeenLocation: "Playing in the vacant lot behind residential area",
        description:
          "These two adorable puppies were found together and are inseparable. The brown one is more adventurous while the lighter one is gentle and calm. They play together all day and sleep cuddled up. Looking for a home that can take both.",
        uploadedBy: "Admin",
        uploadedDate: "2024-01-14T14:20:00Z",
        status: "available",
        mood: "friendly",
        wounds: "unsure",
        coatColor: "Mixed",
        size: "Small",
        age: "Puppy",
        gender: "Unknown",
        isStray: true,
        likes: 24,
        comments: [
          { id: "3", user: "PuppyLover", text: "Oh my heart! Can they be adopted together?", timestamp: "2024-01-15" },
          { id: "4", user: "FamilySeeker", text: "We have space for both! How can we help?", timestamp: "2024-01-15" },
          {
            id: "5",
            user: "VetHelper",
            text: "They look healthy! Have they been checked by a vet?",
            timestamp: "2024-01-15",
          },
        ],
      },
      {
        id: "admin_3",
        name: "Little Explorer",
        images: ["/images/young-puppy.jpeg"],
        location: "Anna Nagar, Chennai",
        lastSeenLocation: "Near the community feeding spot, Anna Nagar",
        description:
          "This curious young puppy has been coming to the community feeding area daily. Very alert and intelligent, always watching everything with those bright eyes. Gets along well with other dogs and loves human attention.",
        uploadedBy: "Admin",
        uploadedDate: "2024-01-13T09:15:00Z",
        status: "available",
        mood: "friendly",
        wounds: "no",
        coatColor: "Light Brown",
        size: "Small",
        age: "Young",
        gender: "Female",
        isStray: true,
        likes: 8,
        comments: [
          {
            id: "6",
            user: "AnnaResident",
            text: "I see this little one every morning! So smart.",
            timestamp: "2024-01-14",
          },
        ],
      },
      {
        id: "admin_4",
        name: "Gentle Giant",
        images: ["/large-brown-dog.png"],
        location: "Adyar, Chennai",
        lastSeenLocation: "Near Adyar River, under the bridge",
        description:
          "A large, gentle dog who has been living near the river. Despite his size, he's very calm and gentle. Has some minor wounds that need attention but is otherwise healthy.",
        uploadedBy: "Admin",
        uploadedDate: "2024-01-12T16:45:00Z",
        status: "available",
        mood: "friendly",
        wounds: "yes",
        coatColor: "Black",
        size: "Large",
        age: "Adult",
        gender: "Male",
        isStray: true,
        likes: 5,
        comments: [],
      },
    ]

    const allDogs = [...uploadedDogs, ...adminPlaceholderDogs]
    setDogs(allDogs)
  }

  const applyFilters = () => {
    let filtered = [...dogs]

    // Text search
    if (filters.query.trim()) {
      const query = filters.query.toLowerCase()
      filtered = filtered.filter(
        (dog) =>
          dog.name?.toLowerCase().includes(query) ||
          dog.location.toLowerCase().includes(query) ||
          dog.lastSeenLocation.toLowerCase().includes(query) ||
          dog.description.toLowerCase().includes(query) ||
          dog.coatColor?.toLowerCase().includes(query) ||
          dog.uploadedBy.toLowerCase().includes(query),
      )
    }

    // Location filter
    if (filters.location.trim()) {
      const location = filters.location.toLowerCase()
      filtered = filtered.filter(
        (dog) => dog.location.toLowerCase().includes(location) || dog.lastSeenLocation.toLowerCase().includes(location),
      )
    }

    // Coat color filter
    if (filters.coatColor) {
      filtered = filtered.filter((dog) => dog.coatColor === filters.coatColor)
    }

    // Size filter
    if (filters.size) {
      filtered = filtered.filter((dog) => dog.size === filters.size)
    }

    // Age filter
    if (filters.age) {
      filtered = filtered.filter((dog) => dog.age === filters.age)
    }

    // Gender filter
    if (filters.gender) {
      filtered = filtered.filter((dog) => dog.gender === filters.gender)
    }

    // Mood/temperament filter
    if (filters.mood) {
      filtered = filtered.filter((dog) => dog.mood === filters.mood)
    }

    // Wounds filter
    if (filters.wounds) {
      filtered = filtered.filter((dog) => dog.wounds === filters.wounds)
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((dog) => dog.status === filters.status)
    }

    // Dog type filter (stray vs shelter)
    if (filters.dogType) {
      const isStray = filters.dogType === "stray"
      filtered = filtered.filter((dog) => dog.isStray === isStray)
    }

    // Media type filter (for future video support)
    // Currently all are photos, but structure is ready for videos

    // Sorting
    switch (filters.sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.uploadedDate).getTime() - new Date(a.uploadedDate).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.uploadedDate).getTime() - new Date(b.uploadedDate).getTime())
        break
      case "most_discussed":
        filtered.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0))
        break
      case "most_liked":
        filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0))
        break
      case "most_urgent":
        // Prioritize dogs with wounds
        filtered.sort((a, b) => {
          if (a.wounds === "yes" && b.wounds !== "yes") return -1
          if (b.wounds === "yes" && a.wounds !== "yes") return 1
          return new Date(b.uploadedDate).getTime() - new Date(a.uploadedDate).getTime()
        })
        break
      default:
        break
    }

    setFilteredDogs(filtered)
  }

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      query: "",
      location: "",
      coatColor: "",
      size: "",
      age: "",
      gender: "",
      mood: "",
      wounds: "",
      status: "available",
      dogType: "",
      mediaType: "all",
      sortBy: "newest",
    })
  }

  const getActiveFilterCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === "status" && value === "available") return false // Default value
      if (key === "mediaType" && value === "all") return false // Default value
      if (key === "sortBy") return false // Not a filter
      return value.trim() !== ""
    }).length
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40 paw-shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 mb-4">
            <img src="/images/woofsy-logo.png" alt="Woofsy Logo" className="w-8 h-8 rounded-full object-cover" />
            <div>
              <h1 className="text-2xl font-heading font-black text-foreground">Woofsy</h1>
              <p className="text-xs text-muted-foreground">Connecting Paws, Creating Homes</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, location, color, or description..."
              value={filters.query}
              onChange={(e) => updateFilter("query", e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Filter Toggle & Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="bg-transparent rounded-xl"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {getActiveFilterCount() > 0 && (
                <Badge className="ml-2 bg-primary text-primary-foreground">{getActiveFilterCount()}</Badge>
              )}
            </Button>
            <Button variant="outline" onClick={() => setShowMap(!showMap)} className="bg-transparent rounded-xl">
              <Map className="h-4 w-4 mr-2" />
              {showMap ? "List View" : "Map View"}
            </Button>
            {getActiveFilterCount() > 0 && (
              <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {filteredDogs.length} of {dogs.length} dogs
          </p>
        </div>

        {/* Active Filter Chips */}
        {getActiveFilterCount() > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(filters).map(([key, value]) => {
              if (key === "status" && value === "available") return null
              if (key === "mediaType" && value === "all") return null
              if (key === "sortBy") return null
              if (!value.trim()) return null

              const displayValue = key === "dogType" ? (value === "stray" ? "Stray Dogs" : "Shelter Dogs") : value
              const displayKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")

              return (
                <Badge
                  key={key}
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20 rounded-xl cursor-pointer hover:bg-primary/20"
                  onClick={() => updateFilter(key as keyof SearchFilters, "")}
                >
                  {displayKey}: {displayValue}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )
            })}
          </div>
        )}

        {/* Map View */}
        {showMap && (
          <Card className="bg-card border border-border paw-shadow rounded-2xl mb-6">
            <CardContent className="p-6">
              <div className="aspect-video bg-muted rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <h3 className="font-heading font-semibold text-foreground mb-1">Interactive Map</h3>
                  <p className="text-sm text-muted-foreground">
                    Map integration coming soon! View dog locations and find nearby dogs.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <Card className="bg-card border border-border paw-shadow rounded-2xl mb-6">
            <CardHeader>
              <CardTitle className="font-heading font-bold text-card-foreground flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Search Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Location */}
                <div className="space-y-2">
                  <Label className="font-heading font-semibold">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="City, area, or landmark"
                      value={filters.location}
                      onChange={(e) => updateFilter("location", e.target.value)}
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>

                {/* Coat Color */}
                <div className="space-y-2">
                  <Label className="font-heading font-semibold">Coat Color</Label>
                  <Select value={filters.coatColor} onValueChange={(value) => updateFilter("coatColor", value)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Any color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any color</SelectItem>
                      <SelectItem value="Brown">Brown</SelectItem>
                      <SelectItem value="Black">Black</SelectItem>
                      <SelectItem value="White">White</SelectItem>
                      <SelectItem value="Golden">Golden</SelectItem>
                      <SelectItem value="Light Brown">Light Brown</SelectItem>
                      <SelectItem value="Mixed">Mixed</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Size */}
                <div className="space-y-2">
                  <Label className="font-heading font-semibold">Size</Label>
                  <Select value={filters.size} onValueChange={(value) => updateFilter("size", value)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Any size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any size</SelectItem>
                      <SelectItem value="Small">Small</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <Label className="font-heading font-semibold">Age</Label>
                  <Select value={filters.age} onValueChange={(value) => updateFilter("age", value)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Any age" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any age</SelectItem>
                      <SelectItem value="Puppy">Puppy (0-1 year)</SelectItem>
                      <SelectItem value="Young">Young (1-3 years)</SelectItem>
                      <SelectItem value="Adult">Adult (3-7 years)</SelectItem>
                      <SelectItem value="Senior">Senior (7+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label className="font-heading font-semibold">Gender</Label>
                  <Select value={filters.gender} onValueChange={(value) => updateFilter("gender", value)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Any gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any gender</SelectItem>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Temperament */}
                <div className="space-y-2">
                  <Label className="font-heading font-semibold">Temperament</Label>
                  <Select value={filters.mood} onValueChange={(value) => updateFilter("mood", value)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Any temperament" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any temperament</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                      <SelectItem value="unsure">Unsure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Wound Status */}
                <div className="space-y-2">
                  <Label className="font-heading font-semibold">Wound Status</Label>
                  <Select value={filters.wounds} onValueChange={(value) => updateFilter("wounds", value)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Any condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any condition</SelectItem>
                      <SelectItem value="no">No wounds</SelectItem>
                      <SelectItem value="yes">Has wounds</SelectItem>
                      <SelectItem value="unsure">Unsure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label className="font-heading font-semibold">Availability</Label>
                  <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Any status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="adopted">Adopted</SelectItem>
                      <SelectItem value="any">All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dog Type */}
                <div className="space-y-2">
                  <Label className="font-heading font-semibold">Dog Type</Label>
                  <Select value={filters.dogType} onValueChange={(value) => updateFilter("dogType", value)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Stray or Shelter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Both</SelectItem>
                      <SelectItem value="stray">Stray Dogs</SelectItem>
                      <SelectItem value="shelter">Shelter Dogs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sort Options */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-between">
                  <Label className="font-heading font-semibold">Sort by</Label>
                  <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
                    <SelectTrigger className="w-48 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest first</SelectItem>
                      <SelectItem value="oldest">Oldest first</SelectItem>
                      <SelectItem value="most_discussed">Most discussed</SelectItem>
                      <SelectItem value="most_liked">Most liked</SelectItem>
                      <SelectItem value="most_urgent">Most urgent (wounds)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {!showMap && filteredDogs.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-heading font-semibold text-foreground mb-2">No dogs found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search filters to find more dogs.</p>
            <Button
              onClick={clearFilters}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          !showMap && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDogs.map((dog) => (
                <Card
                  key={dog.id}
                  className="group overflow-hidden bg-card border border-border paw-shadow hover:paw-shadow-lg transition-all duration-200 rounded-2xl"
                >
                  {/* Image */}
                  <div className="aspect-square relative">
                    <img
                      src={dog.images[0] || "/placeholder.svg?height=300&width=300&query=dog"}
                      alt={dog.name || "Dog"}
                      className="w-full h-full object-cover"
                    />
                    <Badge
                      className={`absolute top-3 right-3 ${
                        dog.status === "available"
                          ? "bg-primary/20 text-primary border-primary/30"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {dog.status === "available" ? "Available" : "Adopted"}
                    </Badge>
                    {dog.wounds === "yes" && (
                      <Badge className="absolute top-3 left-3 bg-destructive/20 text-destructive border-destructive/30">
                        Needs Care
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Name and Type */}
                      <div className="flex items-center justify-between">
                        <h3 className="font-heading font-bold text-lg text-card-foreground">
                          {dog.name || "Unknown stray"}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {dog.isStray ? "Stray" : "Shelter"}
                        </Badge>
                      </div>

                      {/* Location */}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{dog.lastSeenLocation}</span>
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-1">
                        {dog.coatColor && (
                          <Badge variant="outline" className="text-xs bg-muted/50 text-muted-foreground border-border">
                            {dog.coatColor}
                          </Badge>
                        )}
                        {dog.size && (
                          <Badge variant="outline" className="text-xs bg-muted/50 text-muted-foreground border-border">
                            {dog.size}
                          </Badge>
                        )}
                        {dog.age && (
                          <Badge variant="outline" className="text-xs bg-muted/50 text-muted-foreground border-border">
                            {dog.age}
                          </Badge>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground line-clamp-2">{dog.description}</p>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Heart className="h-3 w-3" />
                            <span>{dog.likes || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-3 w-3" />
                            <span>{dog.comments?.length || 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(dog.uploadedDate)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Link href={`/dog/${dog.id}`} className="flex-1">
                          <Button
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold rounded-xl"
                            size="sm"
                          >
                            View Details
                          </Button>
                        </Link>
                        {dog.status === "available" && (
                          <Link href={`/messages?dog=${dog.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-border hover:bg-muted bg-transparent rounded-xl"
                            >
                              Chat
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
