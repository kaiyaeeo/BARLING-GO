    "use client"

    import Link from "next/link"
    import { MapPin, Sparkles } from "lucide-react"

    export default function HeroSection() {
    return (
        <section className="relative h-[88vh] min-h-[560px] flex items-end overflow-hidden">
        {/* Background image placeholder — ganti src dengan foto asli Banyumas */}
        <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
            backgroundImage:
                "url('https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=1600&q=80')",
            }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        {/* Signage card — kanan atas, seperti desain */}
        <div className="absolute top-32 right-8 lg:right-16 hidden md:block">
            <div className="bg-[#4a7c59]/90 backdrop-blur-sm text-white rounded-xl px-5 py-4 text-sm font-medium shadow-lg border border-white/20 space-y-2 min-w-[210px]">
            <p className="text-xs text-green-200 font-semibold uppercase tracking-wider mb-3">
                Selamat Datang di Wisata Alam Banyumas
            </p>
            {["Telaga Sunyi", "Hutan Pinus Limpakuwus", "Hutan Pinus Limpakuwus"].map((place, i) => (
                <div key={i} className="flex items-center gap-2">
                <span className="text-green-300">→</span>
                <span>{place}</span>
                </div>
            ))}
            </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full">
            <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-4">
                <MapPin size={16} className="text-green-400" />
                <span className="text-green-300 text-sm font-medium">Barlingmascakep, Jawa Tengah</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.05] mb-4 tracking-tight">
                BARLING-GO
            </h1>

            <p className="text-white/80 text-base lg:text-lg mb-8 leading-relaxed max-w-md">
                Jelajahi kuliner khas 5 kabupaten dalam hitungan detik dengan AI
            </p>

            <div className="flex flex-wrap gap-3">
                <Link
                href="/ai-assistant"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B35] hover:bg-[#e5592a] text-white font-semibold rounded-xl text-sm transition-all hover:scale-105 shadow-lg shadow-orange-900/30"
                >
                <Sparkles size={16} />
                Plan Your Trip
                </Link>
                <Link
                href="/wisata"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-semibold rounded-xl text-sm transition-all border border-white/30"
                >
                Explore Destination
                </Link>
            </div>
            </div>
        </div>
        </section>
    )
    }