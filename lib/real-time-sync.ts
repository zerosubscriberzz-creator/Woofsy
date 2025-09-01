"use client"

import React from "react"

// Real-time synchronization infrastructure for Woofsy app
// Coordinates all real-time services and ensures data consistency

import { RealTimeDatabase } from "./real-time-database"
import { RealTimeChatService } from "./real-time-chat"
import { PaymentService } from "./payment-service"

export interface SyncEvent {
  type: "dog_posted" | "dog_adopted" | "donation_made" | "message_sent" | "engagement_updated"
  data: any
  timestamp: number
  userId: string
}

export class RealTimeSyncService {
  private static instance: RealTimeSyncService
  private eventListeners: Map<string, Set<(event: SyncEvent) => void>> = new Map()
  private database: RealTimeDatabase
  private chatService: RealTimeChatService
  private paymentService: PaymentService
  private syncQueue: SyncEvent[] = []
  private isOnline: boolean = navigator.onLine
  private syncInterval: NodeJS.Timeout | null = null

  private constructor() {
    this.database = new RealTimeDatabase()
    this.chatService = new RealTimeChatService()
    this.paymentService = new PaymentService()
    this.initializeSync()
    this.setupOfflineHandling()
  }

  static getInstance(): RealTimeSyncService {
    if (!RealTimeSyncService.instance) {
      RealTimeSyncService.instance = new RealTimeSyncService()
    }
    return RealTimeSyncService.instance
  }

  private initializeSync() {
    // Start sync interval for real-time updates
    this.syncInterval = setInterval(() => {
      this.processSyncQueue()
      this.broadcastGlobalStats()
    }, 2000)

    // Listen to database changes
    this.database.subscribe("dogsUpdated", (dogs) => {
      this.broadcastEvent({
        type: "dog_posted",
        data: { dogs },
        timestamp: Date.now(),
        userId: "system",
      })
    })

    // Listen to chat changes
    this.chatService.subscribe("messageSent", (message) => {
      this.broadcastEvent({
        type: "message_sent",
        data: { message },
        timestamp: Date.now(),
        userId: message.senderId,
      })
    })

    // Listen to payment changes
    this.paymentService.subscribe("donationCompleted", (payment) => {
      this.broadcastEvent({
        type: "donation_made",
        data: { payment },
        timestamp: Date.now(),
        userId: payment.donorName,
      })
    })
  }

  private setupOfflineHandling() {
    window.addEventListener("online", () => {
      this.isOnline = true
      this.processSyncQueue()
      this.broadcastEvent({
        type: "engagement_updated",
        data: { status: "online" },
        timestamp: Date.now(),
        userId: "system",
      })
    })

    window.addEventListener("offline", () => {
      this.isOnline = false
      this.broadcastEvent({
        type: "engagement_updated",
        data: { status: "offline" },
        timestamp: Date.now(),
        userId: "system",
      })
    })
  }

  // Subscribe to specific event types
  subscribe(eventType: string, callback: (event: SyncEvent) => void) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set())
    }
    this.eventListeners.get(eventType)!.add(callback)

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(eventType)
      if (listeners) {
        listeners.delete(callback)
      }
    }
  }

  // Broadcast event to all subscribers
  private broadcastEvent(event: SyncEvent) {
    // Add to sync queue if offline
    if (!this.isOnline) {
      this.syncQueue.push(event)
      return
    }

    // Broadcast to specific event listeners
    const listeners = this.eventListeners.get(event.type)
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(event)
        } catch (error) {
          console.error("[v0] Error in sync event callback:", error)
        }
      })
    }

    // Broadcast to global listeners
    const globalListeners = this.eventListeners.get("*")
    if (globalListeners) {
      globalListeners.forEach((callback) => {
        try {
          callback(event)
        } catch (error) {
          console.error("[v0] Error in global sync callback:", error)
        }
      })
    }
  }

  // Process queued events when back online
  private processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) return

    const eventsToProcess = [...this.syncQueue]
    this.syncQueue = []

    eventsToProcess.forEach((event) => {
      this.broadcastEvent(event)
    })
  }

  // Broadcast global statistics updates
  private broadcastGlobalStats() {
    const stats = this.getGlobalStats()
    this.broadcastEvent({
      type: "engagement_updated",
      data: { globalStats: stats },
      timestamp: Date.now(),
      userId: "system",
    })
  }

  // Get global app statistics
  async getGlobalStats() {
    const dbStats = await this.database.getStats()
    const donationStats = this.paymentService.getDonationStats()

    return {
      totalDogs: dbStats.totalDogs,
      dogsAdopted: dbStats.adoptedDogs,
      totalUsers: dbStats.totalUsers,
      totalDonations: donationStats.totalAmount,
      dogsHelped: donationStats.dogsHelped,
      lastUpdated: Date.now(),
    }
  }

  // Trigger manual sync
  triggerSync() {
    this.processSyncQueue()
    this.broadcastGlobalStats()
  }

  // Clean up resources
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
    this.eventListeners.clear()
  }
}

// Global sync service instance
export const syncService = RealTimeSyncService.getInstance()

// React hook for using sync service
export function useSyncService() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine)
  const [globalStats, setGlobalStats] = React.useState<any>({})

  React.useEffect(() => {
    const unsubscribeStats = syncService.subscribe("engagement_updated", (event) => {
      if (event.data.globalStats) {
        setGlobalStats(event.data.globalStats)
      }
      if (event.data.status) {
        setIsOnline(event.data.status === "online")
      }
    })

    return unsubscribeStats
  }, [])

  return {
    isOnline,
    globalStats,
    triggerSync: () => syncService.triggerSync(),
    subscribe: (eventType: string, callback: (event: SyncEvent) => void) => syncService.subscribe(eventType, callback),
  }
}
