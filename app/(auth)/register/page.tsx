    "use client"

    import { useState } from "react"
    import Link from "next/link"
    import { createClient } from "@/lib/supabase/client"
    import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react"

    export default function RegisterPage() {
    const supabase = createClient()

    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault()
        if (password.length < 6) {
        setError("Password minimal 6 karakter.")
        return
        }
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName },
            emailRedirectTo: `${location.origin}/auth/callback`,
        },
        })

        if (error) {
        setError(
            error.message.includes("already registered")
            ? "Email sudah terdaftar. Silakan login."
            : error.message
        )
        setLoading(false)
        return
        }

        setSuccess(true)
        setLoading(false)
    }

    if (success) {
        return (
        <div className="min-h-screen flex items-center justify-center bg-white px-6">
            <div className="max-w-md w-full text-center">
            <CheckCircle2 size={56} className="text-[#2D7D46] mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Cek email kamu!</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Kami telah mengirim link konfirmasi ke <strong className="text-gray-800">{email}</strong>.
                Klik link tersebut untuk mengaktifkan akun.
            </p>
            <Link
                href="/login"
                className="inline-block px-8 py-3 bg-[#2D7D46] text-white font-semibold rounded-xl text-sm hover:bg-[#236338] transition-all"
            >
                Kembali ke Login
            </Link>
            </div>
        </div>
        )
    }

    return (
        <div className="min-h-screen flex">
        {/* Left panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#2D7D46] flex-col justify-between p-12">
            <Link href="/" className="flex items-center gap-1">
            <span className="text-2xl font-black text-white">BARLING</span>
            <span className="text-2xl font-black text-[#a8e6bc]">GO</span>
            <div className="w-2 h-2 rounded-full bg-[#FF6B35] -mt-4 ml-0.5" />
            </Link>
            <div>
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
                Mulai<br />petualanganmu!
            </h2>
            <p className="text-green-100/80 text-base leading-relaxed max-w-sm">
                Bergabung dengan ribuan wisatawan yang sudah menjelajahi keindahan Barlingmascakep.
            </p>
            </div>
            <p className="text-green-100/50 text-sm">© 2026 Barling-GO</p>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
            <div className="w-full max-w-md">
            <Link href="/" className="flex items-center gap-1 mb-8 lg:hidden">
                <span className="text-xl font-black text-gray-900">BARLING</span>
                <span className="text-xl font-black text-[#2D7D46]">GO</span>
            </Link>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">Buat akun baru</h1>
            <p className="text-sm text-gray-500 mb-8">
                Sudah punya akun?{" "}
                <Link href="/login" className="text-[#2D7D46] font-semibold hover:underline">
                Masuk di sini
                </Link>
            </p>

            {error && (
                <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                {error}
                </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
                <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nama lengkap kamu"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7D46]/30 focus:border-[#2D7D46] transition-all"
                />
                </div>

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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
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
                {/* Password strength indicator */}
                {password.length > 0 && (
                    <div className="mt-2 flex gap-1">
                    {[1,2,3].map((level) => (
                        <div key={level} className={`h-1 flex-1 rounded-full transition-colors ${
                        password.length >= level * 4
                            ? level === 1 ? "bg-red-400" : level === 2 ? "bg-amber-400" : "bg-green-500"
                            : "bg-gray-200"
                        }`} />
                    ))}
                    </div>
                )}
                </div>

                <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#2D7D46] hover:bg-[#236338] disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
                </button>
            </form>

            <p className="mt-6 text-xs text-gray-400 text-center leading-relaxed">
                Dengan mendaftar, kamu menyetujui{" "}
                <Link href="/syarat" className="underline">Syarat & Ketentuan</Link>
                {" "}dan{" "}
                <Link href="/privasi" className="underline">Kebijakan Privasi</Link> kami.
            </p>
            </div>
        </div>
        </div>
    )
    }