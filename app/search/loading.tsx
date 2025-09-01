import { SearchResultsSkeleton } from "@/components/loading-states"
import { Search } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border sticky top-0 z-40 paw-shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2">
            <Search className="h-8 w-8 text-primary animate-pulse" />
            <h1 className="text-2xl font-heading font-black text-foreground">Search</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Skeleton className="h-12 w-full rounded-xl mb-4" />
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </div>

        <SearchResultsSkeleton />
      </div>
    </div>
  )
}
