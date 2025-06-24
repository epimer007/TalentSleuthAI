"use client"

import { useAuth } from "@/context/AuthContext"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Brain } from "lucide-react"
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-400">
      <div className="w-full max-w-md px-4 sm:px-8 bg-white/90 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col items-center border border-blue-100">
        <Brain className="h-12 w-12 sm:h-14 sm:w-14 text-blue-600 mb-4 drop-shadow" />
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-1 text-gray-900 tracking-tight text-center">Welcome Back</h1>
        <p className="text-gray-500 mb-6 text-center text-base sm:text-lg">Sign in to your TalentSleuth AI account</p>
        <form onSubmit={handleEmailSignIn} className="w-full flex flex-col gap-4 mb-4">
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
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white w-full px-6 py-2 rounded font-semibold shadow transition"
          >
            Sign In
          </Button>
        </form>
        <div className="flex items-center w-full my-4">
          <div className="flex-grow border-t border-gray-200" />
          <span className="mx-3 text-gray-400 text-xs font-medium">OR</span>
          <div className="flex-grow border-t border-gray-200" />
        </div>
        <Button
          onClick={signIn}
          className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-400 hover:text-red-600 transition flex items-center justify-center gap-2 mb-2"
        >
          <svg className="h-5 w-5" viewBox="0 0 48 48">
            <g>
              <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.6 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.1 5.1 29.3 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20c11 0 20-8.9 20-20 0-1.3-.1-2.7-.3-4z"/>
              <path fill="#34A853" d="M6.3 14.7l7 5.1C15.2 17.1 19.2 14 24 14c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.1 5.1 29.3 3 24 3c-7.2 0-13.4 4.1-16.7 10.1z"/>
              <path fill="#FBBC05" d="M24 44c5.8 0 10.6-1.9 14.1-5.1l-6.5-5.3C29.7 35.6 27 36.5 24 36.5c-5.8 0-10.7-3.9-12.5-9.1l-7 5.4C7.6 39.9 15.2 44 24 44z"/>
              <path fill="#EA4335" d="M44.5 20H24v8.5h11.7C34.6 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.1 5.1 29.3 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20c11 0 20-8.9 20-20 0-1.3-.1-2.7-.3-4z"/>
            </g>
          </svg>
          Sign in with Google
        </Button>
        <p className="text-sm mt-4 text-gray-600 text-center">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-600 underline hover:text-blue-800 font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}