export interface AppStats {
  totalMembers: number
  totalDogs: number
  adoptedDogs: number
  activeDogs: number
  totalDonations: number
  unreadMessages: number
  userPosts: number
  userAdoptions: number
}

export class RealTimeService {
  private static instance: RealTimeService
  private listeners: Map<string, ((stats: AppStats) => void)[]> = new Map()
  private currentStats: AppStats = {
    totalMembers: 0,
    totalDogs: 0,
    adoptedDogs: 0,
    activeDogs: 0,
    totalDonations: 0,
    unreadMessages: 0,
    userPosts: 0,
    userAdoptions: 0,
  }

  private constructor() {
    this.initializeService()
  }

  public static getInstance(): RealTimeService {
    if (!RealTimeService.instance) {
      RealTimeService.instance = new RealTimeService()
    }
    return RealTimeService.instance
  }

  private initializeService() {
    // Listen for localStorage changes
    if (typeof window !== "undefined") {
      window.addEventListener("storage", this.handleStorageChange.bind(this))

      // Update stats every 3 seconds
      setInterval(() => {
        this.updateStats()
      }, 3000)

      // Initial stats calculation
      this.updateStats()
    }
  }

  private handleStorageChange(e: StorageEvent) {
    const relevantKeys = ["uploadedDogs", "donationHistory", "registeredUsers", "chatThreads", "currentUser"]
    if (relevantKeys.includes(e.key || "")) {
      this.updateStats()
    }
  }

  private updateStats() {
    if (typeof window === "undefined") return

    try {
      const uploadedDogs = JSON.parse(localStorage.getItem("uploadedDogs") || "[]")
      const donationHistory = JSON.parse(localStorage.getItem("donationHistory") || "[]")
      const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
      const chatThreads = JSON.parse(localStorage.getItem("chatThreads") || "[]")
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")

      // Calculate comprehensive stats
      const totalDogs = uploadedDogs.length
      const adoptedDogs = uploadedDogs.filter((dog: any) => dog.status === "adopted").length
      const activeDogs = uploadedDogs.filter((dog: any) => dog.status === "active" || dog.status === "available").length
      const totalDonations = donationHistory.reduce((sum: number, donation: any) => sum + (donation.amount || 0), 0)
      const unreadMessages = chatThreads.reduce((sum: number, thread: any) => sum + (thread.unreadCount || 0), 0)

      // User-specific stats
      const userPosts = currentUser.id
        ? uploadedDogs.filter((dog: any) => dog.uploadedByUserId === currentUser.id).length
        : 0
      const userAdoptions = currentUser.id
        ? uploadedDogs.filter((dog: any) => dog.uploadedByUserId === currentUser.id && dog.status === "adopted").length
        : 0

      const newStats: AppStats = {
        totalMembers: registeredUsers.length + 45, // Base members + registered
        totalDogs,
        adoptedDogs,
        activeDogs,
        totalDonations: totalDonations + 3500, // Base donations + actual
        unreadMessages,
        userPosts,
        userAdoptions,
      }

      // Only notify if stats have changed
      if (JSON.stringify(newStats) !== JSON.stringify(this.currentStats)) {
        this.currentStats = newStats
        this.notifyListeners()
      }
    } catch (error) {
      console.error("[v0] Error updating real-time stats:", error)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((callbacks) => {
      callbacks.forEach((callback) => {
        try {
          callback(this.currentStats)
        } catch (error) {
          console.error("[v0] Error in real-time listener callback:", error)
        }
      })
    })
  }

  public subscribe(key: string, callback: (stats: AppStats) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, [])
    }

    this.listeners.get(key)!.push(callback)

    // Immediately call with current stats
    callback(this.currentStats)

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(key)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
        if (callbacks.length === 0) {
          this.listeners.delete(key)
        }
      }
    }
  }

  public getCurrentStats(): AppStats {
    return { ...this.currentStats }
  }

  public forceUpdate() {
    this.updateStats()
  }
}

// Export singleton instance
export const realTimeService = RealTimeService.getInstance()
