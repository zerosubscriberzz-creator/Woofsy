"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Send, Users, MessageCircle } from "lucide-react"

interface Message {
  id: string
  sender: string
  content: string
  timestamp: string
  isCurrentUser: boolean
}

interface ChatRoom {
  id: string
  name: string
  type: "general" | "private"
  lastMessage: string
  unreadCount: number
  otherUser?: string
  messages: Message[]
}

export default function ChatPage() {
  const router = useRouter()
  const [selectedRoom, setSelectedRoom] = useState<string>("general")
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Get current user
    const userData = localStorage.getItem("currentUser")
    if (userData) {
      setCurrentUser(JSON.parse(userData))
    }

    // Load real chat rooms from localStorage
    loadChatRooms()
  }, [])

  useEffect(() => {
    // Load messages for selected room
    const room = chatRooms.find((r) => r.id === selectedRoom)
    if (room) {
      setMessages(room.messages)
    }
  }, [selectedRoom, chatRooms])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadChatRooms = () => {
    // Get real chat data from localStorage
    const savedChats = JSON.parse(localStorage.getItem("chatRooms") || "[]")

    // Always include general room, but only with real messages
    const generalRoom: ChatRoom = {
      id: "general",
      name: "General Discussion",
      type: "general",
      lastMessage: savedChats.find((r: ChatRoom) => r.id === "general")?.lastMessage || "No messages yet",
      unreadCount: 0,
      messages: savedChats.find((r: ChatRoom) => r.id === "general")?.messages || [],
    }

    // Add other real chat rooms
    const otherRooms = savedChats.filter((r: ChatRoom) => r.id !== "general")

    setChatRooms([generalRoom, ...otherRooms])
  }

  const saveChatRooms = (rooms: ChatRoom[]) => {
    localStorage.setItem("chatRooms", JSON.stringify(rooms))
    setChatRooms(rooms)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser) return

    const message: Message = {
      id: Date.now().toString(),
      sender: currentUser.username,
      content: newMessage,
      timestamp: new Date().toISOString(),
      isCurrentUser: true,
    }

    // Update messages
    const newMessages = [...messages, message]
    setMessages(newMessages)

    // Update chat rooms
    const updatedRooms = chatRooms.map((room) =>
      room.id === selectedRoom
        ? {
            ...room,
            messages: newMessages,
            lastMessage: newMessage,
            unreadCount: 0,
          }
        : room,
    )

    saveChatRooms(updatedRooms)
    setNewMessage("")
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="backdrop-blur-md bg-white/80 border-b border-orange-200/30">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="mr-4 hover:bg-orange-100/50"
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
            <Link href="/dashboard">
              <img
                src="/images/purple-paw-icon.png"
                alt="Woofsy Paw"
                className="w-8 h-8 rounded-full object-cover cursor-pointer"
              />
            </Link>
            <h1 className="text-2xl font-bold text-orange-800">Community Chat</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 h-[calc(100vh-120px)]">
        <div className="grid lg:grid-cols-4 gap-6 h-full">
          {/* Chat Rooms Sidebar */}
          <Card className="lg:col-span-1 border-0 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-800">
                <Users className="h-5 w-5" />
                <span>Chats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="space-y-2 p-4">
                  {chatRooms.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-sm text-gray-500">No conversations yet</p>
                      <p className="text-xs text-gray-400 mt-2">Start chatting to see conversations here</p>
                    </div>
                  ) : (
                    chatRooms.map((room) => (
                      <div
                        key={room.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedRoom === room.id ? "bg-orange-100 border-orange-200 border" : "hover:bg-orange-50"
                        }`}
                        onClick={() => setSelectedRoom(room.id)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium text-sm text-orange-800">{room.name}</h4>
                          {room.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                              {room.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-orange-600 truncate">{room.lastMessage || "No messages yet"}</p>
                        <span className="text-xs text-orange-500">
                          {room.type === "general" ? "Community" : "Private"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-3 flex flex-col border-0 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-orange-800">
                {chatRooms.find((room) => room.id === selectedRoom)?.name || "General Discussion"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-16">
                      <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No messages yet</h3>
                      <p className="text-gray-500">Be the first to start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isCurrentUser ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] ${
                            message.isCurrentUser
                              ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white"
                              : "bg-white border border-orange-200 text-orange-800"
                          } rounded-lg p-3`}
                        >
                          {!message.isCurrentUser && (
                            <div className="flex items-center space-x-2 mb-1">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs bg-orange-100 text-orange-600">
                                  {message.sender.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-medium">{message.sender}</span>
                            </div>
                          )}
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${message.isCurrentUser ? "text-orange-100" : "text-orange-500"}`}
                          >
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t border-orange-200 p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 border-orange-200 focus:border-orange-400"
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
