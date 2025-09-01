"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DogPostCard } from "@/components/dog-post-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Sparkles, ArrowRight } from "lucide-react"
import { DogPostSkeleton, ErrorFallback } from "@/components/loading-states"
import { ErrorBoundary } from "@/components/error-boundary"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

let realTimeDB: any = null
let Dog: any = null

export const dynamic = "force-dynamic"

export default function FeedPage() {
  const [dogs, setDogs] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const POSTS_PER_PAGE = 10

  useEffect(() => {
    const initializeClient = async () => {
      if (typeof window !== "undefined") {
        const { realTimeDB: rtdb, Dog: DogType } = await import("@/lib/real-time-database")
        realTimeDB = rtdb
        Dog = DogType
        setIsClient(true)
      }
    }

    initializeClient()
  }, [])

  useEffect(() => {
    if (isClient && realTimeDB) {
      initializeFeed()
    }
  }, [isClient])

  useEffect(() => {
    if (!isClient || !realTimeDB) return

    const unsubscribeDogsUpdated = realTimeDB.subscribe("dogsUpdated", (updatedDogs: any[]) => {
      setDogs(updatedDogs.slice(0, (page + 1) * POSTS_PER_PAGE))
    })

    const unsubscribeDogCreated = realTimeDB.subscribe("dogCreated", (newDog: any) => {
      setDogs((prevDogs) => [newDog, ...prevDogs])
      toast({
        title: "New Dog Posted!",
        description: `${newDog.name} is looking for a home`,
      })
    })

    const unsubscribeDogUpdated = realTimeDB.subscribe("dogUpdated", (updatedDog: any) => {
      setDogs((prevDogs) => prevDogs.map((dog) => (dog.id === updatedDog.id ? updatedDog : dog)))
    })

    return () => {
      unsubscribeDogsUpdated()
      unsubscribeDogCreated()
      unsubscribeDogUpdated()
    }
  }, [page, toast, isClient])

  const initializeFeed = async () => {
    if (typeof window === "undefined" || !realTimeDB) return

    try {
      setLoading(true)
      setError(null)

      const isAuthenticated = localStorage.getItem("isAuthenticated")
      if (!isAuthenticated) {
        router.push("/login")
        return
      }

      const userData = localStorage.getItem("currentUser")
      if (userData) {
        setUser(JSON.parse(userData))
      }

      await loadInitialDogs()
    } catch (err) {
      console.error("[v0] Error initializing feed:", err)
      setError("Failed to load the feed. Please check your connection and try again.")
      toast({
        title: "Loading Error",
        description: "Unable to load dog posts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadInitialDogs = async () => {
    if (!realTimeDB) return

    try {
      const initialDogs = await realTimeDB.getDogs(POSTS_PER_PAGE, 0)
      setDogs(initialDogs)
      setHasMore(initialDogs.length === POSTS_PER_PAGE)
      setPage(0)
    } catch (err) {
      console.error("[v0] Error loading initial dogs:", err)
      throw new Error("Failed to load dog data")
    }
  }

  const loadMoreDogs = async () => {
    if (loadingMore || !hasMore || !realTimeDB) return

    try {
      setLoadingMore(true)
      const nextPage = page + 1
      const moreDogs = await realTimeDB.getDogs(POSTS_PER_PAGE, nextPage * POSTS_PER_PAGE)

      if (moreDogs.length > 0) {
        setDogs((prevDogs) => [...prevDogs, ...moreDogs])
        setPage(nextPage)
        setHasMore(moreDogs.length === POSTS_PER_PAGE)
      } else {
        setHasMore(false)
      }
    } catch (err) {
      console.error("[v0] Error loading more dogs:", err)
      toast({
        title: "Loading Error",
        description: "Unable to load more posts.",
        variant: "destructive",
      })
    } finally {
      setLoadingMore(false)
    }
  }

  const handleLike = useCallback(
    async (dogId: string) => {
      if (!user || !realTimeDB) return

      try {
        const liked = await realTimeDB.likeDog(dogId, user.id || user.username)

        toast({
          title: liked ? "Liked!" : "Unliked",
          description: liked ? "Your support helps this dog get noticed." : "Like removed",
        })
      } catch (err) {
        console.error("[v0] Error liking post:", err)
        toast({
          title: "Action Failed",
          description: "Unable to update like. Please try again.",
          variant: "destructive",
        })
      }
    },
    [user, toast],
  )

  const handleComment = useCallback(
    async (dogId: string, comment: string) => {
      if (!user || !comment.trim() || !realTimeDB) return

      try {
        await realTimeDB.addComment(dogId, user.id || user.username, comment.trim())

        toast({
          title: "Comment Added!",
          description: "Your comment has been posted.",
        })
      } catch (err) {
        console.error("[v0] Error adding comment:", err)
        toast({
          title: "Comment Failed",
          description: "Unable to post comment. Please try again.",
          variant: "destructive",
        })
      }
    },
    [user, toast],
  )

  const handleAdopt = useCallback(
    async (dogId: string) => {
      if (!user || !realTimeDB) return

      try {
        await realTimeDB.requestAdoption(dogId, user.id || user.username)
        router.push(`/messages?dog=${dogId}`)
      } catch (err) {
        console.error("[v0] Error requesting adoption:", err)
        toast({
          title: "Request Failed",
          description: "Unable to start adoption process. Please try again.",
          variant: "destructive",
        })
      }
    },
    [user, router, toast],
  )

  const handleMarkAdopted = useCallback(
    async (dogId: string) => {
      if (!realTimeDB) return

      try {
        await realTimeDB.updateDog(dogId, { status: "adopted" })

        toast({
          title: "Marked as Adopted!",
          description: "Congratulations on helping this dog find a home!",
        })
      } catch (err) {
        console.error("[v0] Error marking as adopted:", err)
        toast({
          title: "Update Failed",
          description: "Unable to update adoption status. Please try again.",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  useEffect(() => {
    if (!isClient) return

    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        loadMoreDogs()
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [loadingMore, hasMore, page, isClient])

  if (!isClient || loading || !realTimeDB) {
    return (
      <div className="min-h-screen bg-background pb-20">
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
              100% of donations are transparently tracked and used for dog welfare and to keep this app running.
            </p>
            <p className="text-sm opacity-90 mb-4">Example: ₹100 feeds a dog for one day.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/donate">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-heading font-bold px-8 py-3 text-lg rounded-xl vibrant-shadow playful-paw"
                >
                  💝 Donate Now & Make Magic Happen
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <header className="bg-card border-b border-border sticky top-[120px] z-30 paw-shadow">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push("/")}>
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
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 max-w-lg">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <DogPostSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pb-20">
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
              100% of donations are transparently tracked and used for dog welfare and to keep this app running.
            </p>
            <p className="text-sm opacity-90 mb-4">Example: ₹100 feeds a dog for one day.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/donate">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-heading font-bold px-8 py-3 text-lg rounded-xl vibrant-shadow playful-paw"
                >
                  💝 Donate Now & Make Magic Happen
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-lg">
          <ErrorFallback
            error={new Error(error)}
            resetError={initializeFeed}
            title="Unable to Load Feed"
            description={error}
          />
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background pb-20">
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
              100% of donations are transparently tracked and used for dog welfare and to keep this app running.
            </p>
            <p className="text-sm opacity-90 mb-4">Example: ₹100 feeds a dog for one day.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/donate">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-heading font-bold px-8 py-3 text-lg rounded-xl vibrant-shadow playful-paw"
                >
                  💝 Donate Now & Make Magic Happen
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <header className="bg-card border-b border-border sticky top-[120px] z-30 paw-shadow">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push("/")}>
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
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 max-w-lg">
          {dogs.length === 0 ? (
            <Card className="dark-card paw-shadow-lg rounded-2xl">
              <CardContent className="text-center py-16">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 playful-paw">
                  <img
                    src="/images/purple-paw-icon.png"
                    alt="No Posts Paw"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-heading font-bold text-card-foreground mb-4">No posts yet</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Be the first to help a stray dog find a loving home!
                </p>
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold px-8 py-3 rounded-xl paw-shadow transition-all duration-200 hover:scale-105"
                  onClick={() => router.push("/upload")}
                >
                  Upload First Dog
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {dogs.map((dog) => (
                <DogPostCard
                  key={dog.id}
                  {...dog}
                  onLike={() => handleLike(dog.id)}
                  onComment={(comment) => handleComment(dog.id, comment)}
                  onAdopt={() => handleAdopt(dog.id)}
                  onMarkAdopted={() => handleMarkAdopted(dog.id)}
                  canMarkAdopted={user?.username === dog.uploadedBy || dog.uploadedBy === "Admin"}
                  currentUserId={user?.id || user?.username}
                />
              ))}

              {loadingMore && (
                <div className="py-8">
                  <DogPostSkeleton />
                </div>
              )}

              {!hasMore && dogs.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You've seen all the posts!</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="fixed bottom-24 right-6 z-50">
          <Button
            onClick={() => router.push("/upload")}
            className="w-14 h-14 rounded-full modern-gradient text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 vibrant-shadow playful-paw"
          >
            {/* Replaced Plus icon with new purple paw icon */}
            <img src="/images/purple-paw-icon.png" alt="Upload Paw" className="w-6 h-6 rounded-full object-cover" />
          </Button>
        </div>
      </div>
    </ErrorBoundary>
  )
}
