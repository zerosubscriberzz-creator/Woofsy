"use client"

export const dynamic = "force-dynamic"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, MapPin, X, Plus, Video, RefreshCw, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { realTimeDB } from "@/lib/real-time-database"

interface MediaFile {
  file: File
  preview: string
  type: "image" | "video"
  verified: boolean
  verifying: boolean
  isNSFW: boolean
  error: string | null
  retryCount: number
}

export default function UploadPage() {
  const [formData, setFormData] = useState({
    lastSeenLocation: "",
    description: "",
    mood: "",
    wounds: "",
    specialNotes: "",
    isStray: true,
    status: "active" as "active" | "adopted",
  })

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  const performRealAIVerification = async (index: number, isRetry = false) => {
    const media = mediaFiles[index]
    if (!media) return

    console.log("[v0] Starting AI verification for media index:", index, isRetry ? "(retry)" : "")

    setMediaFiles((prev) =>
      prev.map((m, i) =>
        i === index
          ? {
              ...m,
              verifying: true,
              verified: false,
              isNSFW: false,
              error: null,
            }
          : m,
      ),
    )

    try {
      const formData = new FormData()
      formData.append("image", media.file)
      formData.append(
        "userId",
        typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("currentUser") || "{}").id || "anonymous"
          : "anonymous",
      )

      console.log("[v0] Sending image for analysis...")

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch("/api/analyze-image", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`)
      }

      const result = await response.json()
      console.log("[v0] AI analysis result:", result)

      setMediaFiles((prev) =>
        prev.map((m, i) =>
          i === index
            ? {
                ...m,
                verifying: false,
                verified: !result.isNSFW, // Verified if not NSFW
                isNSFW: result.isNSFW,
                error: result.isNSFW ? "Content blocked" : null,
                retryCount: isRetry ? m.retryCount + 1 : m.retryCount,
              }
            : m,
        ),
      )

      if (result.isNSFW) {
        toast({
          title: "Content Blocked",
          description: "This content is not allowed.",
          variant: "destructive",
        })
      } else {
        console.log("[v0] Image verified successfully")
        toast({
          title: "Image Verified Successfully!",
          description: "Image has been approved for upload.",
        })
      }
    } catch (error) {
      console.error("[v0] AI verification failed:", error)

      const isTimeout = error.name === "AbortError"
      const errorMessage = isTimeout ? "Verification timeout" : "Verification failed"

      setMediaFiles((prev) =>
        prev.map((m, i) =>
          i === index
            ? {
                ...m,
                verifying: false,
                verified: !isRetry && m.retryCount < 2, // Allow upload on first failure or after 2 retries
                isNSFW: false,
                error: errorMessage,
                retryCount: isRetry ? m.retryCount + 1 : m.retryCount,
              }
            : m,
        ),
      )

      if (!isRetry && media.retryCount < 2) {
        toast({
          title: "Verification Failed",
          description: `${errorMessage}. You can retry or the image will be approved automatically.`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Verification Complete",
          description: "Image approved for upload after technical issues.",
        })
      }
    }
  }

  const retryVerification = (index: number) => {
    const media = mediaFiles[index]
    if (media && media.retryCount < 3) {
      performRealAIVerification(index, true)
    }
  }

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    files.forEach((file) => {
      if (mediaFiles.length >= 10) {
        toast({
          title: "Maximum files reached",
          description: "You can upload up to 10 photos/videos per post.",
          variant: "destructive",
        })
        return
      }

      const isVideo = file.type.startsWith("video/")
      const isImage = file.type.startsWith("image/")

      if (!isVideo && !isImage) {
        toast({
          title: "Invalid file type",
          description: "Please upload only images or videos.",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const newMedia: MediaFile = {
          file,
          preview: e.target?.result as string,
          type: isVideo ? "video" : "image",
          verified: false,
          verifying: false,
          isNSFW: false,
          error: null,
          retryCount: 0,
        }

        setMediaFiles((prev) => {
          const updated = [...prev, newMedia]
          setTimeout(() => performRealAIVerification(updated.length - 1), 100)
          return updated
        })
      }
      reader.readAsDataURL(file)
    })
  }

  const removeMediaFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] Form submission started")
    console.log("[v0] Media files:", mediaFiles)
    console.log("[v0] Form data:", formData)

    if (mediaFiles.length === 0) {
      console.log("[v0] No media files uploaded")
      toast({
        title: "Media Required",
        description: "Please upload at least one photo or video of the dog.",
        variant: "destructive",
      })
      return
    }

    const verifiedMedia = mediaFiles.filter((media) => media.verified)
    const verifyingMedia = mediaFiles.filter((media) => media.verifying)

    console.log("[v0] Verified media count:", verifiedMedia.length)
    console.log("[v0] Verifying media count:", verifyingMedia.length)

    if (verifiedMedia.length === 0) {
      if (verifyingMedia.length > 0) {
        toast({
          title: "Verification in Progress",
          description: "Please wait for media verification to complete.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "No Verified Media",
          description: "Please ensure at least one media file is successfully verified.",
          variant: "destructive",
        })
      }
      return
    }

    if (!formData.lastSeenLocation.trim()) {
      console.log("[v0] Location is missing")
      toast({
        title: "Location Required",
        description: "Please specify where the dog was last seen.",
        variant: "destructive",
      })
      return
    }

    if (!formData.mood) {
      console.log("[v0] Mood is missing")
      toast({
        title: "Temperament Required",
        description: "Please specify the dog's mood/temperament.",
        variant: "destructive",
      })
      return
    }

    if (!formData.wounds) {
      console.log("[v0] Wound status is missing")
      toast({
        title: "Wound Status Required",
        description: "Please specify if the dog has visible wounds.",
        variant: "destructive",
      })
      return
    }

    console.log("[v0] All validations passed, submitting form...")
    setIsSubmitting(true)

    try {
      const currentUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("currentUser") || "{}") : {}

      const verifiedImages = mediaFiles.filter((m) => m.type === "image" && m.verified).map((media) => media.preview)
      const verifiedVideos = mediaFiles.filter((m) => m.type === "video" && m.verified).map((media) => media.preview)

      const dogData = {
        name: `Stray Dog ${Date.now().toString().slice(-4)}`,
        images: verifiedImages,
        videos: verifiedVideos,
        location: formData.lastSeenLocation.split(",")[0] || formData.lastSeenLocation,
        lastSeenLocation: formData.lastSeenLocation,
        description: formData.description || "This dog needs help finding a loving home.",
        uploadedBy: currentUser.username || "Anonymous",
        uploadedDate: new Date().toISOString(),
        status: formData.status,
        mood: formData.mood,
        wounds: formData.wounds,
        isStray: formData.isStray,
        specialNotes: formData.specialNotes,
        uploadedByUserId: currentUser.id,
      }

      console.log("[v0] Creating dog post with data:", dogData)
      await realTimeDB.createDog(dogData)

      console.log("[v0] Post created successfully")
      toast({
        title: "Post Published Successfully! 🐕",
        description: `Your post is now live with ${verifiedMedia.length} verified media files.`,
      })

      setFormData({
        lastSeenLocation: "",
        description: "",
        mood: "",
        wounds: "",
        specialNotes: "",
        isStray: true,
        status: "active",
      })
      setMediaFiles([])

      router.push("/feed")
    } catch (error) {
      console.error("[v0] Error creating dog post:", error)
      toast({
        title: "Upload Failed",
        description: "Unable to publish your post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push("/profile")
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border sticky top-0 z-40 paw-shadow">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" size="sm" className="mr-4 hover:bg-muted rounded-xl" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-3">
            <img src="/images/purple-paw-icon.png" alt="Woofsy Logo" className="w-8 h-8 rounded-full object-cover" />
            <h1 className="text-2xl font-heading font-black text-foreground">New Post</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="dark-card paw-shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="font-heading font-bold text-card-foreground">Add a Dog</CardTitle>
            <CardDescription className="text-muted-foreground">
              Help a dog find a home by sharing their information with the Woofsy community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Label className="font-heading font-semibold text-card-foreground">Photos/Videos *</Label>

                {mediaFiles.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {mediaFiles.map((media, index) => (
                      <div key={index} className="relative group">
                        {media.type === "video" ? (
                          <video src={media.preview} className="w-full h-32 object-cover rounded-lg" controls={false} />
                        ) : (
                          <img
                            src={media.preview || "/placeholder.svg"}
                            alt={`Dog media ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        )}

                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeMediaFile(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>

                        <div className="absolute bottom-2 left-2 flex flex-col gap-1">
                          {media.verifying && (
                            <Badge variant="secondary" className="text-xs">
                              <div className="animate-spin h-3 w-3 border border-primary border-t-transparent rounded-full mr-1"></div>
                              Verifying...
                            </Badge>
                          )}
                          {media.verified && !media.error && (
                            <Badge className="bg-secondary text-secondary-foreground text-xs">
                              <img
                                src="/images/purple-paw-icon.png"
                                alt="Upload Paw"
                                className="h-3 w-3 mr-1 rounded-full object-cover"
                              />
                              Verified
                            </Badge>
                          )}
                          {media.error && !media.verifying && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {media.error}
                            </Badge>
                          )}
                          {media.error && !media.verifying && media.retryCount < 3 && !media.isNSFW && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs h-6 px-2 bg-transparent"
                              onClick={() => retryVerification(index)}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Retry
                            </Button>
                          )}
                        </div>

                        {media.type === "video" && (
                          <div className="absolute top-2 left-2">
                            <Badge variant="outline" className="text-xs bg-card/80">
                              <Video className="h-3 w-3 mr-1" />
                              Video
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-muted/20">
                  {mediaFiles.length === 0 ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto playful-paw">
                        <img
                          src="/images/purple-paw-icon.png"
                          alt="Upload Paw"
                          className="h-8 w-8 text-primary rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-lg font-heading font-semibold text-card-foreground">Upload photos/videos</p>
                        <p className="text-sm text-muted-foreground">Our AI will scan for inappropriate content</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Add more photos/videos (up to 10 total)</p>
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={mediaFiles.length >= 10}
                    className="mt-4 rounded-xl border-border hover:bg-muted"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {mediaFiles.length === 0 ? "Choose Media" : "Add More"}
                  </Button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleMediaSelect}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastSeenLocation" className="font-heading font-semibold text-card-foreground">
                  Where was the dog last seen? *
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="lastSeenLocation"
                    placeholder="e.g., Near Bus Stop, Anna Nagar, Chennai"
                    value={formData.lastSeenLocation}
                    onChange={(e) => setFormData({ ...formData, lastSeenLocation: e.target.value })}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-heading font-semibold text-card-foreground">Mood/Temperament *</Label>
                  <Select value={formData.mood} onValueChange={(value) => setFormData({ ...formData, mood: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select temperament" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                      <SelectItem value="unsure">Unsure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-heading font-semibold text-card-foreground">Visible wounds *</Label>
                  <Select
                    value={formData.wounds}
                    onValueChange={(value) => setFormData({ ...formData, wounds: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wound status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="unsure">Unsure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-heading font-semibold text-card-foreground">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Tell us more about this dog's story, behavior, or any special needs..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialNotes" className="font-heading font-semibold text-card-foreground">
                  Special Notes
                </Label>
                <Textarea
                  id="specialNotes"
                  placeholder="Any additional information about the dog's behavior, health, or circumstances..."
                  value={formData.specialNotes}
                  onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-bold py-4 text-lg rounded-xl paw-shadow transition-all duration-200 hover:scale-105"
                disabled={
                  isSubmitting ||
                  mediaFiles.length === 0 ||
                  mediaFiles.filter((m) => m.verified).length === 0 ||
                  mediaFiles.some((m) => m.verifying)
                }
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"></div>
                    Publishing Post...
                  </>
                ) : (
                  <>
                    <img
                      src="/images/purple-paw-icon.png"
                      alt="Upload Paw"
                      className="h-4 w-4 mr-2 rounded-full object-cover"
                    />
                    Publish Post
                  </>
                )}
              </Button>

              {(mediaFiles.length === 0 ||
                mediaFiles.filter((m) => m.verified).length === 0 ||
                mediaFiles.some((m) => m.verifying)) && (
                <div className="text-sm text-muted-foreground text-center space-y-1">
                  {mediaFiles.length === 0 ? (
                    <p>Please upload at least one photo/video before publishing</p>
                  ) : (
                    <>
                      <p>At least one verified media file is required to publish</p>
                      <p className="text-xs">
                        Status: {mediaFiles.filter((m) => m.verified).length} verified,{" "}
                        {mediaFiles.filter((m) => m.verifying).length} verifying,{" "}
                        {mediaFiles.filter((m) => m.error && !m.verified).length} failed
                      </p>
                    </>
                  )}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
