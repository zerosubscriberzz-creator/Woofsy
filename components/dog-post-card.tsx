"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Heart,
  MessageCircle,
  Share,
  MapPin,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Clock,
  Send,
  CheckCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface DogPostProps {
  id: string
  name: string
  images: string[]
  videos?: string[]
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
  isStray: boolean
  likes?: number
  likedBy?: string[]
  comments?: Array<{
    id: string
    user: string
    text: string
    timestamp: string
    avatar?: string
  }>
  shares?: number
  onLike?: () => void
  onComment?: (comment: string) => void
  onShare?: () => void
  onAdopt?: () => void
  onMarkAdopted?: () => void
  canMarkAdopted?: boolean
  currentUserId?: string
}

export function DogPostCard({
  id,
  name,
  images,
  videos = [],
  location,
  lastSeenLocation,
  description,
  uploadedBy,
  uploadedDate,
  status,
  mood,
  wounds,
  coatColor,
  size,
  age,
  isStray,
  likes = 0,
  likedBy = [],
  comments = [],
  shares = 0,
  onLike,
  onComment,
  onShare,
  onAdopt,
  onMarkAdopted,
  canMarkAdopted = false,
  currentUserId,
}: DogPostProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [showAllComments, setShowAllComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isCommenting, setIsCommenting] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const commentInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const allMedia = [...images, ...videos]
  const isLiked = currentUserId ? likedBy.includes(currentUserId) : false

  const handleLike = async () => {
    if (!currentUserId) {
      toast({
        title: "Login Required",
        description: "Please log in to like posts.",
        variant: "destructive",
      })
      return
    }

    try {
      onLike?.()

      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    } catch (error) {
      console.error("[v0] Error liking post:", error)
    }
  }

  const handleComment = async () => {
    if (!currentUserId) {
      toast({
        title: "Login Required",
        description: "Please log in to comment.",
        variant: "destructive",
      })
      return
    }

    if (!newComment.trim()) return

    try {
      setIsCommenting(true)
      await onComment?.(newComment.trim())
      setNewComment("")

      setTimeout(() => {
        setShowAllComments(true)
      }, 100)
    } catch (error) {
      console.error("[v0] Error adding comment:", error)
    } finally {
      setIsCommenting(false)
    }
  }

  const handleShare = async () => {
    try {
      setIsSharing(true)

      if (navigator.share) {
        await navigator.share({
          title: `Help ${name} find a home!`,
          text: `${name} is looking for a loving home. ${description.slice(0, 100)}...`,
          url: `${window.location.origin}/dog/${id}`,
        })
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/dog/${id}`)
        toast({
          title: "Link Copied!",
          description: "Share this link to help this dog find a home.",
        })
      }

      onShare?.()
      setShowShareMenu(false)
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("[v0] Error sharing:", error)
        toast({
          title: "Share Failed",
          description: "Unable to share this post.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSharing(false)
    }
  }

  const nextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % allMedia.length)
  }

  const prevMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length)
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const posted = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "now"
    if (diffInMinutes < 60) return `${diffInMinutes}m`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d`
  }

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "friendly":
        return "bg-secondary/20 text-secondary border-secondary/30"
      case "aggressive":
        return "bg-destructive/20 text-destructive border-destructive/30"
      case "unsure":
        return "bg-muted text-muted-foreground border-border"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getWoundColor = (wounds: string) => {
    switch (wounds) {
      case "yes":
        return "bg-destructive/20 text-destructive border-destructive/30"
      case "no":
        return "bg-secondary/20 text-secondary border-secondary/30"
      case "unsure":
        return "bg-muted text-muted-foreground border-border"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const isVideo = (url: string) => {
    return url.includes(".mp4") || url.includes(".webm") || url.includes(".mov")
  }

  return (
    <div className="bg-card rounded-2xl paw-shadow-lg border border-border overflow-hidden mb-6">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {uploadedBy.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-heading font-semibold text-card-foreground">{uploadedBy}</p>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-3 w-3 mr-1" />
              {location}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge
            className={cn(
              "text-xs font-medium",
              status === "available"
                ? "bg-primary/20 text-primary border-primary/30"
                : "bg-muted text-muted-foreground border-border",
            )}
          >
            {status === "available" ? "Available" : "Adopted"}
          </Badge>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Media Carousel */}
      <div className="relative aspect-square">
        {allMedia.length > 0 ? (
          <>
            {isVideo(allMedia[currentMediaIndex]) ? (
              <video src={allMedia[currentMediaIndex]} className="w-full h-full object-cover" controls playsInline />
            ) : (
              <img
                src={allMedia[currentMediaIndex] || "/placeholder.svg?height=400&width=400&query=dog"}
                alt={`${name} - Media ${currentMediaIndex + 1}`}
                className="w-full h-full object-cover"
              />
            )}
          </>
        ) : (
          <img src="/happy-golden-retriever.png" alt={name} className="w-full h-full object-cover" />
        )}

        {/* Media Navigation */}
        {allMedia.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card/90 text-card-foreground rounded-full w-8 h-8 p-0"
              onClick={prevMedia}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card/90 text-card-foreground rounded-full w-8 h-8 p-0"
              onClick={nextMedia}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Media Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1">
              {allMedia.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    index === currentMediaIndex ? "bg-card" : "bg-card/50",
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Post Content */}
      <div className="p-4">
        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent group" onClick={handleLike}>
              <Heart
                className={cn(
                  "h-6 w-6 transition-all duration-200 group-hover:scale-110",
                  isLiked ? "text-red-500 fill-red-500 animate-pulse" : "text-muted-foreground hover:text-red-500",
                )}
              />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto hover:bg-transparent group"
              onClick={() => commentInputRef.current?.focus()}
            >
              <MessageCircle className="h-6 w-6 text-muted-foreground hover:text-blue-500 transition-colors group-hover:scale-110 transition-transform duration-200" />
            </Button>

            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto hover:bg-transparent group"
                onClick={handleShare}
                disabled={isSharing}
              >
                <Share
                  className={cn(
                    "h-6 w-6 text-muted-foreground hover:text-green-500 transition-all duration-200 group-hover:scale-110",
                    isSharing && "animate-spin",
                  )}
                />
              </Button>
            </div>

            {status === "available" ? (
              <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent group" onClick={onAdopt}>
                <CheckCircle className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors group-hover:scale-110 transition-transform duration-200" />
              </Button>
            ) : (
              <CheckCircle className="h-6 w-6 text-primary fill-primary" />
            )}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            {getTimeAgo(uploadedDate)}
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-4 text-sm">
          {likes > 0 && (
            <p className="font-medium text-card-foreground">
              {likes} {likes === 1 ? "like" : "likes"}
            </p>
          )}
          {comments.length > 0 && (
            <p className="text-muted-foreground">
              {comments.length} {comments.length === 1 ? "comment" : "comments"}
            </p>
          )}
          {shares > 0 && (
            <p className="text-muted-foreground">
              {shares} {shares === 1 ? "share" : "shares"}
            </p>
          )}
        </div>

        {/* Dog Info */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-lg text-card-foreground">{name || "Unknown stray"}</h3>
            <Badge variant="outline" className="text-xs">
              {isStray ? "Stray" : "Shelter"}
            </Badge>
          </div>

          {/* Metadata Chips */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={getMoodColor(mood)}>
              {mood.charAt(0).toUpperCase() + mood.slice(1)}
            </Badge>
            <Badge variant="outline" className={getWoundColor(wounds)}>
              Wounds: {wounds.charAt(0).toUpperCase() + wounds.slice(1)}
            </Badge>
            {coatColor && (
              <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border">
                {coatColor}
              </Badge>
            )}
            {size && (
              <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border">
                {size}
              </Badge>
            )}
            {age && (
              <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border">
                {age}
              </Badge>
            )}
          </div>

          {/* Last Seen Location */}
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-sm font-medium text-card-foreground mb-1">Last seen:</p>
            <p className="text-sm text-muted-foreground">{lastSeenLocation}</p>
          </div>

          {/* Description */}
          <p className="text-sm text-card-foreground leading-relaxed">{description}</p>
        </div>

        {comments.length > 0 && status === "available" && (
          <div className="space-y-3 mb-4">
            <div className="space-y-2">
              {comments.slice(0, showAllComments ? comments.length : 2).map((comment) => (
                <div key={comment.id} className="flex items-start space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-muted text-xs">{comment.user.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-muted/30 rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-card-foreground text-sm">{comment.user}</span>
                      <span className="text-xs text-muted-foreground">{getTimeAgo(comment.timestamp)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {comments.length > 2 && !showAllComments && (
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto text-muted-foreground hover:text-foreground"
                onClick={() => setShowAllComments(true)}
              >
                View all {comments.length} comments
              </Button>
            )}
          </div>
        )}

        {status === "available" && (
          <div className="flex items-center space-x-2 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {currentUserId?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex items-center space-x-2">
              <Input
                ref={commentInputRef}
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleComment()}
                className="flex-1 bg-muted/30 border-none focus:bg-muted/50"
                disabled={isCommenting}
              />
              <Button
                size="sm"
                onClick={handleComment}
                disabled={!newComment.trim() || isCommenting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isCommenting ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Adopted Notice */}
        {status === "adopted" && (
          <div className="bg-muted/30 rounded-lg p-3 mb-4 text-center">
            <p className="text-sm font-medium text-card-foreground">This dog has been adopted! 🎉</p>
            <p className="text-xs text-muted-foreground">Comments are now locked.</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {status === "available" && (
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold rounded-xl transition-all duration-200 hover:scale-105"
              onClick={onAdopt}
            >
              I want to adopt / help
            </Button>
          )}
          {canMarkAdopted && status === "available" && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAdopted}
              className="text-muted-foreground hover:text-foreground border-border bg-transparent"
            >
              Mark as Adopted
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
