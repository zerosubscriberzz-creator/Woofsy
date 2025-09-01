"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, MessageCircle, Sparkles, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { realTimeService, type AppStats } from "@/lib/real-time-service"

interface HomePageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function HomePage({ searchParams }: HomePageProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [stats, setStats] = useState({
    members: 0,
    dogsHelped: 6, // Starting value for dogs helped counter
    fundsRaised: 0,
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated")
    setIsAuthenticated(!!authStatus)

    const unsubscribe = realTimeService.subscribe("homepage", (realTimeStats: AppStats) => {
      const dogsHelped = Math.max(6, realTimeStats.totalDogs + realTimeStats.adoptedDogs)
      setStats({
        members: realTimeStats.totalMembers,
        dogsHelped,
        fundsRaised: realTimeStats.totalDonations,
      })
    })

    // Force initial update
    realTimeService.forceUpdate()

    return () => {
      unsubscribe()
    }
  }, [])

  const handleUploadClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault()
      toast({
        title: "Account Required",
        description: "Please sign up or log in to upload dogs and help them find homes.",
        variant: "destructive",
      })
      router.push("/register")
    }
  }

  const handleInteractiveFeatureClick = (e: React.MouseEvent, feature: string) => {
    if (!isAuthenticated) {
      e.preventDefault()
      toast({
        title: "Account Required",
        description: `Please sign up or log in to access ${feature}.`,
        variant: "destructive",
      })
      router.push("/register")
    }
  }

  const handleLogoClick = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="donation-gradient text-white p-6 text-center vibrant-shadow relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="bg-white/20 p-2 rounded-full playful-paw">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="font-heading font-black text-2xl">Help Dogs, Transparently</span>
            <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
          </div>
          <p className="text-lg font-medium mb-2 max-w-2xl mx-auto">
            ₹{stats.fundsRaised.toLocaleString()} raised so far! Transparent donations are used for dog welfare, shelter
            homes, and app maintenance.
          </p>
          <p className="text-sm opacity-90 mb-4">Example: ₹100 feeds a dog for one day.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/donate">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-bold px-8 py-3 text-lg rounded-xl vibrant-shadow playful-paw"
              >
                💝 Donate Now & Make Magic Happen
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {isAuthenticated && (
        <header className="bg-card border-b border-border sticky top-0 z-40 paw-shadow">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={handleLogoClick}>
              <img
                src="/images/purple-paw-icon.png"
                alt="Woofsy Logo"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h1 className="text-2xl font-heading font-black text-foreground">Woofsy</h1>
                <p className="text-xs text-muted-foreground">Connecting Paws, Creating Homes</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="#" className="text-foreground hover:text-primary font-medium transition-colors">
                Home
              </Link>
              <Link href="/feed" className="text-foreground hover:text-primary font-medium transition-colors">
                Browse Dogs
              </Link>
              <Link
                href="/upload"
                className="text-foreground hover:text-primary font-medium transition-colors"
                onClick={(e) => handleUploadClick(e)}
              >
                Upload
              </Link>
              <Link
                href="/messages"
                className="text-foreground hover:text-primary font-medium transition-colors"
                onClick={(e) => handleInteractiveFeatureClick(e, "community chat")}
              >
                Community
              </Link>
              <Link href="/donate" className="text-foreground hover:text-primary font-medium transition-colors">
                Donate
              </Link>
            </nav>
            <div className="space-x-3">
              <Link href="/dashboard">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </header>
      )}

      <section className="py-20 px-6 bg-card">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                {!isAuthenticated && (
                  <div className="flex items-center gap-2 mb-4">
                    <img
                      src="/images/purple-paw-icon.png"
                      alt="Woofsy Logo"
                      className="w-16 h-16 rounded-full object-cover vibrant-shadow cursor-pointer playful-paw"
                      onClick={handleLogoClick}
                    />
                    <div>
                      <h1 className="text-3xl font-heading font-black text-foreground">Woofsy</h1>
                      <p className="text-sm text-muted-foreground">Connecting Paws, Creating Homes</p>
                    </div>
                  </div>
                )}
                <h2 className="text-5xl md:text-6xl font-heading font-black text-card-foreground leading-tight">
                  Help dogs find their
                  <span className="text-primary"> forever homes</span>
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed font-sans">
                  Connect with a community of dog lovers. Upload, browse, and help stray dogs find the loving families
                  they deserve.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                {!isAuthenticated ? (
                  <Link href="/register">
                    <Button className="modern-gradient text-white hover:opacity-90 font-medium px-8 py-3 text-lg rounded-xl vibrant-shadow">
                      Join Community
                      <Star className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="outline"
                    className="border-border text-foreground hover:bg-muted font-medium px-8 py-3 text-lg bg-transparent rounded-xl"
                    onClick={handleUploadClick}
                  >
                    Upload a Dog
                  </Button>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img
                    src="/cute-stray-puppies-playing-together.png"
                    alt="Stray Puppies"
                    className="rounded-2xl paw-shadow-lg w-full h-48 object-cover"
                  />
                  <div className="bg-primary text-primary-foreground rounded-2xl p-6 paw-shadow-lg">
                    <div className="text-center">
                      <Heart className="h-8 w-8 mx-auto mb-2" />
                      <p className="font-heading font-bold text-2xl">{stats.dogsHelped}</p>
                      <p className="text-sm opacity-90">Dogs Helped</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <img
                    src="/adorable-stray-dog-puppies-looking-for-homes.png"
                    alt="Stray Puppies Looking for Homes"
                    className="rounded-2xl paw-shadow-lg w-full h-48 object-cover"
                  />
                  <img
                    src="/small-stray-puppy-with-hopeful-eyes.png"
                    alt="Small Stray Puppy"
                    className="rounded-2xl paw-shadow-lg w-full h-32 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-heading font-bold text-foreground mb-4">How Woofsy Works</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-sans">
              Our platform makes it easy to help stray dogs find loving homes through our simple three-step process.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="dark-card paw-shadow hover:paw-shadow-lg transition-all duration-200 rounded-2xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 playful-paw">
                  <img
                    src="/images/purple-paw-icon.png"
                    alt="Upload Paw"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </div>
                <h4 className="text-xl font-heading font-semibold text-card-foreground mb-4">Upload</h4>
                <p className="text-muted-foreground leading-relaxed font-sans">
                  Found a stray dog? Upload their photo and details to help them find a home. Our AI verifies each
                  submission.
                </p>
              </CardContent>
            </Card>

            <Card className="dark-card paw-shadow hover:paw-shadow-lg transition-all duration-200 rounded-2xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6 playful-paw">
                  <MessageCircle className="h-8 w-8 text-secondary" />
                </div>
                <h4 className="text-xl font-heading font-semibold text-card-foreground mb-4">Connect</h4>
                <p className="text-muted-foreground leading-relaxed font-sans">
                  Chat with potential adopters and other community members. Build relationships and ensure the best
                  matches.
                </p>
              </CardContent>
            </Card>

            <Card className="dark-card paw-shadow hover:paw-shadow-lg transition-all duration-200 rounded-2xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 playful-paw">
                  <img
                    src="/images/purple-paw-icon.png"
                    alt="Adopt Paw"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </div>
                <h4 className="text-xl font-heading font-semibold text-card-foreground mb-4">Adopt</h4>
                <p className="text-muted-foreground leading-relaxed font-sans">
                  Help dogs find their forever homes. Every successful adoption creates a beautiful story of love and
                  care.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-card">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-heading font-bold text-card-foreground mb-4">Our Impact</h3>
            <p className="text-xl text-muted-foreground">
              Together, we're making a difference in the lives of stray dogs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl font-heading font-black text-red-500 mb-2 flex items-center justify-center gap-2">
                {stats.members}
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-lg font-medium text-card-foreground mb-2">Community Members</p>
              <p className="text-muted-foreground">Growing every day</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-heading font-black text-secondary mb-2 flex items-center justify-center gap-2">
                {stats.dogsHelped}
                <div className="w-3 h-3 bg-secondary rounded-full animate-pulse"></div>
              </div>
              <p className="text-lg font-medium text-card-foreground mb-2">Dogs Helped</p>
              <p className="text-muted-foreground">Finding forever homes</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-heading font-black text-green-500 mb-2 flex items-center justify-center gap-2">
                ₹{stats.fundsRaised.toLocaleString()}
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-lg font-medium text-card-foreground mb-2">Funds Raised</p>
              <p className="text-muted-foreground">Supporting our cause</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-muted text-foreground py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <img
                  src="/images/purple-paw-icon.png"
                  alt="Woofsy Logo"
                  className="w-8 h-8 rounded-lg object-cover cursor-pointer playful-paw"
                  onClick={handleLogoClick}
                />
                <span className="text-xl font-heading font-bold">Woofsy</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Connecting stray dogs with loving families through our community-driven platform.
              </p>
            </div>
            <div>
              <h4 className="font-heading font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/feed" className="hover:text-foreground transition-colors">
                    Browse Dogs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/upload"
                    className="hover:text-foreground transition-colors"
                    onClick={(e) => handleUploadClick(e)}
                  >
                    Upload
                  </Link>
                </li>
                <li>
                  <Link
                    href="/messages"
                    className="hover:text-foreground transition-colors"
                    onClick={(e) => handleInteractiveFeatureClick(e, "community")}
                  >
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="/donate" className="hover:text-foreground transition-colors">
                    Donate
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/support/help-center" className="hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/support/safety-guidelines" className="hover:text-foreground transition-colors">
                    Safety Guidelines
                  </Link>
                </li>
                <li>
                  <Link href="/support/contact-us" className="hover:text-foreground transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/support/report-issue" className="hover:text-foreground transition-colors">
                    Report Issue
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/community/success-stories" className="hover:text-foreground transition-colors">
                    Success Stories
                  </Link>
                </li>
                <li>
                  <Link href="/community/adoption-resources" className="hover:text-foreground transition-colors">
                    Adoption Resources
                  </Link>
                </li>
                <li>Newsletter</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Woofsy. Made with love for every soul seeking a home.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
