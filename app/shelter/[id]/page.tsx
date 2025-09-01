"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Building2,
  Shield,
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Grid3X3,
  DollarSign,
  FileText,
  ExternalLink,
  Calendar,
  Heart,
} from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

interface ShelterProfile {
  id: string
  name: string
  email: string
  phone: string
  address: string
  bio: string
  avatar?: string
  website?: string
  establishedDate: string
  isVerified: boolean
  visitingHours: {
    weekdays: string
    weekends: string
  }
  adoptionPolicies: string[]
  stats: {
    dogsRescued: number
    dogsAdopted: number
    totalDonationsReceived: number
    activeVolunteers: number
  }
}

interface Dog {
  id: string
  name: string
  images: string[]
  status: "available" | "adopted"
  uploadedDate: string
  location: string
}

interface Donation {
  id: string
  amount: number
  date: string
  donorName: string
  allocation: string
}

export default function ShelterProfilePage({ params }: { params: { id: string } }) {
  const [shelter, setShelter] = useState<ShelterProfile | null>(null)
  const [shelterDogs, setShelterDogs] = useState<Dog[]>([])
  const [donations, setDonations] = useState<Donation[]>([])

  useEffect(() => {
    loadShelterProfile()
    loadShelterDogs()
    loadDonations()
  }, [params.id])

  const loadShelterProfile = () => {
    // Mock shelter profile - in real app, this would come from API
    const mockShelter: ShelterProfile = {
      id: params.id,
      name: "Chennai Stray Care Foundation",
      email: "contact@chennaistraycare.org",
      phone: "+91 98765 12345",
      address: "123 Anna Salai, T. Nagar, Chennai - 600017",
      bio: "Chennai Stray Care Foundation has been rescuing, rehabilitating, and rehoming stray dogs since 2018. We provide medical care, shelter, and love to abandoned dogs while working to find them permanent homes. Our mission is to reduce the stray dog population through ethical means and create a compassionate community for all animals.",
      avatar: "/animal-shelter-logo.png",
      website: "https://chennaistraycare.org",
      establishedDate: "2018-03-15T00:00:00Z",
      isVerified: true,
      visitingHours: {
        weekdays: "9:00 AM - 6:00 PM",
        weekends: "10:00 AM - 4:00 PM",
      },
      adoptionPolicies: [
        "Adopters must be 21 years or older",
        "Home visit required before adoption",
        "Adoption fee covers vaccination and sterilization",
        "Follow-up visits for first 3 months",
        "Commitment to provide lifetime care",
        "Return policy if unable to care for the dog",
      ],
      stats: {
        dogsRescued: 450,
        dogsAdopted: 380,
        totalDonationsReceived: 125000,
        activeVolunteers: 25,
      },
    }

    setShelter(mockShelter)
  }

  const loadShelterDogs = () => {
    // Mock shelter dogs
    const mockDogs: Dog[] = [
      {
        id: "shelter_dog_1",
        name: "Bella",
        images: ["/images/happy-street-dog.png"],
        status: "available",
        uploadedDate: "2024-01-12T00:00:00Z",
        location: "Chennai Stray Care Foundation",
      },
      {
        id: "shelter_dog_2",
        name: "Rocky",
        images: ["/large-brown-dog.png"],
        status: "available",
        uploadedDate: "2024-01-10T00:00:00Z",
        location: "Chennai Stray Care Foundation",
      },
      {
        id: "shelter_dog_3",
        name: "Daisy",
        images: ["/images/young-puppy.jpeg"],
        status: "adopted",
        uploadedDate: "2024-01-08T00:00:00Z",
        location: "Chennai Stray Care Foundation",
      },
    ]
    setShelterDogs(mockDogs)
  }

  const loadDonations = () => {
    // Mock recent donations
    const mockDonations: Donation[] = [
      {
        id: "shelter_donation_1",
        amount: 5000,
        date: "2024-01-15T00:00:00Z",
        donorName: "Anonymous",
        allocation: "Medical Treatment",
      },
      {
        id: "shelter_donation_2",
        amount: 2000,
        date: "2024-01-14T00:00:00Z",
        donorName: "Priya S.",
        allocation: "Food & Supplies",
      },
      {
        id: "shelter_donation_3",
        amount: 10000,
        date: "2024-01-12T00:00:00Z",
        donorName: "Raj M.",
        allocation: "Shelter Maintenance",
      },
    ]
    setDonations(mockDonations)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  if (!shelter) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading shelter profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40 paw-shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src="/images/woofsy-logo.png" alt="Woofsy Logo" className="w-8 h-8 rounded-full object-cover" />
              <div>
                <h1 className="text-2xl font-heading font-black text-foreground">Woofsy</h1>
                <p className="text-xs text-muted-foreground">Connecting Paws, Creating Homes</p>
              </div>
            </div>
            <Link href={`/messages?shelter=${shelter.id}`}>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Shelter
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Shelter Header */}
        <Card className="bg-card border border-border paw-shadow rounded-2xl mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              {/* Avatar */}
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={shelter.avatar || "/placeholder.svg"} alt={shelter.name} />
                <AvatarFallback className="text-2xl font-heading font-bold bg-primary/10 text-primary">
                  {shelter.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              {/* Shelter Info */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-heading font-bold text-foreground">{shelter.name}</h2>
                  {shelter.isVerified && (
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified Shelter
                    </Badge>
                  )}
                </div>

                <p className="text-muted-foreground max-w-2xl">{shelter.bio}</p>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{shelter.address}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Phone className="h-4 w-4" />
                    <span>{shelter.phone}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>{shelter.email}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Est. {formatDate(shelter.establishedDate)}</span>
                  </div>
                  {shelter.website && (
                    <a
                      href={shelter.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-primary hover:text-primary/80"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Website</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
              <div className="text-center">
                <div className="text-2xl font-heading font-bold text-foreground">{shelter.stats.dogsRescued}</div>
                <div className="text-sm text-muted-foreground">Dogs Rescued</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-heading font-bold text-primary">{shelter.stats.dogsAdopted}</div>
                <div className="text-sm text-muted-foreground">Dogs Adopted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-heading font-bold text-accent">
                  {formatCurrency(shelter.stats.totalDonationsReceived)}
                </div>
                <div className="text-sm text-muted-foreground">Donations Received</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-heading font-bold text-foreground">{shelter.stats.activeVolunteers}</div>
                <div className="text-sm text-muted-foreground">Active Volunteers</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visiting Hours & Quick Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="bg-card border border-border paw-shadow rounded-2xl">
            <CardHeader>
              <CardTitle className="font-heading font-bold text-card-foreground flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Visiting Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monday - Friday:</span>
                  <span className="font-semibold text-foreground">{shelter.visitingHours.weekdays}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saturday - Sunday:</span>
                  <span className="font-semibold text-foreground">{shelter.visitingHours.weekends}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border paw-shadow rounded-2xl">
            <CardHeader>
              <CardTitle className="font-heading font-bold text-card-foreground flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <h4 className="font-heading font-semibold text-foreground mb-1">Interactive Map</h4>
                  <p className="text-sm text-muted-foreground">Map integration coming soon!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shelter Tabs */}
        <Tabs defaultValue="dogs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card border border-border rounded-xl p-1">
            <TabsTrigger value="dogs" className="rounded-lg font-heading font-semibold">
              <Grid3X3 className="h-4 w-4 mr-2" />
              Dogs
            </TabsTrigger>
            <TabsTrigger value="donations" className="rounded-lg font-heading font-semibold">
              <DollarSign className="h-4 w-4 mr-2" />
              Donations
            </TabsTrigger>
            <TabsTrigger value="policies" className="rounded-lg font-heading font-semibold">
              <FileText className="h-4 w-4 mr-2" />
              Policies
            </TabsTrigger>
            <TabsTrigger value="about" className="rounded-lg font-heading font-semibold">
              <Building2 className="h-4 w-4 mr-2" />
              About
            </TabsTrigger>
          </TabsList>

          {/* Dogs Tab */}
          <TabsContent value="dogs" className="space-y-4">
            {shelterDogs.length === 0 ? (
              <Card className="bg-card border border-border paw-shadow rounded-2xl">
                <CardContent className="p-12 text-center">
                  <Grid3X3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-heading font-semibold text-foreground mb-2">No dogs listed</h3>
                  <p className="text-muted-foreground">This shelter hasn't posted any dogs yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {shelterDogs.map((dog) => (
                  <Link key={dog.id} href={`/dog/${dog.id}`}>
                    <Card className="group overflow-hidden bg-card border border-border paw-shadow hover:paw-shadow-lg transition-all duration-200 rounded-2xl">
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
                      <CardContent className="p-3">
                        <h4 className="font-heading font-semibold text-sm text-card-foreground truncate">{dog.name}</h4>
                        <p className="text-xs text-muted-foreground">{formatDate(dog.uploadedDate)}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations" className="space-y-4">
            <Card className="bg-card border border-border paw-shadow rounded-2xl">
              <CardHeader>
                <CardTitle className="font-heading font-bold text-card-foreground flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Recent Donations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {donations.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                      <div>
                        <div className="font-heading font-semibold text-foreground">
                          {formatCurrency(donation.amount)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          by {donation.donorName} • {donation.allocation}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">{formatDate(donation.date)}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-semibold text-foreground">Total Received:</span>
                    <span className="text-xl font-heading font-bold text-primary">
                      {formatCurrency(shelter.stats.totalDonationsReceived)}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <Link href="/donate">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
                      <Heart className="h-4 w-4 mr-2" />
                      Support This Shelter
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies" className="space-y-4">
            <Card className="bg-card border border-border paw-shadow rounded-2xl">
              <CardHeader>
                <CardTitle className="font-heading font-bold text-card-foreground flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Adoption Policies & Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shelter.adoptionPolicies.map((policy, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <p className="text-muted-foreground">{policy}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    For more information about our adoption process, please contact us directly or visit our shelter
                    during visiting hours.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-4">
            <Card className="bg-card border border-border paw-shadow rounded-2xl">
              <CardHeader>
                <CardTitle className="font-heading font-bold text-card-foreground flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  About Our Shelter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-heading font-semibold text-foreground mb-2">Our Mission</h4>
                    <p className="text-muted-foreground">{shelter.bio}</p>
                  </div>

                  <div>
                    <h4 className="font-heading font-semibold text-foreground mb-2">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{shelter.address}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{shelter.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{shelter.email}</span>
                      </div>
                      {shelter.website && (
                        <a
                          href={shelter.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-primary hover:text-primary/80"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>{shelter.website}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-heading font-semibold text-foreground mb-2">Shelter Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Established:</span>
                        <span className="text-foreground">{formatDate(shelter.establishedDate)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Verification status:</span>
                        <Badge
                          className={
                            shelter.isVerified
                              ? "bg-primary/20 text-primary border-primary/30"
                              : "bg-muted text-muted-foreground border-border"
                          }
                        >
                          {shelter.isVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Active volunteers:</span>
                        <span className="text-foreground">{shelter.stats.activeVolunteers}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
