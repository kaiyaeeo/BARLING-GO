    "use client"

    import { useState } from "react"
    import Link from "next/link"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import { Eye, EyeOff, Loader2 } from "lucide-react"

    export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { data, error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
        setError(
            error.message === "Invalid login credentials"
            ? "Email atau password salah."
            : error.message
        )
        setLoading(false)
        return
        }

        // Ambil role lalu redirect ke dashboard yang tepat
        const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single()

        const role = profile?.role
        if (role === "super_admin") router.replace("/super-admin/dashboard")
        else if (role === "admin") router.replace("/admin/dashboard")
        else router.replace("/dashboard")
    }

    return (
        <div className="min-h-screen flex">
        {/* Left panel — branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#2D7D46] flex-col justify-between p-12">
            <Link href="/" className="flex items-center gap-1">
            <span className="text-2xl font-black text-white tracking-tight">BARLING</span>
            <span className="text-2xl font-black text-[#a8e6bc] tracking-tight">GO</span>
            <div className="w-2 h-2 rounded-full bg-[#FF6B35] -mt-4 ml-0.5" />
            </Link>

            <div>
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
                Selamat datang<br />kembali!
            </h2>
            <p className="text-green-100/80 text-base leading-relaxed max-w-sm">
                Masuk dan lanjutkan petualanganmu di Barlingmascakep bersama ribuan wisatawan lainnya.
            </p>
            </div>

            <p className="text-green-100/50 text-sm">© 2026 Barling-GO</p>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
            <div className="w-full max-w-md">
            {/* Mobile logo */}
            <Link href="/" className="flex items-center gap-1 mb-8 lg:hidden">
                <span className="text-xl font-black text-gray-900">BARLING</span>
                <span className="text-xl font-black text-[#2D7D46]">GO</span>
            </Link>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">Masuk ke akun</h1>
            <p className="text-sm text-gray-500 mb-8">
                Belum punya akun?{" "}
                <Link href="/register" className="text-[#2D7D46] font-semibold hover:underline">
                Daftar sekarang
                </Link>
            </p>

            {error && (
                <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7D46]/30 focus:border-[#2D7D46] transition-all"
                />
                </div>

                <div>
                <div className="flex justify-between mb-1.5">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <Link href="/forgot-password" className="text-xs text-[#2D7D46] hover:underline">
                    Lupa password?
                    </Link>
                </div>
                <div className="relative">
                    <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7D46]/30 focus:border-[#2D7D46] transition-all"
                    />
                    <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                </div>
                </div>

                <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#2D7D46] hover:bg-[#236338] disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Memproses..." : "Masuk"}
                </button>
            </form>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">atau</div>
            </div>

            {/* Google OAuth */}
            <button
                onClick={async () => {
                await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: { redirectTo: `${location.origin}/auth/callback` },
                })
                }}
                className="w-full py-3 border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-medium text-gray-700 flex items-center justify-center gap-3 transition-all"
            >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Masuk dengan Google
            </button>
            </div>
        </div>
        </div>
    )
    }