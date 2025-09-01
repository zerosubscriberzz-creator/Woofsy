"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, Users, MessageCircle, MapPin, Phone, Check, CheckCheck, Clock } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { useToast } from "@/hooks/use-toast"

let realTimeChatService: any = null

const quickTemplates = [
  "Is the dog still available?",
  "Where can we meet?",
  "Any medical notes?",
  "What's the dog's temperament like?",
  "Has the dog been vaccinated?",
  "Can I visit the dog first?",
]

export default function MessagesPage() {
  const [isClient, setIsClient] = useState(false)
  const [threads, setThreads] = useState<any[]>([])
  const [selectedThread, setSelectedThread] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const markedThreadsRef = useRef<Set<string>>(new Set())
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const initializeClient = async () => {
      if (typeof window === "undefined") return

      setIsClient(true)

      // Dynamically import the real-time chat service
      const { realTimeChatService: chatService } = await import("@/lib/real-time-chat")
      realTimeChatService = chatService

      const userData = localStorage.getItem("currentUser")
      if (!userData) {
        router.push("/login")
        return
      }
      setCurrentUser(JSON.parse(userData))
      loadThreads()

      const dogId = searchParams.get("dog")
      if (dogId) {
        createOrOpenDogThread(dogId)
      }
    }

    initializeClient()
  }, [searchParams])

  const handleThreadsUpdated = useCallback(
    (updatedThreads: any[]) => {
      if (!currentUser || !realTimeChatService) return
      const userThreads = updatedThreads.filter(
        (thread) => thread.adopterId === currentUser.id || thread.posterId === currentUser.id,
      )
      setThreads(userThreads)
    },
    [currentUser],
  )

  const handleThreadUpdated = useCallback(
    (updatedThread: any) => {
      if (updatedThread.id === selectedThread) {
        setMessages(updatedThread.messages)
        setTypingUsers(updatedThread.typingUsers.filter((userId: string) => userId !== currentUser?.id))
      }
    },
    [selectedThread, currentUser],
  )

  const handleMessageSent = useCallback(
    (message: any) => {
      if (message.threadId === selectedThread) {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
      }
    },
    [selectedThread],
  )

  const handleTypingStarted = useCallback(
    ({ threadId, userId }: any) => {
      if (threadId === selectedThread && userId !== currentUser?.id) {
        setTypingUsers((prev) => [...prev.filter((id) => id !== userId), userId])
      }
    },
    [selectedThread, currentUser],
  )

  const handleTypingStopped = useCallback(
    ({ threadId, userId }: any) => {
      if (threadId === selectedThread) {
        setTypingUsers((prev) => prev.filter((id) => id !== userId))
      }
    },
    [selectedThread],
  )

  const handleNewMessage = useCallback(
    ({ senderName, content, dogName }: any) => {
      toast({
        title: `New message from ${senderName}`,
        description: `About ${dogName}: ${content.slice(0, 50)}${content.length > 50 ? "..." : ""}`,
      })
    },
    [toast],
  )

  useEffect(() => {
    if (!currentUser || !realTimeChatService || !isClient) return

    const unsubscribeThreadsUpdated = realTimeChatService.subscribe("threadsUpdated", handleThreadsUpdated)
    const unsubscribeThreadUpdated = realTimeChatService.subscribe("threadUpdated", handleThreadUpdated)
    const unsubscribeMessageSent = realTimeChatService.subscribe("messageSent", handleMessageSent)
    const unsubscribeTypingStarted = realTimeChatService.subscribe("typingStarted", handleTypingStarted)
    const unsubscribeTypingStopped = realTimeChatService.subscribe("typingStopped", handleTypingStopped)
    const unsubscribeNewMessage = realTimeChatService.subscribe("newMessageNotification", handleNewMessage)

    return () => {
      unsubscribeThreadsUpdated()
      unsubscribeThreadUpdated()
      unsubscribeMessageSent()
      unsubscribeTypingStarted()
      unsubscribeTypingStopped()
      unsubscribeNewMessage()
    }
  }, [
    currentUser,
    realTimeChatService,
    isClient,
    handleThreadsUpdated,
    handleThreadUpdated,
    handleMessageSent,
    handleTypingStarted,
    handleTypingStopped,
    handleNewMessage,
  ])

  useEffect(() => {
    if (selectedThread && currentUser && realTimeChatService) {
      const thread = threads.find((t) => t.id === selectedThread)
      if (thread) {
        setMessages(thread.messages)
        setTypingUsers(thread.typingUsers.filter((userId: string) => userId !== currentUser.id))

        // Mark thread as read only if it has unread messages and hasn't been marked yet
        if (thread.unreadCount > 0 && !markedThreadsRef.current.has(selectedThread)) {
          markedThreadsRef.current.add(selectedThread)
          setTimeout(() => {
            realTimeChatService.markThreadAsRead(selectedThread, currentUser.id)
          }, 0)
        }
      }
    }
  }, [selectedThread, currentUser, threads, realTimeChatService])

  useEffect(() => {
    if (selectedThread) {
      markedThreadsRef.current.clear()
    }
  }, [selectedThread])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, typingUsers])

  const loadThreads = async () => {
    if (!currentUser || !realTimeChatService) return

    try {
      const userThreads = await realTimeChatService.getThreads(currentUser.id)
      setThreads(userThreads)

      if (userThreads.length > 0 && !selectedThread) {
        setSelectedThread(userThreads[0].id)
      }
    } catch (error) {
      console.error("[v0] Error loading threads:", error)
    }
  }

  const createOrOpenDogThread = async (dogId: string) => {
    if (!currentUser || !realTimeChatService) return

    if (typeof window === "undefined") return

    const uploadedDogs = JSON.parse(localStorage.getItem("uploadedDogs") || "[]")
    const adminDogs = [
      {
        id: "admin_1",
        name: "Happy Street Friend",
        image: "/images/happy-street-dog.png",
        uploadedBy: "Admin",
        uploadedByUserId: "admin",
      },
      {
        id: "admin_2",
        name: "Puppy Siblings",
        image: "/images/two-puppies.jpeg",
        uploadedBy: "Admin",
        uploadedByUserId: "admin",
      },
      {
        id: "admin_3",
        name: "Little Explorer",
        image: "/images/young-puppy.jpeg",
        uploadedBy: "Admin",
        uploadedByUserId: "admin",
      },
    ]

    const allDogs = [...uploadedDogs, ...adminDogs]
    const dog = allDogs.find((d) => d.id === dogId)

    if (!dog) return

    const existingThread = threads.find((t) => t.dogId === dogId && t.adopterId === currentUser.id)

    if (existingThread) {
      setSelectedThread(existingThread.id)
      return
    }

    try {
      const newThread = await realTimeChatService.createThread({
        dogId: dogId,
        dogName: dog.name || "Unknown stray",
        dogImage: dog.image,
        adopterId: currentUser.id,
        adopterName: currentUser.username,
        posterId: dog.uploadedByUserId || "admin",
        posterName: dog.uploadedBy,
        status: "active",
        lastMessage: "Started conversation about adoption",
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
      })

      // Send welcome message
      await realTimeChatService.sendMessage(
        newThread.id,
        "system",
        "System",
        `You're now connected with ${dog.uploadedBy} about ${dog.name || "this dog"}. Feel free to ask any questions about the adoption process!`,
      )

      setSelectedThread(newThread.id)

      // Simulate response after a delay
      setTimeout(() => {
        realTimeChatService.simulateIncomingMessage(
          newThread.id,
          "Hi! Thanks for your interest in helping this dog. What would you like to know?",
          2000,
        )
      }, 1000)
    } catch (error) {
      console.error("[v0] Error creating thread:", error)
      toast({
        title: "Error",
        description: "Unable to start conversation. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSendMessage = async (content: string, type: any = "text") => {
    if (!content.trim() || !currentUser || !selectedThread || !realTimeChatService) return

    try {
      await realTimeChatService.sendMessage(selectedThread, currentUser.id, currentUser.username, content, type)
      setNewMessage("")
      setShowTemplates(false)

      // Stop typing indicator
      if (isTyping) {
        realTimeChatService.stopTyping(selectedThread, currentUser.id)
        setIsTyping(false)
      }

      // Simulate response for template messages
      if (type === "template") {
        const responses: { [key: string]: string } = {
          "Is the dog still available?": "Yes, the dog is still available for adoption! Would you like to meet?",
          "Where can we meet?":
            "We can meet at the location where the dog was found, or at a nearby park. What works for you?",
          "Any medical notes?":
            "The dog appears healthy but hasn't had a full vet checkup yet. I'd recommend a health check after adoption.",
          "What's the dog's temperament like?": "Very friendly and gentle! Gets along well with people and other dogs.",
          "Has the dog been vaccinated?": "Not yet, but I can help arrange vaccination before the adoption if needed.",
          "Can I visit the dog first?": "I think it's important for you to meet first. When would be a good time?",
        }

        const response = responses[content] || "Thanks for your message! Let me get back to you on that."
        realTimeChatService.simulateIncomingMessage(selectedThread, response, 1000)
      }
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      toast({
        title: "Send Failed",
        description: "Unable to send message. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (value: string) => {
    setNewMessage(value)

    if (!selectedThread || !currentUser || !realTimeChatService) return

    // Handle typing indicators
    if (value.trim() && !isTyping) {
      realTimeChatService.startTyping(selectedThread, currentUser.id, currentUser.username)
      setIsTyping(true)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        realTimeChatService.stopTyping(selectedThread, currentUser.id)
        setIsTyping(false)
      }
    }, 1000)
  }

  const handleTemplateSelect = (template: string) => {
    handleSendMessage(template, "template")
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "now"
    if (diffInMinutes < 60) return `${diffInMinutes}m`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d`
  }

  const getMessageStatusIcon = (status: any) => {
    switch (status) {
      case "sending":
        return <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />
      case "sent":
        return <Check className="h-3 w-3 text-muted-foreground" />
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />
      case "seen":
        return <CheckCheck className="h-3 w-3 text-primary" />
      default:
        return null
    }
  }

  const currentThread = threads.find((t) => t.id === selectedThread)
  const totalUnread = threads.reduce((sum, thread) => sum + (thread.unreadCount || 0), 0)

  if (!isClient) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border sticky top-0 z-40 paw-shadow">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="mr-4 hover:bg-muted"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back()
              } else {
                router.push("/feed")
              }
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-2">
            <img src="/images/woofsy-logo.png" alt="Woofsy Logo" className="w-8 h-8 rounded-full object-cover" />
            <div>
              <h1 className="text-2xl font-heading font-black text-foreground">Woofsy</h1>
              <p className="text-xs text-muted-foreground">Connecting Paws, Creating Homes</p>
            </div>
            {totalUnread > 0 && (
              <div className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-1 font-semibold ml-4 animate-pulse">
                {totalUnread} unread
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 h-[calc(100vh-140px)]">
        <div className="grid lg:grid-cols-4 gap-6 h-full">
          <Card className="lg:col-span-1 bg-card border border-border paw-shadow rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 font-heading font-bold text-card-foreground">
                <Users className="h-5 w-5" />
                <span>Adoption Chats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="space-y-2 p-4">
                  {threads.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">No conversations yet</p>
                      <p className="text-xs text-muted-foreground mt-2">Tap "Adopt" on a dog post to start chatting</p>
                    </div>
                  ) : (
                    threads.map((thread) => (
                      <div
                        key={thread.id}
                        className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedThread === thread.id ? "bg-primary/10 border-primary/30 border" : "hover:bg-muted/50"
                        }`}
                        onClick={() => setSelectedThread(thread.id)}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <img
                            src={thread.dogImage || "/placeholder.svg?height=40&width=40&query=dog"}
                            alt={thread.dogName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-heading font-semibold text-sm text-card-foreground truncate">
                                {thread.dogName}
                              </h4>
                              {thread.unreadCount > 0 && (
                                <Badge className="bg-primary text-primary-foreground text-xs animate-pulse">
                                  {thread.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">with {thread.posterName}</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-1">{thread.lastMessage}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{formatTime(thread.lastMessageTime)}</span>
                          <Badge
                            variant="outline"
                            className={
                              thread.status === "active"
                                ? "bg-secondary/20 text-secondary border-secondary/30"
                                : "bg-muted text-muted-foreground border-border"
                            }
                          >
                            {thread.status === "active" ? "Active" : "Adopted"}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 flex flex-col bg-card border border-border paw-shadow rounded-2xl">
            {currentThread ? (
              <>
                <CardHeader className="border-b border-border">
                  <div className="flex items-center space-x-3">
                    <img
                      src={currentThread.dogImage || "/placeholder.svg?height=50&width=50&query=dog"}
                      alt={currentThread.dogName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <CardTitle className="font-heading font-bold text-card-foreground">
                        {currentThread.dogName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Chatting with {currentThread.posterName}
                        {typingUsers.length > 0 && <span className="text-primary ml-2 animate-pulse">• typing...</span>}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === currentUser?.id ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] ${
                              message.senderName === "System"
                                ? "bg-muted/50 text-muted-foreground border border-border"
                                : message.senderId === currentUser?.id
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-card border border-border text-card-foreground"
                            } rounded-xl p-3 ${message.type === "template" ? "border-l-4 border-l-primary" : ""}`}
                          >
                            {message.senderId !== currentUser?.id && message.senderName !== "System" && (
                              <div className="flex items-center space-x-2 mb-1">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                    {message.senderName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-medium">{message.senderName}</span>
                              </div>
                            )}
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center justify-between mt-1">
                              <p
                                className={`text-xs ${
                                  message.senderName === "System"
                                    ? "text-muted-foreground"
                                    : message.senderId === currentUser?.id
                                      ? "text-primary-foreground/70"
                                      : "text-muted-foreground"
                                }`}
                              >
                                {formatTime(message.timestamp)}
                              </p>
                              {message.senderId === currentUser?.id && (
                                <div className="ml-2">{getMessageStatusIcon(message.status)}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {typingUsers.length > 0 && (
                        <div className="flex justify-start">
                          <div className="bg-muted/50 rounded-xl p-3 max-w-[70%]">
                            <div className="flex items-center space-x-2">
                              <div className="flex space-x-1">
                                <div
                                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                                  style={{ animationDelay: "0ms" }}
                                />
                                <div
                                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                                  style={{ animationDelay: "150ms" }}
                                />
                                <div
                                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                                  style={{ animationDelay: "300ms" }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">typing...</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {showTemplates && (
                    <div className="border-t border-border p-4 bg-muted/30">
                      <h4 className="font-heading font-semibold text-sm text-card-foreground mb-3">Quick Questions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {quickTemplates.map((template, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-left justify-start h-auto p-2 text-xs bg-transparent hover:bg-muted"
                            onClick={() => handleTemplateSelect(template)}
                          >
                            {template}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-border p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="text-xs bg-transparent"
                      >
                        Quick Questions
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs bg-transparent">
                        <MapPin className="h-3 w-3 mr-1" />
                        Share Location
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs bg-transparent">
                        <Phone className="h-3 w-3 mr-1" />
                        Share Contact
                      </Button>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleSendMessage(newMessage)
                      }}
                      className="flex space-x-2"
                    >
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => handleInputChange(e.target.value)}
                        className="flex-1 rounded-xl"
                      />
                      <Button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-heading font-semibold text-foreground mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground">Choose a chat to start messaging about adoption</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
