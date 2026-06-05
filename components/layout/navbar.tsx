    import Link from 'next/link'
    import { ShoppingCart, User, Menu } from 'lucide-react'

    export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
            {/* Logo & Navigasi Kiri */}
            <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-blue-700 tracking-tighter">BARLING-GO</span>
            </Link>
            <div className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
                {/* Link ke halaman publik sesuai struktur */}
                <Link href="/wisata" className="hover:text-blue-600 transition-colors">Wisata</Link>
                <Link href="/kuliner" className="hover:text-blue-600 transition-colors">Kuliner</Link>
                <Link href="/oleh-oleh" className="hover:text-blue-600 transition-colors">Oleh-oleh</Link>
            </div>
            </div>

            {/* Navigasi Kanan (Keranjang & Akun) */}
            <div className="flex items-center gap-4">
            <Link href="/keranjang" className="p-2 hover:bg-gray-100 rounded-full relative">
                <ShoppingCart className="h-5 w-5 text-gray-700" />
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                2
                </span>
            </Link>
            <Link href="/login" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                <User className="h-4 w-4" />
                <span>Masuk</span>
            </Link>
            <button className="md:hidden p-2">
                <Menu className="h-5 w-5" />
            </button>
            </div>
        </div>
        </nav>
    )
    }