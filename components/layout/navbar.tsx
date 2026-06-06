    "use client"

    import Link from "next/link"
    import { useState, useEffect } from "react"
    import { Menu, X, ShoppingCart, Search, User } from "lucide-react"

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

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener("scroll", onScroll)
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    return (
        <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm"
            : "bg-white"
        }`}
        >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
                <div className="flex items-center">
                <span className="text-xl font-bold text-gray-900 tracking-tight">
                    BARLING
                </span>
                <span className="text-xl font-bold text-[#4CAF50] tracking-tight">GO</span>
                <div className="ml-0.5 w-2 h-2 rounded-full bg-[#FF6B35] -mt-3" />
                </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                >
                    {link.label}
                </Link>
                ))}
            </nav>

            {/* Right actions */}
            <div className="hidden md:flex items-center gap-2">
                <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">
                <Search size={18} />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all relative">
                <ShoppingCart size={18} />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#FF6B35] rounded-full" />
                </button>
                <Link
                href="/login"
                className="ml-2 px-5 py-2 text-sm font-semibold text-white bg-[#2D7D46] hover:bg-[#236338] rounded-lg transition-all"
                >
                Login
                </Link>
            </div>

            {/* Mobile toggle */}
            <button
                className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
            <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4">
            {navLinks.map((link) => (
                <Link
                key={link.href}
                href={link.href}
                className="block py-3 text-sm font-medium text-gray-700 border-b border-gray-50"
                onClick={() => setMobileOpen(false)}
                >
                {link.label}
                </Link>
            ))}
            <Link
                href="/login"
                className="mt-3 block text-center py-2.5 text-sm font-semibold text-white bg-[#2D7D46] rounded-lg"
            >
                Login
            </Link>
            </div>
        )}
        </header>
    )
    }