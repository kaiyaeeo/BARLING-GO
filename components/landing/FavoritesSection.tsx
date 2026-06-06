    "use client"

    import Link from "next/link"
    import { useState } from "react"

    const tabs = ["All", "Kuliner", "Wisata", "Oleh-oleh"]

    const items = [
    { id: 1, type: "Kuliner", image: "https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&q=80", name: "Soto Sokaraja" },
    { id: 2, type: "Wisata", image: "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=400&q=80", name: "Air Terjun Curug" },
    { id: 3, type: "Oleh-oleh", image: "https://images.unsplash.com/photo-1606914501449-5a96b6ce24ca?w=400&q=80", name: "Jenang Kudus" },
    { id: 4, type: "Wisata", image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=400&q=80", name: "Telaga Sunyi" },
    { id: 5, type: "Kuliner", image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80", name: "Nasi Tempong" },
    { id: 6, type: "Oleh-oleh", image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&q=80", name: "Manisan Salak" },
    { id: 7, type: "Wisata", image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&q=80", name: "Baturaden Resort" },
    { id: 8, type: "Kuliner", image: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80", name: "Sate Blora" },
    ]

    export default function FavoritesSection() {
    const [active, setActive] = useState("All")

    const filtered = active === "All" ? items : items.filter((i) => i.type === active)

    return (
        <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-3">
            <h2 className="text-3xl font-bold text-gray-900">Our Favorite Destinations & UMKM</h2>
            </div>
            <p className="text-center text-sm text-gray-400 mb-8">
            Find your favorite destinations and<br className="sm:hidden" /> UMKM here in Barlingmas cakep
            </p>

            {/* Filter tabs */}
            <div className="flex justify-center gap-2 mb-10">
            {tabs.map((tab) => (
                <button
                key={tab}
                onClick={() => setActive(tab)}
                className={`px-5 py-2 text-sm font-medium rounded-full border transition-all ${
                    active === tab
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
                >
                {tab}
                </button>
            ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((item) => (
                <Link
                key={item.id}
                href={`/produk/${item.id}`}
                className="group relative rounded-2xl overflow-hidden aspect-square cursor-pointer"
                >
                <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="text-white text-sm font-semibold">{item.name}</p>
                    <span className="text-xs text-white/70">{item.type}</span>
                </div>
                </Link>
            ))}
            </div>

            {/* Explore more */}
            <div className="flex justify-center mt-10">
            <Link
                href="/produk"
                className="px-8 py-3 text-sm font-semibold text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
                Explore More
            </Link>
            </div>
        </div>
        </section>
    )
    }