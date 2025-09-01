import { DogPostSkeleton } from "@/components/loading-states"
import Image from "next/image"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground p-4 text-center paw-shadow">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Image
            src="/images/purple-paw-icon.png"
            alt="Woofsy Paw"
            width={20}
            height={20}
            className="w-5 h-5 rounded-full object-cover animate-pulse"
          />
          <span className="font-heading font-bold text-lg">Woofsy</span>
        </div>
        <p className="text-sm opacity-90">Loading your dog rescue platform...</p>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-lg">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <DogPostSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
