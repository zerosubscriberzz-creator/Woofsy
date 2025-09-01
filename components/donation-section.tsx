"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, IndianRupee, Users, Target, Star, Shield } from "lucide-react"

interface DonationSectionProps {
  showTitle?: boolean
  compact?: boolean
  className?: string
}

export default function DonationSection({ showTitle = true, compact = false, className = "" }: DonationSectionProps) {
  const stats = {
    fundsRaised: "₹4,568",
    dogsHelped: 18,
  }

  if (compact) {
    return (
      <div className={`${className}`}>
        <Card className="bg-card border border-violet-500/20 shadow-lg shadow-violet-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-violet-600/20 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-violet-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.fundsRaised}</p>
                  <p className="text-muted-foreground text-sm">{stats.dogsHelped} dogs helped</p>
                </div>
              </div>
              <Link href="/donate">
                <Button className="bg-violet-600 hover:bg-violet-700 text-white font-medium">
                  <IndianRupee className="h-4 w-4 mr-2" />
                  Donate ₹1
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <section className={`py-16 px-6 bg-black ${className}`}>
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card border border-violet-500/20 shadow-2xl shadow-violet-500/10">
            <CardContent className="p-12 text-center">
              {showTitle && (
                <div className="mb-12">
                  <div className="inline-flex items-center space-x-2 bg-violet-600/20 rounded-full px-4 py-2 mb-6">
                    <Target className="h-4 w-4 text-violet-400" />
                    <span className="text-sm font-medium text-violet-300">Support Our Mission</span>
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-6">Help Dogs Find Their Forever Homes</h2>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Every ₹1 donation helps provide food, medical care, and support to stray dogs in need. Join our
                    community of supporters making a real difference.
                  </p>
                </div>
              )}

              {/* Stats Display */}
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-violet-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IndianRupee className="h-8 w-8 text-violet-400" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{stats.fundsRaised}</div>
                  <p className="text-muted-foreground font-medium">Funds Raised</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-violet-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-violet-400" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{stats.dogsHelped}</div>
                  <p className="text-muted-foreground font-medium">Dogs Helped</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-violet-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-violet-400" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">1,247</div>
                  <p className="text-muted-foreground font-medium">Supporters</p>
                </div>
              </div>

              {/* Donation CTA */}
              <div className="bg-black/50 border border-violet-500/20 rounded-2xl p-8 mb-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center mr-4">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Every ₹1 Makes a Difference</h3>
                </div>
                <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                  Join thousands of supporters helping stray dogs find loving homes. Your contribution, no matter the
                  size, creates real impact in a dog's life.
                </p>

                <Link href="/donate" className="inline-block">
                  <Button className="bg-violet-600 hover:bg-violet-700 text-white font-medium text-lg px-8 py-4 rounded-full">
                    <IndianRupee className="h-5 w-5 mr-2" />
                    Donate ₹1 Now
                  </Button>
                </Link>

                <div className="flex items-center justify-center mt-6 space-x-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-violet-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground ml-2">Trusted by 1,247+ donors</span>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="bg-violet-600/10 rounded-xl p-6 border border-violet-500/20">
                <div className="flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-violet-400 mr-2" />
                  <h4 className="font-semibold text-violet-300">100% Transparent</h4>
                </div>
                <p className="text-violet-200 text-sm leading-relaxed">
                  Every donation goes directly to helping stray dogs. We provide complete transparency on how funds are
                  used for medical care, food, shelter, and adoption support.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
