"use client"

import { useAuth } from "@/context/AuthContext"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthShell } from "@/components/auth-shell"
import Link from "next/link"

export default function RegisterPage() {
  const { user, registerWithEmail } = useAuth()
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) {
      router.replace("/")
    }
  }, [user, router])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    try {
      await registerWithEmail(name, email, password)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <AuthShell>
      <p className="eyebrow-accent mb-3">Register</p>
      <h1 className="font-display text-3xl font-bold tracking-[-0.02em]">Create your account</h1>
      <p className="mt-2 text-muted-foreground">Register for TalentSleuth AI</p>

      <form onSubmit={handleRegister} className="mt-8 flex flex-col gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Your full name"
            autoComplete="name"
            className="h-11 rounded-xl bg-secondary/50 transition-shadow focus-visible:ring-primary/60 focus-visible:ring-offset-0 focus-visible:shadow-glow"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              className="h-11 rounded-xl bg-secondary/50 transition-shadow focus-visible:ring-primary/60 focus-visible:ring-offset-0 focus-visible:shadow-glow"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              className="h-11 rounded-xl bg-secondary/50 transition-shadow focus-visible:ring-primary/60 focus-visible:ring-offset-0 focus-visible:shadow-glow"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>
        {error && (
          <p role="alert" className="animate-fade-in-up rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
        <Button type="submit" className="btn-glow h-11 w-full rounded-full text-base font-medium">
          Register
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/signin" className="font-medium text-primary-bright underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
