export interface ChatMessage {
  id: string
  threadId: string
  senderId: string
  senderName: string
  receiverId: string
  content: string
  timestamp: string
  type: "text" | "template" | "location" | "contact" | "image"
  status: "sending" | "sent" | "delivered" | "seen"
  metadata?: any
}

export interface ChatThread {
  id: string
  dogId: string
  dogName: string
  dogImage: string
  adopterId: string
  adopterName: string
  posterId: string
  posterName: string
  status: "active" | "adopted"
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  messages: ChatMessage[]
  typingUsers: string[]
  lastSeen: { [userId: string]: string }
}

export interface TypingIndicator {
  threadId: string
  userId: string
  userName: string
  timestamp: string
}

class RealTimeChatService {
  private subscribers: Map<string, Set<(data: any) => void>> = new Map()
  private threads: Map<string, ChatThread> = new Map()
  private typingIndicators: Map<string, TypingIndicator[]> = new Map()
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map()
  private isInitialized = false

  constructor() {
    this.initializeFromStorage()
    this.setupStorageListener()
  }

  private initializeFromStorage() {
    if (this.isInitialized) return

    const storedThreads = JSON.parse(localStorage.getItem("chatThreads") || "[]")

    storedThreads.forEach((thread: any) => {
      const realTimeThread: ChatThread = {
        ...thread,
        typingUsers: [],
        lastSeen: thread.lastSeen || {},
        messages: (thread.messages || []).map((msg: any) => ({
          ...msg,
          status: msg.status || "seen",
          threadId: thread.id,
          senderId: msg.isCurrentUser ? thread.adopterId : thread.posterId,
          senderName: msg.sender,
          receiverId: msg.isCurrentUser ? thread.posterId : thread.adopterId,
        })),
      }
      this.threads.set(thread.id, realTimeThread)
    })

    this.isInitialized = true
  }

  private setupStorageListener() {
    window.addEventListener("storage", (e) => {
      if (e.key === "chatThreads") {
        this.initializeFromStorage()
        this.notifySubscribers("threadsUpdated", Array.from(this.threads.values()))
      }
    })
  }

