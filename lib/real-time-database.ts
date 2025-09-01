export interface Dog {
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
  likes: number
  likedBy: string[]
  comments: Array<{
    id: string
    user: string
    text: string
    timestamp: string
    avatar?: string
  }>
  shares: number
  adoptionRequests: string[]
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  bio?: string
  dogsUploaded: number
  dogsAdopted: number
  donationsMade: number
  badges: string[]
  joinedDate: string
}

export interface ChatMessage {
  id: string
  threadId: string
  senderId: string
  receiverId: string
  message: string
  timestamp: string
  seen: boolean
  type: "text" | "image" | "location"
}

export interface Donation {
  id: string
  userId: string
  amount: number
  currency: string
  timestamp: string
  paymentId: string
  status: "completed" | "pending" | "failed"
}

class RealTimeDatabase {
  private subscribers: Map<string, Set<(data: any) => void>> = new Map()
  private dogs: Map<string, Dog> = new Map()
  private users: Map<string, User> = new Map()
  private messages: Map<string, ChatMessage[]> = new Map()
  private donations: Donation[] = []
  private isInitialized = false

  constructor() {
    this.initializeFromStorage()
    this.setupStorageListener()
  }

  private initializeFromStorage() {
    if (this.isInitialized) return

    // Load existing data from localStorage
    const storedDogs = JSON.parse(localStorage.getItem("uploadedDogs") || "[]")
    const storedUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
    const storedMessages = JSON.parse(localStorage.getItem("chatThreads") || "[]")
    const storedDonations = JSON.parse(localStorage.getItem("donationHistory") || "[]")

    // Convert to real-time format
    storedDogs.forEach((dog: any) => {
      const realTimeDog: Dog = {
        ...dog,
        likes: dog.likes || 0,
        likedBy: dog.likedBy || [],
        comments: dog.comments || [],
        shares: dog.shares || 0,
        adoptionRequests: dog.adoptionRequests || [],
        createdAt: dog.uploadedDate || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        videos: dog.videos || [],
      }
      this.dogs.set(dog.id, realTimeDog)
    })

    storedUsers.forEach((user: any) => {
      const realTimeUser: User = {
        ...user,
        dogsUploaded: user.dogsUploaded || 0,
        dogsAdopted: user.dogsAdopted || 0,
        donationsMade: user.donationsMade || 0,
        badges: user.badges || [],
        joinedDate: user.joinedDate || new Date().toISOString(),
      }
      this.users.set(user.id, realTimeUser)
    })

    this.donations = storedDonations
    this.isInitialized = true
  }

  private setupStorageListener() {
    window.addEventListener("storage", (e) => {
      if (e.key === "uploadedDogs" || e.key === "registeredUsers" || e.key === "chatThreads") {
        this.initializeFromStorage()
        this.notifySubscribers("dataChanged", { key: e.key })
      }
    })
  }

