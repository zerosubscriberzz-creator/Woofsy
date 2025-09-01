import { SearchResultsSkeleton } from "@/components/loading-states"
import { Search } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border sticky top-0 z-40 paw-shadow">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src="/images/purple-paw-icon.png"
              alt="Browse Dogs Paw"
              className="w-8 h-8 rounded-full object-cover animate-pulse"
            />
            <h1 className="text-2xl font-heading font-black text-foreground">Browse Dogs</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-muted-foreground animate-pulse" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="h-10 bg-muted rounded-xl animate-pulse mb-4"></div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-20 bg-muted rounded-full animate-pulse"></div>
            ))}
          </div>
        </div>

        <SearchResultsSkeleton />
      </div>
    </div>
  )
}
