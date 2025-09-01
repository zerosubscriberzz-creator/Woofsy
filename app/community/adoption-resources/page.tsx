"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft, BookOpen, Heart, Stethoscope, GraduationCap, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

export default function AdoptionResourcesPage() {
  const router = useRouter()
  const [expandedResource, setExpandedResource] = useState<number | null>(null)

  const resources = [
    {
      icon: Heart,
      title: "Preparing Your Home for a New Dog",
      description: "Essential tips for creating a safe and welcoming environment for your new furry friend.",
      detailedContent: `
        Dog-Proofing Your Home:
        • Remove toxic plants (lilies, azaleas, chocolate, grapes)
        • Secure loose wires and small objects that could be swallowed
        • Install baby gates to restrict access to certain areas
        • Store cleaning supplies and medications out of reach

        Essential Supplies:
        • Food and water bowls (stainless steel or ceramic preferred)
        • High-quality dog food appropriate for your dog's age and size
        • Comfortable bed or crate with soft bedding
        • Collar with ID tag and leash
        • Basic grooming supplies (brush, nail clippers, dog shampoo)
        • Toys for mental stimulation and play

        Creating a Safe Space:
        • Designate a quiet area where your dog can retreat and feel secure
        • Gradually introduce them to different rooms in the house
        • Be patient as they adjust to their new environment (can take 2-8 weeks)
      `,
    },
    {
      icon: Stethoscope,
      title: "Understanding Vaccinations & Vet Visits",
      description: "Complete guide to keeping your adopted dog healthy with proper medical care.",
      detailedContent: `
        Essential Vaccinations:
        • DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza) - Core vaccine
        • Rabies vaccination - Required by law in most areas
        • Bordetella (Kennel Cough) - Recommended for social dogs
        • Lyme disease - If you live in tick-prone areas

        Vaccination Schedule:
        • Puppies: Start at 6-8 weeks, boosters every 3-4 weeks until 16 weeks
        • Adult dogs: Annual boosters or as recommended by your vet
        • Senior dogs (7+ years): May need more frequent check-ups

        Regular Health Care:
        • Annual wellness exams for adult dogs
        • Bi-annual exams for senior dogs
        • Monthly heartworm and flea prevention
        • Regular dental care and teeth cleaning
        • Spaying/neutering if not already done

        Finding a Veterinarian:
        • Research local vets with good reviews
        • Schedule a meet-and-greet before emergencies arise
        • Keep emergency vet contact information handy
      `,
    },
    {
      icon: BookOpen,
      title: "Feeding & Nutrition for Indie Dogs",
      description: "Learn about proper nutrition and feeding schedules for Indian street dogs.",
      detailedContent: `
        Understanding Indie Dog Nutrition:
        • Indian street dogs are naturally hardy and adaptable
        • They often do well on simple, wholesome diets
        • Avoid sudden diet changes - transition gradually over 7-10 days

        Recommended Foods:
        • High-quality commercial dog food with real meat as first ingredient
        • Home-cooked meals: rice, chicken, vegetables (avoid onions, garlic)
        • Fresh water available at all times
        • Occasional treats: carrots, apples (without seeds), plain yogurt

        Feeding Schedule:
        • Puppies (2-6 months): 3-4 meals per day
        • Adult dogs: 2 meals per day (morning and evening)
        • Senior dogs: May need smaller, more frequent meals

        Foods to Avoid:
        • Chocolate, grapes, raisins, onions, garlic
        • Spicy or heavily seasoned foods
        • Bones that can splinter (cooked chicken bones)
        • Excessive treats (should be less than 10% of daily calories)

        Special Considerations:
        • Many street dogs may have sensitive stomachs initially
        • Probiotics can help with digestive health
        • Monitor weight and adjust portions accordingly
      `,
    },
    {
      icon: GraduationCap,
      title: "Training Basics: Building Trust & Obedience",
      description: "Step-by-step training methods to build a strong bond with your rescued dog.",
      detailedContent: `
        Building Trust First:
        • Give your dog time to decompress (3-3-3 rule: 3 days to settle, 3 weeks to learn routine, 3 months to feel at home)
        • Use positive reinforcement only - no punishment or harsh corrections
        • Let them approach you rather than forcing interaction
        • Speak in calm, gentle tones

        Basic Commands to Start With:
        • Sit: Hold treat above their head, say "sit", reward when they sit
        • Stay: Start with short durations, gradually increase
        • Come: Practice in a secure area, always reward when they come
        • Down: Lure with treat from sit position to lying down

        House Training:
        • Take them out frequently (every 2-3 hours initially)
        • Always go out after meals, naps, and play
        • Praise and treat immediately when they go outside
        • Clean accidents thoroughly with enzyme cleaner

        Socialization:
        • Introduce new people, animals, and environments gradually
        • Keep experiences positive and rewarding
        • Watch for signs of stress and give breaks when needed
        • Puppy classes or basic obedience classes can be very helpful

        Common Challenges:
        • Separation anxiety: Start with very short departures
        • Leash pulling: Use positive reinforcement for loose leash walking
        • Resource guarding: Work with a professional trainer if severe
      `,
    },
  ]

  const toggleExpanded = (index: number) => {
    setExpandedResource(expandedResource === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back()
              } else {
                router.push("/")
              }
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-heading font-bold text-foreground">Adoption Resources</h1>
          </div>
          <p className="text-xl text-muted-foreground">Guides and tips for new pet parents.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-6xl">
          {resources.map((resource, index) => {
            const IconComponent = resource.icon
            const isExpanded = expandedResource === index
            return (
              <Card key={index} className="dark-card hover:paw-shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-heading text-card-foreground">{resource.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{resource.description}</p>

                  {isExpanded && (
                    <div className="mt-4 p-4 bg-muted/20 rounded-lg">
                      <div className="text-sm text-card-foreground leading-relaxed whitespace-pre-line">
                        {resource.detailedContent}
                      </div>
                    </div>
                  )}

                  <Button variant="outline" className="mt-4 bg-transparent" onClick={() => toggleExpanded(index)}>
                    {isExpanded ? (
                      <>
                        Show Less
                        <ChevronUp className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Read More
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
