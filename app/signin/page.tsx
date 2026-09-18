"use client"

import { useAuth } from "@/context/AuthContext"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthShell } from "@/components/auth-shell"
import Link from "next/link"

export default function SignInPage() {
  const { user, signIn, signInWithEmail } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) {
      router.replace("/")
    }
  }, [user, router])

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await signInWithEmail(email, password)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <AuthShell>
      <p className="eyebrow-accent mb-3">Sign in</p>
      <h1 className="font-display text-3xl font-bold tracking-[-0.02em]">Welcome back</h1>
      <p className="mt-2 text-muted-foreground">Sign in to your TalentSleuth AI account</p>

      <form onSubmit={handleEmailSignIn} className="mt-8 flex flex-col gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            className="h-11 rounded-xl bg-secondary/50 transition-shadow focus-visible:ring-primary/60 focus-visible:ring-offset-0 focus-visible:shadow-glow"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            className="h-11 rounded-xl bg-secondary/50 transition-shadow focus-visible:ring-primary/60 focus-visible:ring-offset-0 focus-visible:shadow-glow"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && (
          <p role="alert" className="animate-fade-in-up rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
        <Button type="submit" className="btn-glow h-11 w-full rounded-full text-base font-medium">
          Sign In
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="eyebrow">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={signIn}
        className="h-11 w-full rounded-full bg-secondary/50 text-base font-medium transition-colors hover:bg-secondary"
      >
        <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
          <g>
            <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.6 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.1 5.1 29.3 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20c11 0 20-8.9 20-20 0-1.3-.1-2.7-.3-4z"/>
            <path fill="#34A853" d="M6.3 14.7l7 5.1C15.2 17.1 19.2 14 24 14c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.1 5.1 29.3 3 24 3c-7.2 0-13.4 4.1-16.7 10.1z"/>
            <path fill="#FBBC05" d="M24 44c5.8 0 10.6-1.9 14.1-5.1l-6.5-5.3C29.7 35.6 27 36.5 24 36.5c-5.8 0-10.7-3.9-12.5-9.1l-7 5.4C7.6 39.9 15.2 44 24 44z"/>
            <path fill="#EA4335" d="M44.5 20H24v8.5h11.7C34.6 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.1 5.1 29.3 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20c11 0 20-8.9 20-20 0-1.3-.1-2.7-.3-4z"/>
          </g>
        </svg>
        Sign in with Google
      </Button>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primary-bright underline-offset-4 hover:underline">
          Register
        </Link>
      </p>
    </AuthShell>
  )
}
