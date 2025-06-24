"use client"

import { useAuth } from "@/context/AuthContext"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Brain } from "lucide-react"

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-400">
      <div className="w-full max-w-md px-4 sm:px-8 bg-white/90 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col items-center border border-blue-100">
        <Brain className="h-12 w-12 sm:h-14 sm:w-14 text-blue-600 mb-4 drop-shadow" />
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-1 text-gray-900 tracking-tight text-center">Create Your Account</h1>
        <p className="text-gray-500 mb-6 text-center text-base sm:text-lg">Register for TalentSleuth AI</p>
        <form onSubmit={handleRegister} className="w-full flex flex-col gap-4 mb-4">
          <input
            type="text"
            placeholder="Name"
            className="border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded px-3 py-2 transition w-full"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded px-3 py-2 transition w-full"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded px-3 py-2 transition w-full"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded px-3 py-2 transition w-full"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white w-full px-6 py-2 rounded font-semibold shadow transition"
          >
            Register
          </Button>
        </form>
        <p className="text-sm mt-4 text-gray-600 text-center">
          Already have an account?{" "}
          <Link href="/signin" className="text-blue-600 underline hover:text-blue-800 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}