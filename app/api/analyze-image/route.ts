import { type NextRequest, NextResponse } from "next/server"

interface AnalysisResult {
  isNSFW: boolean
  confidence: number
  reason?: string
}

interface BlockedAttempt {
  userId: string
  reason: string
  timestamp: string
  imageSize: number
  userAgent?: string
}

// Store blocked attempts (in production, use a proper database)
const blockedAttempts: BlockedAttempt[] = []

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get("image") as File
    const userId = formData.get("userId") as string

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Convert image to base64 for analysis
    const bytes = await imageFile.arrayBuffer()
    const base64Image = Buffer.from(bytes).toString("base64")

    const analysisResult = await analyzeImageWithAI(base64Image, imageFile.type)

    if (analysisResult.isNSFW) {
      const blockedAttempt: BlockedAttempt = {
        userId: userId || "anonymous",
        reason: "NSFW/harmful content detected",
        timestamp: new Date().toISOString(),
        imageSize: imageFile.size,
        userAgent: request.headers.get("user-agent") || undefined,
      }

      blockedAttempts.push(blockedAttempt)
      console.log("[v0] Blocked upload attempt:", blockedAttempt)
    }

    return NextResponse.json(analysisResult)
  } catch (error) {
    console.error("[v0] Image analysis error:", error)

    return NextResponse.json({
      isNSFW: false,
      confidence: 0,
      reason: "Analysis failed - allowing upload",
    })
  }
}

async function analyzeImageWithAI(base64Image: string, mimeType: string): Promise<AnalysisResult> {
  try {
    const visionApiKey = process.env.GOOGLE_VISION_API_KEY

    if (!visionApiKey) {
      console.error("[v0] Google Vision API key not configured")
      // Allow upload if no API key (only blocking NSFW, not technical issues)
      return {
        isNSFW: false,
        confidence: 0,
        reason: "AI service not configured - allowing upload",
      }
    }

    const safeSearchResponse = await analyzeSafeSearch(base64Image, visionApiKey)
    const isNSFW = detectNSFWContent(safeSearchResponse)
    const confidence = safeSearchResponse.confidence || 0.9

    console.log("[v0] Analysis results:", {
      isNSFW,
      confidence,
    })

    return {
      isNSFW,
      confidence,
      reason: isNSFW ? "Inappropriate content detected" : undefined,
    }
  } catch (error) {
    console.error("[v0] AI analysis failed:", error)

    return {
      isNSFW: false,
      confidence: 0,
      reason: "AI analysis failed - allowing upload",
    }
  }
}

async function analyzeSafeSearch(base64Image: string, apiKey: string) {
  const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: "SAFE_SEARCH_DETECTION",
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`Safe Search API error: ${response.status}`)
  }

  const data = await response.json()
  return {
    safeSearch: data.responses[0]?.safeSearchAnnotation || {},
    confidence: 0.9,
  }
}

function detectNSFWContent(safeSearchResponse: any): boolean {
  const { safeSearch } = safeSearchResponse

  const isAdult = ["LIKELY", "VERY_LIKELY"].includes(safeSearch.adult)
  const isViolence = ["VERY_LIKELY"].includes(safeSearch.violence)
  const isRacy = ["VERY_LIKELY"].includes(safeSearch.racy)

  console.log("[v0] NSFW check:", {
    adult: safeSearch.adult,
    violence: safeSearch.violence,
    racy: safeSearch.racy,
    isBlocked: isAdult || isViolence || isRacy,
  })

  return isAdult || isViolence || isRacy
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const adminKey = url.searchParams.get("adminKey")

  // Simple admin authentication (in production, use proper auth)
  if (adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({
    blockedAttempts: blockedAttempts.slice(-100), // Return last 100 attempts
    totalBlocked: blockedAttempts.length,
  })
}
