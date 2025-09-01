import { MessageThreadSkeleton } from "@/components/loading-states"
import { MessageCircle } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border sticky top-0 z-40 paw-shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-8 w-8 text-primary animate-pulse" />
            <h1 className="text-2xl font-heading font-black text-foreground">Messages</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-card border border-border rounded-2xl">
              <MessageThreadSkeleton />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
