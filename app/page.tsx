"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, Target, Brain, Users, FileText, AlertTriangle, Menu } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function HomePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Fade-in animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in-visible")
          }
        })
      },
      { threshold: 0.15 }
    )
    document.querySelectorAll(".fade-in").forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const handleProtectedNav = (path: string) => {
    if (user) {
      router.push(path)
    } else {
      router.push("/signin")
    }
  }

  const handleSignIn = () => {
    router.push("/signin")
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-gradient-to-br from-blue-100 via-blue-200 to-blue-400 animate-gradient-x">
      {/* Animated Blobs */}
      <div className="absolute top-[-120px] left-[-120px] z-0">
        <div className="blob blob-blue animate-blob-slow" />
      </div>
      <div className="absolute bottom-[-100px] right-[-100px] z-0">
        <div className="blob blob-pink animate-blob" />
      </div>
      <div className="absolute top-1/2 left-[-80px] z-0">
        <div className="blob blob-yellow animate-blob-delay" />
      </div>

      {/* Header */}
      <header className="border-b bg-white/60 backdrop-blur-lg sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
          {/* Logo and Hamburger */}
          <div className="flex items-center space-x-6">
            <Brain className="h-8 w-8 text-blue-600 drop-shadow animate-spin-slow" />
            <span className="text-2xl font-extrabold text-gray-900 tracking-tight">TalentSleuth AI</span>
            <div className="md:hidden">
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="p-2 rounded hover:bg-blue-100 transition"
                aria-label="Open navigation menu"
              >
                <Menu className="h-6 w-6 text-blue-700" />
              </button>
            </div>
          </div>
          {/* Desktop Nav */}
          <nav className="hidden md:flex flex-row items-center space-x-8 w-auto">
            <Link href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              How it Works
            </Link>
            <button
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              onClick={() => handleProtectedNav("/upload")}
            >
              Get Started
            </button>
          </nav>
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-2 mt-2 md:mt-0">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-gray-700">{user.displayName}</span>
                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded shadow transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white shadow"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
        {/* Mobile Nav Dropdown */}
        {mobileNavOpen && (
          <div className="md:hidden bg-white/90 border-t shadow px-4 py-4 rounded-b-xl">
            <nav className="flex flex-col gap-4">
              <Link
                href="#features"
                className="text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setMobileNavOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setMobileNavOpen(false)}
              >
                How it Works
              </Link>
              <button
                className="text-gray-700 hover:text-blue-600 transition-colors text-left"
                onClick={() => {
                  setMobileNavOpen(false)
                  handleProtectedNav("/upload")
                }}
              >
                Get Started
              </button>
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">{user.displayName}</span>
                  <button
                    onClick={() => {
                      setMobileNavOpen(false)
                      logout()
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    setMobileNavOpen(false)
                    handleSignIn()
                  }}
                >
                  Sign In
                </Button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-28 px-4 relative z-10 fade-in">
        <div className="container mx-auto flex flex-col items-center justify-center">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-16 max-w-3xl w-full text-center border border-blue-100">
            <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-700 text-base md:text-lg shadow animate-fade-in-down">
              <span className="animate-pulse">AI-Powered Talent Intelligence</span>
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight drop-shadow animate-hero-pop">
              Your Virtual <span className="text-blue-600 block">Talent Analyst</span>
            </h1>
            <p className="text-lg md:text-2xl text-gray-700 mb-8 leading-relaxed animate-fade-in-up">
              Autonomously assess candidate fitness by aggregating and analyzing publicly available information across
              multiple professional platforms. Empower your HR team with AI-driven insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-lg px-8 py-3 shadow-lg transition animate-bounce-slow"
                onClick={() => handleProtectedNav("/upload")}
              >
                <Upload className="mr-2 h-5 w-5" />
                Upload Resume
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white/80 backdrop-blur-lg fade-in">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to make informed hiring decisions with AI-powered candidate analysis
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[{
              icon: <FileText className="h-12 w-12 text-blue-600 mb-4" />,
              title: "Smart Resume Parsing",
              desc: "Upload resumes in any format (PDF, DOCX, TXT) and automatically extract key information"
            }, {
              icon: <AlertTriangle className="h-12 w-12 text-orange-600 mb-4" />,
              title: "Red Flag Detection",
              desc: "Identify discrepancies, frequent job changes, and incomplete profiles automatically"
            }, {
              icon: <Target className="h-12 w-12 text-purple-600 mb-4" />,
              title: "Role Matching",
              desc: "One-click role matching based on skills, experience, and career trajectory"
            }, {
              icon: <Brain className="h-12 w-12 text-indigo-600 mb-4" />,
              title: "AI-Driven Insights",
              desc: "Advanced AI analysis provides comprehensive candidate fitness scores"
            }, {
              icon: <Users className="h-12 w-12 text-teal-600 mb-4" />,
              title: "HR Team Dashboard",
              desc: "Collaborative workspace for HR teams to review and manage candidate assessments"
            }].map((feature, idx) => (
              <Card
                key={feature.title}
                className="border-0 shadow-lg hover:shadow-2xl transition-shadow bg-white/90 rounded-xl transform hover:-translate-y-2 hover:scale-105 duration-300 fade-in"
                style={{ animationDelay: `${idx * 0.1 + 0.2}s` }}
              >
                <CardHeader>
                  {feature.icon}
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-blue-100 fade-in">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple 4-step process to get comprehensive candidate insights
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: 1, color: "bg-blue-600", label: "Upload Resume", desc: "Upload candidate resume in PDF, DOCX, or text format" },
              { step: 2, color: "bg-green-600", label: "AI Parsing", desc: "AI extracts key information and professional details" },
              { step: 3, color: "bg-purple-600", label: "GitHub Analysis", desc: "Analyze GitHub profile for technical verification" },
              { step: 4, color: "bg-orange-600", label: "Generate Report", desc: "Receive comprehensive analysis and role matching" }
            ].map((item, idx) => (
              <div className="text-center fade-in" key={item.label} style={{ animationDelay: `${idx * 0.1 + 0.2}s` }}>
                <div className={`${item.color} text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg animate-bounce-slow`}>
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.label}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white shadow-inner fade-in">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 drop-shadow animate-fade-in-down">Ready to Transform Your Hiring Process?</h2>
          <p className="text-xl mb-8 opacity-90 animate-fade-in-up">
            Join forward-thinking HR teams using AI to make better hiring decisions
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-8 py-3 bg-white text-blue-700 font-bold shadow-lg hover:bg-blue-100 hover:text-blue-900 transition animate-bounce"
            onClick={() => handleProtectedNav("/upload")}
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 fade-in">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 animate-spin-slow" />
              <span className="text-xl font-bold">TalentSleuth AI</span>
            </div>
            <p className="text-gray-400">© 2025 TalentSleuth AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}