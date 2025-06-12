"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { login } from "@/app/actions/auth"
import { Loader2 } from "lucide-react"
import { BorderBeam } from "@/components/magicui/border-beam"
import { LineShadowText } from "@/components/magicui/line-shadow-text"


export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("password", password)

      const result = await login(formData)

      if (result.success) {
        router.push("/dashboard")
        router.refresh()
      } else {
        setError(result.message || "Login failed")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-50">
      {/* Animated background full-screen */}
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.3}
        duration={3}
        repeatDelay={1}
        className={cn(
          "absolute inset-0",
          // optional mask to fade edges; adjust or remove if undesired:
          "[mask-image:radial-gradient(closest-side_at_center,white,transparent)]"
        )}
      />

      {/* Login card, above the animated background */}
      <Card className="relative w-[400px] max-w-full overflow-hidden">
        {/* Animated border/beam behind card content */}
        <BorderBeam duration={8} size={500} />

        <CardHeader className="text-center z-10">
          <CardTitle> <LineShadowText className="text-2xl font-bold text-[#2C3E50]">
              ResourcePortal
            </LineShadowText></CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>

        <CardContent className="z-10">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-[#3498DB] hover:bg-[#2980B9]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <Alert className="mt-4 z-10">
            <AlertDescription className="text-sm text-gray-600">
              <strong>Contact Admin to get Your Login Credentials</strong>
            </AlertDescription>
          </Alert>
        </CardContent>

        {/* Register button removed per your request */}
        {/* 
        <CardFooter className="flex justify-between z-10">
          <Button variant="outline">Register</Button>
          <Button>Login</Button>
        </CardFooter>
        */}
      </Card>
    </div>
  )
}