  // Real-time subscription system
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
          console.error("[v0] Error in subscriber callback:", error)
        }
      })
    }
  }

  // Dog operations
  async getDogs(limit?: number, offset?: number): Promise<Dog[]> {
    await new Promise((resolve) => setTimeout(resolve, 100)) // Simulate network delay

    const allDogs = Array.from(this.dogs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

    if (limit) {
      return allDogs.slice(offset || 0, (offset || 0) + limit)
    }

    return allDogs
  }

  async getDogById(id: string): Promise<Dog | null> {
    return this.dogs.get(id) || null
  }

  async createDog(
    dogData: Omit<
      Dog,
      "id" | "createdAt" | "updatedAt" | "likes" | "likedBy" | "comments" | "shares" | "adoptionRequests"
    >,
  ): Promise<Dog> {
    const id = `dog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()

    const newDog: Dog = {
      ...dogData,
      id,
      likes: 0,
      likedBy: [],
      comments: [],
      shares: 0,
      adoptionRequests: [],
      createdAt: now,
      updatedAt: now,
    }

    this.dogs.set(id, newDog)
    this.persistToStorage()
    this.notifySubscribers("dogCreated", newDog)
    this.notifySubscribers("dogsUpdated", Array.from(this.dogs.values()))

    return newDog
  }

  async updateDog(id: string, updates: Partial<Dog>): Promise<Dog | null> {
    const dog = this.dogs.get(id)
    if (!dog) return null

    const updatedDog = {
      ...dog,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    this.dogs.set(id, updatedDog)
    this.persistToStorage()
    this.notifySubscribers("dogUpdated", updatedDog)
    this.notifySubscribers("dogsUpdated", Array.from(this.dogs.values()))

    return updatedDog
  }

  async likeDog(dogId: string, userId: string): Promise<boolean> {
    const dog = this.dogs.get(dogId)
    if (!dog) return false

    const alreadyLiked = dog.likedBy.includes(userId)

    if (alreadyLiked) {
      dog.likedBy = dog.likedBy.filter((id) => id !== userId)
      dog.likes = Math.max(0, dog.likes - 1)
    } else {
      dog.likedBy.push(userId)
      dog.likes += 1
    }

    dog.updatedAt = new Date().toISOString()
    this.dogs.set(dogId, dog)
    this.persistToStorage()
    this.notifySubscribers("dogLiked", { dogId, userId, liked: !alreadyLiked })
    this.notifySubscribers("dogsUpdated", Array.from(this.dogs.values()))

    return !alreadyLiked
  }

  async addComment(dogId: string, userId: string, text: string): Promise<boolean> {
    const dog = this.dogs.get(dogId)
    const user = this.users.get(userId)
    if (!dog || !user) return false

    const comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user: user.username,
      text,
      timestamp: new Date().toISOString(),
      avatar: user.avatar,
    }

    dog.comments.push(comment)
    dog.updatedAt = new Date().toISOString()
    this.dogs.set(dogId, dog)
    this.persistToStorage()
    this.notifySubscribers("commentAdded", { dogId, comment })
    this.notifySubscribers("dogsUpdated", Array.from(this.dogs.values()))

    return true
  }

  async requestAdoption(dogId: string, userId: string): Promise<boolean> {
    const dog = this.dogs.get(dogId)
    if (!dog) return false

    if (!dog.adoptionRequests.includes(userId)) {
      dog.adoptionRequests.push(userId)
      dog.updatedAt = new Date().toISOString()
      this.dogs.set(dogId, dog)
      this.persistToStorage()
      this.notifySubscribers("adoptionRequested", { dogId, userId })
      this.notifySubscribers("dogsUpdated", Array.from(this.dogs.values()))
    }

    return true
  }

  // User operations
  async getUser(id: string): Promise<User | null> {
    return this.users.get(id) || null
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(id)
    if (!user) return null

    const updatedUser = { ...user, ...updates }
    this.users.set(id, updatedUser)
    this.persistToStorage()
    this.notifySubscribers("userUpdated", updatedUser)

    return updatedUser
  }

  // Real-time stats
  async getStats() {
    const totalDogs = this.dogs.size
    const adoptedDogs = Array.from(this.dogs.values()).filter((dog) => dog.status === "adopted").length
    const totalUsers = this.users.size
    const totalDonations = this.donations.reduce(
      (sum, donation) => (donation.status === "completed" ? sum + donation.amount : sum),
      0,
    )

    return {
      totalDogs,
      adoptedDogs,
      availableDogs: totalDogs - adoptedDogs,
      totalUsers,
      totalDonations,
      dogsHelped: adoptedDogs,
    }
  }

  private persistToStorage() {
    try {
      const dogsArray = Array.from(this.dogs.values())
      const usersArray = Array.from(this.users.values())

      localStorage.setItem("uploadedDogs", JSON.stringify(dogsArray))
      localStorage.setItem("registeredUsers", JSON.stringify(usersArray))
      localStorage.setItem("donationHistory", JSON.stringify(this.donations))
    } catch (error) {
      console.error("[v0] Error persisting to storage:", error)
    }
  }

  // Simulate typing indicators for chat
  private typingUsers: Map<string, Set<string>> = new Map()

  startTyping(threadId: string, userId: string) {
    if (!this.typingUsers.has(threadId)) {
      this.typingUsers.set(threadId, new Set())
    }
    this.typingUsers.get(threadId)!.add(userId)
    this.notifySubscribers("typingStarted", { threadId, userId })

    // Auto-stop typing after 3 seconds
    setTimeout(() => {
      this.stopTyping(threadId, userId)
    }, 3000)
  }

  stopTyping(threadId: string, userId: string) {
    const typingSet = this.typingUsers.get(threadId)
    if (typingSet) {
      typingSet.delete(userId)
      if (typingSet.size === 0) {
        this.typingUsers.delete(threadId)
      }
    }
    this.notifySubscribers("typingStopped", { threadId, userId })
  }

  getTypingUsers(threadId: string): string[] {
    return Array.from(this.typingUsers.get(threadId) || [])
  }
}

export { RealTimeDatabase }

// Singleton instance
export const realTimeDB = new RealTimeDatabase()
