"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, MessageCircle, User, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

export function BottomNav() {
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const updateUnreadCount = () => {
      try {
        const threads = JSON.parse(localStorage.getItem("chatThreads") || "[]")
        const total = threads.reduce((sum: number, thread: any) => sum + (thread.unreadCount || 0), 0)
        setUnreadCount(total)
      } catch (error) {
        console.error("[v0] Error loading unread count:", error)
      }
    }

    updateUnreadCount()

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "chatThreads") {
        updateUnreadCount()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Update every 5 seconds for real-time sync
    const interval = setInterval(updateUnreadCount, 5000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const navItems = [
    {
      href: "/feed",
      icon: Home,
      label: "Home",
      active: pathname === "/feed" || pathname === "/",
    },
    {
      href: "/search",
      icon: Search,
      label: "Search",
      active: pathname === "/search",
    },
    {
      href: "/messages",
      icon: MessageCircle,
      label: "Chat",
      active: pathname === "/messages",
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      href: "/profile",
      icon: User,
      label: "Profile",
      active: pathname === "/profile",
    },
  ]

  return (
    <>
      <Link
        href="/upload"
        className="fixed bottom-20 right-6 z-50 bg-primary hover:bg-primary/90 text-primary-foreground w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 paw-shadow-lg"
      >
        <div className="relative">
          <Plus className="w-6 h-6" />
          <img
            src="/images/purple-paw-icon.png"
            alt="Paw Accent"
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full object-cover opacity-80"
          />
        </div>
      </Link>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border paw-shadow">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 min-w-[60px] relative",
                    item.active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  <div className="relative">
                    <Icon className={cn("h-6 w-6 mb-1", item.active && "text-primary")} />
                    {item.badge && (
                      <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                        {item.badge > 99 ? "99+" : item.badge}
                      </div>
                    )}
                  </div>
                  <span className={cn("text-xs font-medium", item.active && "text-primary")}>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}
