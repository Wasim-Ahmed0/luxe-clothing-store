import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import { signIn } from "next-auth/react"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react"
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function AuthPage() {
  const router = useRouter()
  const [isSignIn, setIsSignIn] = useState(true)

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    })

    if (res?.error) {
      setError(res.error)
    } else {
      router.push("/")
    }

    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account")
      }

      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (res?.error) {
        setError(res.error)
      } else {
        router.push("/")
      }
    } catch (err) {
      setError((err as Error).message)
    }

    setLoading(false)
  }

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" })
  }

  const toggleForm = () => {
    setIsSignIn(!isSignIn)
    setEmail("")
    setPassword("")
    setName("")
    setShowPassword(false)
    setRememberMe(false)
    setAcceptTerms(false)
    setError(null)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-stone-50 pt-16 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="w-full max-w-6xl flex flex-col md:flex-row shadow-xl rounded-lg overflow-hidden">
            {/* Left image */}
            <div className="md:w-1/2 relative hidden md:block">
              <div className="absolute inset-0 bg-black/30 z-10" />
              <Image
                src="/images/vintage-man-asset.jpg"
                alt="LUXE lifestyle"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white p-12">
                <h2 className="text-3xl font-light tracking-wider mb-4">LUXE MEMBERSHIP</h2>
                <p className="text-center text-lg opacity-90 mb-6">
                  Join our exclusive community of discerning gentlemen who appreciate the finer things in life.
                </p>
                <div className="w-16 h-0.5 bg-amber-400" />
              </div>
            </div>
            {/* Right form */}
            <div className="md:w-1/2 bg-white p-8 md:p-12 relative overflow-hidden">
              <div className="relative h-full">
                {error && (
                  <div className="mb-4 text-red-600 text-center text-sm">{error}</div>
                )}

                {/* Sign In */}
                <div className={`transition-all duration-500 ease-in-out ${isSignIn ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 absolute inset-0 pointer-events-none"}`}>
                  <h1 className="text-2xl md:text-3xl font-light text-stone-900 mb-6">Sign In</h1>
                  <form onSubmit={handleSignIn} className="space-y-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail size={18} className="text-stone-400" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2 border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-amber-800 focus:border-amber-800 sm:text-sm"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1">Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock size={18} className="text-stone-400" />
                        </div>
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="block w-full pl-10 pr-10 py-2 border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-amber-800 focus:border-amber-800 sm:text-sm"
                          placeholder="••••••••"
                        />
                        <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff size={18} className="text-stone-400 hover:text-stone-600" /> : <Eye size={18} className="text-stone-400 hover:text-stone-600" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input id="remember-me" type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="h-4 w-4 text-amber-800 focus:ring-amber-800 border-stone-300 rounded" />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-stone-700">Remember me</label>
                      </div>
                      <div className="text-sm">
                        <Link href="#" className="font-medium text-amber-800 hover:text-amber-700">Forgot password?</Link>
                      </div>
                    </div>
                    <div>
                      <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-800 hover:bg-amber-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-800">
                        {loading ? "Signing in..." : "Sign in"}
                      </button>
                    </div>
                  </form>
                  <div className="mt-6 relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-300" /></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-stone-500">Or continue with</span></div>
                  </div>
                  <div className="mt-6">
                    <button onClick={handleGoogleSignIn} className="w-full flex justify-center items-center py-2 px-4 border border-stone-300 rounded-md shadow-sm text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-800">
                      {/* Google icon SVG */}
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24"><path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.79-1.677-4.184-2.702-6.735-2.702-5.522 0-10 4.478-10 10s4.478 10 10 10c8.396 0 10.249-7.85 9.426-11.748l-9.426 0.082z" fill="#4285F4"/></svg>
                      Google
                    </button>
                  </div>
                  <div className="mt-6 text-center"><p className="text-sm text-stone-600">Don’t have an account? <button type="button" onClick={toggleForm} className="font-medium text-amber-800 hover:text-amber-700 inline-flex items-center">Sign up <ArrowRight size={16} className="ml-1" /></button></p></div>
                </div>

                {/* Sign Up */}
                <div className={`transition-all duration-500 ease-in-out ${!isSignIn ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 absolute inset-0 pointer-events-none"}`}
                >
                  <h1 className="text-2xl md:text-3xl font-light text-stone-900 mb-6">Create Account</h1>
                  <form onSubmit={handleSignUp} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User size={18} className="text-stone-400" />
                        </div>
                        <input
                          id="name"
                          type="text"
                          required
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2 border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-amber-800 focus:border-amber-800 sm:text-sm"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="email-signup" className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail size={18} className="text-stone-400" />
                        </div>
                        <input
                          id="email-signup"
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2 border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-amber-800 focus:border-amber-800 sm:text-sm"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="password-signup" className="block text-sm font-medium text-stone-700 mb-1">Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock size={18} className="text-stone-400" />
                        </div>
                        <input
                          id="password-signup"
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="block w-full pl-10 pr-10 py-2 border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-amber-800 focus:border-amber-800 sm:text-sm"
                          placeholder="••••••••" />
                        <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff size={18} className="text-stone-400 hover:text-stone-600" /> : <Eye size={18} className="text-stone-400 hover:text-stone-600" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input id="terms" type="checkbox" required checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} className="h-4 w-4 text-amber-800 focus:ring-amber-800 border-stone-300 rounded" />
                      <label htmlFor="terms" className="ml-2 block text-sm text-stone-700">I agree to the <Link href="#" className="font-medium text-amber-800 hover:text-amber-700">Terms of Service</Link> and <Link href="#" className="font-medium text-amber-800 hover:text-amber-700">Privacy Policy</Link></label>
                    </div>
                    <div>
                      <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-800 hover:bg-amber-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-800">
                        {loading ? "Creating..." : "Create account"}
                      </button>
                    </div>
                  </form>
                  <div className="mt-6 relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-300" /></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-stone-500">Or continue with</span></div>
                  </div>
                  <div className="mt-6">
                    <button onClick={handleGoogleSignIn} className="w-full flex justify-center items-center py-2 px-4 border border-stone-300 rounded-md shadow-sm text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-800">
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24"><path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.79-1.677-4.184-2.702-6.735-2.702-5.522 0-10 4.478-10 10s4.478 10 10 10c8.396 0 10.249-7.85 9.426-11.748l-9.426 0.082z" fill="#4285F4"/></svg>
                      Google
                    </button>
                  </div>
                  <div className="mt-6 text-center"><p className="text-sm text-stone-600">Already have an account? <button type="button" onClick={toggleForm} className="font-medium text-amber-800 hover:text-amber-700 inline-flex items-center">Sign in <ArrowRight size={16} className="ml-1" /></button></p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