  // Subscription system
  subscribe(event: string, callback: (data: any) => void) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set())
    }
    this.subscribers.get(event)!.add(callback)

    return () => {
      this.subscribers.get(event)?.delete(callback)
    }
  }

  private notifySubscribers(event: string, data: any) {
    const callbacks = this.subscribers.get(event)
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error("[v0] Error in chat subscriber callback:", error)
        }
      })
    }
  }

  // Thread operations
  async getThreads(userId: string): Promise<ChatThread[]> {
    const userThreads = Array.from(this.threads.values())
      .filter((thread) => thread.adopterId === userId || thread.posterId === userId)
      .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())

    return userThreads
  }

  async getThread(threadId: string): Promise<ChatThread | null> {
    return this.threads.get(threadId) || null
  }

  async createThread(
    threadData: Omit<ChatThread, "id" | "messages" | "typingUsers" | "lastSeen">,
  ): Promise<ChatThread> {
    const id = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newThread: ChatThread = {
      ...threadData,
      id,
      messages: [],
      typingUsers: [],
      lastSeen: {},
    }

    this.threads.set(id, newThread)
    this.persistToStorage()
    this.notifySubscribers("threadCreated", newThread)
    this.notifySubscribers("threadsUpdated", Array.from(this.threads.values()))

    return newThread
  }

  // Message operations
  async sendMessage(
    threadId: string,
    senderId: string,
    senderName: string,
    content: string,
    type: ChatMessage["type"] = "text",
  ): Promise<ChatMessage> {
    const thread = this.threads.get(threadId)
    if (!thread) throw new Error("Thread not found")

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()

    const message: ChatMessage = {
      id: messageId,
      threadId,
      senderId,
      senderName,
      receiverId: senderId === thread.adopterId ? thread.posterId : thread.adopterId,
      content,
      timestamp: now,
      type,
      status: "sending",
    }

    // Add message to thread
    thread.messages.push(message)
    thread.lastMessage = content
    thread.lastMessageTime = now

    // Update unread count for receiver
    if (senderId !== thread.adopterId) {
      thread.unreadCount = (thread.unreadCount || 0) + 1
    }

    // Stop typing indicator for sender
    this.stopTyping(threadId, senderId)

    this.threads.set(threadId, thread)
    this.persistToStorage()

    // Simulate message delivery
    setTimeout(
      () => {
        message.status = "sent"
        this.notifySubscribers("messageStatusUpdated", { messageId, status: "sent" })

        setTimeout(
          () => {
            message.status = "delivered"
            this.notifySubscribers("messageStatusUpdated", { messageId, status: "delivered" })

            // Auto-mark as seen after a delay (simulating user reading)
            setTimeout(
              () => {
                message.status = "seen"
                this.notifySubscribers("messageStatusUpdated", { messageId, status: "seen" })
              },
              2000 + Math.random() * 3000,
            )
          },
          500 + Math.random() * 1000,
        )
      },
      200 + Math.random() * 500,
    )

    this.notifySubscribers("messageSent", message)
    this.notifySubscribers("threadUpdated", thread)
    this.notifySubscribers("threadsUpdated", Array.from(this.threads.values()))

    return message
  }

  async markThreadAsRead(threadId: string, userId: string): Promise<void> {
    const thread = this.threads.get(threadId)
    if (!thread) return

    thread.unreadCount = 0
    thread.lastSeen[userId] = new Date().toISOString()

    // Mark all messages as seen
    thread.messages.forEach((msg) => {
      if (msg.receiverId === userId && msg.status !== "seen") {
        msg.status = "seen"
      }
    })

    this.threads.set(threadId, thread)
    this.persistToStorage()
    this.notifySubscribers("threadRead", { threadId, userId })
    this.notifySubscribers("threadUpdated", thread)
  }

  // Typing indicators
  startTyping(threadId: string, userId: string, userName: string): void {
    const thread = this.threads.get(threadId)
    if (!thread) return

    // Clear existing timeout
    const timeoutKey = `${threadId}_${userId}`
    if (this.typingTimeouts.has(timeoutKey)) {
      clearTimeout(this.typingTimeouts.get(timeoutKey)!)
    }

    // Add to typing users if not already there
    if (!thread.typingUsers.includes(userId)) {
      thread.typingUsers.push(userId)
      this.threads.set(threadId, thread)
      this.notifySubscribers("typingStarted", { threadId, userId, userName })
    }

    // Auto-stop typing after 3 seconds
    const timeout = setTimeout(() => {
      this.stopTyping(threadId, userId)
    }, 3000)

    this.typingTimeouts.set(timeoutKey, timeout)
  }

  stopTyping(threadId: string, userId: string): void {
    const thread = this.threads.get(threadId)
    if (!thread) return

    const timeoutKey = `${threadId}_${userId}`
    if (this.typingTimeouts.has(timeoutKey)) {
      clearTimeout(this.typingTimeouts.get(timeoutKey)!)
      this.typingTimeouts.delete(timeoutKey)
    }

    const index = thread.typingUsers.indexOf(userId)
    if (index > -1) {
      thread.typingUsers.splice(index, 1)
      this.threads.set(threadId, thread)
      this.notifySubscribers("typingStopped", { threadId, userId })
    }
  }

  getTypingUsers(threadId: string): string[] {
    const thread = this.threads.get(threadId)
    return thread?.typingUsers || []
  }

  // Simulate incoming messages (for demo purposes)
  simulateIncomingMessage(threadId: string, content: string, delay = 1000): void {
    const thread = this.threads.get(threadId)
    if (!thread) return

    setTimeout(async () => {
      // Start typing indicator
      this.startTyping(threadId, thread.posterId, thread.posterName)

      // Send message after typing delay
      setTimeout(
        async () => {
          await this.sendMessage(threadId, thread.posterId, thread.posterName, content)

          // Show notification if thread is not currently active
          this.notifySubscribers("newMessageNotification", {
            threadId,
            senderName: thread.posterName,
            content,
            dogName: thread.dogName,
          })
        },
        1000 + Math.random() * 2000,
      )
    }, delay)
  }

  // Get real-time stats
  async getChatStats(userId: string) {
    const userThreads = await this.getThreads(userId)
    const totalThreads = userThreads.length
    const unreadCount = userThreads.reduce((sum, thread) => sum + (thread.unreadCount || 0), 0)
    const activeThreads = userThreads.filter((thread) => thread.status === "active").length

    return {
      totalThreads,
      unreadCount,
      activeThreads,
      adoptedThreads: totalThreads - activeThreads,
    }
  }

  private persistToStorage() {
    try {
      const threadsArray = Array.from(this.threads.values()).map((thread) => ({
        ...thread,
        messages: thread.messages.map((msg) => ({
          id: msg.id,
          sender: msg.senderName,
          content: msg.content,
          timestamp: msg.timestamp,
          isCurrentUser: msg.senderId === thread.adopterId,
          type: msg.type,
          status: msg.status,
        })),
      }))

      localStorage.setItem("chatThreads", JSON.stringify(threadsArray))
    } catch (error) {
      console.error("[v0] Error persisting chat data:", error)
    }
  }
}

export { RealTimeChatService }

// Singleton instance
export const realTimeChatService = new RealTimeChatService()
