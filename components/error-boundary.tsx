"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[v0] Error caught by boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="bg-card border border-border paw-shadow rounded-2xl max-w-md w-full">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="font-heading font-bold text-card-foreground">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                We encountered an unexpected error. Don't worry, our team has been notified and we're working on a fix.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/")}
                  className="w-full rounded-xl bg-transparent"
                >
                  Go Home
                </Button>
              </div>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="text-left mt-4">
                  <summary className="cursor-pointer text-sm text-muted-foreground">
                    Error Details (Development)
                  </summary>
                  <pre className="text-xs bg-muted/50 p-2 rounded mt-2 overflow-auto">{this.state.error.stack}</pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export function ErrorFallback({
  error,
  resetError,
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
}: {
  error?: Error
  resetError?: () => void
  title?: string
  description?: string
}) {
  return (
    <Card className="bg-card border border-border paw-shadow rounded-2xl">
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-lg font-heading font-semibold text-card-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>
        {resetError && (
          <Button onClick={resetError} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
