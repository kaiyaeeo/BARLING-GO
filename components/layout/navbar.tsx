    "use client"

    import Link from "next/link"
    import { useState, useEffect } from "react"
    import { Menu, X, ShoppingCart, Search, LogOut, User, LayoutDashboard } from "lucide-react"
    import { createClient } from "@/lib/supabase/client"
    import type { User as SupabaseUser } from "@supabase/supabase-js"

    const navLinks = [
    { label: "Home", href: "/" },
    { label: "Wisata", href: "/wisata" },
    { label: "Kuliner", href: "/kuliner" },
    { label: "Oleh-Oleh", href: "/oleh-oleh" },
    { label: "AI Assistant", href: "/ai-assistant" },
    ]

    export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [user, setUser] = useState<SupabaseUser | null>(null)
    const [profile, setProfile] = useState<{ full_name: string | null; role: string; avatar_url: string | null } | null>(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [cartCount, setCartCount] = useState(0)
    const supabase = createClient()

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener("scroll", onScroll)
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user)
        if (user) fetchProfile(user.id)
        })
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) fetchProfile(session.user.id)
        else setProfile(null)
        })
        return () => subscription.unsubscribe()
    }, [])

    async function fetchProfile(userId: string) {
        const { data } = await supabase
        .from("profiles")
        .select("full_name, role, avatar_url")
        .eq("id", userId)
        .single()
        setProfile(data)
    }

    async function handleLogout() {
        await supabase.auth.signOut()
        setDropdownOpen(false)
        window.location.href = "/"
    }

    useEffect(() => {
        const raw = localStorage.getItem("cart-storage")
        if (raw) {
        try {
            const parsed = JSON.parse(raw)
            const items = parsed?.state?.items ?? []
            setCartCount(items.length)
        } catch { /* noop */ }
        }
    }, [])

    const initials = profile?.full_name
        ? profile.full_name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
        : "U"

    const dashboardHref =
        profile?.role === "super_admin" ? "/super-admin/dashboard"
        : profile?.role === "admin" ? "/admin/dashboard"
        : "/dashboard"

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-white"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center shrink-0">
                <span className="text-xl font-bold text-gray-900 tracking-tight">BARLING</span>
                <span className="text-xl font-bold text-[#4CAF50] tracking-tight">GO</span>
                <div className="ml-0.5 w-2 h-2 rounded-full bg-[#FF6B35] -mt-3" />
            </Link>

            <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">
                    {link.label}
                </Link>
                ))}
            </nav>

            <div className="hidden md:flex items-center gap-2">
                <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">
                <Search size={18} />
                </button>
                <Link href="/keranjang" className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all relative">
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#FF6B35] rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                    </span>
                )}
                </Link>

                {user ? (
                <div className="relative ml-2">
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-[#2D7D46] flex items-center justify-center text-white text-xs font-bold">{initials}</div>
                    )}
                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{profile?.full_name?.split(" ")[0] ?? "Akun"}</span>
                    </button>
                    {dropdownOpen && (
                    <div className="absolute right-0 top-10 w-52 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
                        <div className="px-4 py-3 border-b border-gray-50">
                        <p className="text-sm font-semibold text-gray-900 truncate">{profile?.full_name ?? "User"}</p>
                        <p className="text-xs text-gray-400 capitalize mt-0.5">{profile?.role?.replace("_", " ")}</p>
                        </div>
                        <Link href={dashboardHref} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>
                        <LayoutDashboard size={15} />Dashboard
                        </Link>
                        <Link href="/profil" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>
                        <User size={15} />Profil Saya
                        </Link>
                        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full text-left">
                        <LogOut size={15} />Keluar
                        </button>
                    </div>
                    )}
                </div>
                ) : (
                <Link href="/login" className="ml-2 px-5 py-2 text-sm font-semibold text-white bg-[#2D7D46] hover:bg-[#236338] rounded-lg transition-all">
                    Login
                </Link>
                )}
            </div>

            <button className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            </div>
        </div>

        {mobileOpen && (
            <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4">
            {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="block py-3 text-sm font-medium text-gray-700 border-b border-gray-50" onClick={() => setMobileOpen(false)}>
                {link.label}
                </Link>
            ))}
            {user ? (
                <button onClick={handleLogout} className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-red-500 border border-red-200 rounded-lg">
                <LogOut size={15} /> Keluar
                </button>
            ) : (
                <Link href="/login" className="mt-3 block text-center py-2.5 text-sm font-semibold text-white bg-[#2D7D46] rounded-lg">Login</Link>
            )}
            </div>
        )}
        </header>
    )
    }