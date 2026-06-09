    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import { Search, Filter, Bell, Star } from "lucide-react"
    import Link from "next/link"

    export default async function AdminEtalasePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const [{ data: profile }, { data: products }] = await Promise.all([
        supabase.from("profiles").select("full_name, umkm_name, umkm_logo, umkm_description").eq("id", user.id).single(),
        supabase.from("products")
        .select("id, name, slug, price, discount_price, images, rating, total_sold, is_active, is_featured")
        .eq("seller_id", user.id)
        .eq("is_active", true)
        .order("total_sold", { ascending: false })
        .limit(6),
    ])

    const shopName = profile?.umkm_name ?? profile?.full_name ?? "Toko Saya"
    const initials = shopName.slice(0, 2).toUpperCase()

    function getPrice(p: any) {
        const price = p.discount_price ?? p.price
        return `Rp ${Number(price).toLocaleString("id-ID")}`
    }

    const PLACEHOLDER = "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&q=70"
    const COVER_PLACEHOLDER = "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1200&q=70"

    return (
        <main className="min-h-screen bg-white">
        {/* Topbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
            <nav className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/admin/dashboard" className="hover:text-gray-600">Dashboard</Link>
            <span>›</span>
            <span className="text-gray-700 font-medium">Etalase Toko</span>
            </nav>
            <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">
                <span>ℹ️</span>
                <span className="hidden sm:inline">Ini tampilan toko Anda seperti yang dilihat pengunjung. Gunakan pratinjau ini untuk memastikan branding Anda terlihat profesional.</span>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all relative">
                <Bell size={17} />
            </button>
            <Link href="/bantuan" className="px-4 py-2 bg-[#2D7D46] text-white text-sm font-semibold rounded-xl hover:bg-[#236338] transition-all">
                Bantuan
            </Link>
            </div>
        </div>

        {/* Store header */}
        <div className="relative">
            {/* Cover */}
            <div className="h-48 sm:h-56 overflow-hidden">
            <img src={COVER_PLACEHOLDER} alt="cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            {/* Logo + name overlay */}
            <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-10 relative z-10">
                <div className="w-20 h-20 rounded-full bg-[#2D7D46] flex items-center justify-center text-white font-black text-2xl border-4 border-white shadow-lg shrink-0">
                {initials}
                </div>
                <div className="mb-1">
                <h1 className="text-2xl font-black text-white drop-shadow-sm">{shopName}</h1>
                <span className="inline-flex items-center gap-1 mt-1 px-3 py-1 bg-[#2D7D46] text-white text-xs font-semibold rounded-full">
                    <Star size={10} className="fill-white" />
                    Buka: 08:00 – 17:00
                </span>
                </div>
            </div>
            </div>
        </div>

        {/* Product section */}
        <div className="px-6 pb-12">
            <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Produk Unggulan</h2>
            <div className="flex items-center gap-3">
                <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    placeholder="Cari di toko ini..."
                    className="pl-8 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#2D7D46] w-44"
                />
                </div>
                <button className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-all">
                <Filter size={13} /> Filter
                </button>
            </div>
            </div>

            {products && products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {products.map((p: any) => {
                const img = p.images?.[0]
                    ? p.images[0].startsWith("http")
                    ? p.images[0]
                    : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${p.images[0]}`
                    : PLACEHOLDER
                const isNew = false // bisa dicek dari created_at
                const isBest = p.total_sold >= 5

                return (
                    <Link key={p.id} href={`/produk/${p.slug}`} className="group block">
                    <div className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-3 bg-gray-100">
                        <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {isBest && (
                        <span className="absolute top-2.5 left-2.5 text-xs font-bold text-white bg-[#FF6B35] px-2.5 py-1 rounded-full">
                            Terlaris
                        </span>
                        )}
                        {isNew && (
                        <span className="absolute top-2.5 left-2.5 text-xs font-bold text-white bg-[#2D7D46] px-2.5 py-1 rounded-full">
                            New
                        </span>
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 mb-1 group-hover:text-[#2D7D46] transition-colors line-clamp-2">
                        {p.name}
                        </h3>
                        <p className="text-base font-black text-[#2D7D46]">{getPrice(p)}</p>
                        {p.rating > 0 && (
                        <p className="text-xs text-amber-500 mt-0.5">
                            ★ {Number(p.rating).toFixed(1)} | {p.total_sold} terjual
                        </p>
                        )}
                    </div>
                    </Link>
                )
                })}
            </div>
            ) : (
            <div className="text-center py-16 text-gray-400">
                <p className="text-sm">Belum ada produk. Tambahkan produk pertamamu!</p>
                <Link href="/admin/produk/tambah" className="mt-4 inline-block px-5 py-2.5 bg-[#2D7D46] text-white text-sm font-semibold rounded-xl hover:bg-[#236338] transition-all">
                + Tambah Produk
                </Link>
            </div>
            )}
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-100 px-6 py-5 flex items-center justify-between">
            <p className="text-xs text-gray-400">© 2024 BARLING-GO. Memberdayakan UMKM Barlingmascakep.</p>
            <div className="flex gap-5 text-xs text-gray-400">
            <a href="#" className="hover:text-gray-600">Tentang Kami</a>
            <a href="#" className="hover:text-gray-600">Pusat Bantuan</a>
            </div>
            <Link href="/ai-assistant" className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6B35] text-white text-xs font-bold rounded-xl hover:bg-[#e5592a] transition-all">
            🤖 Tanya Asisten Toko
            </Link>
        </footer>
        </main>
    )
    }
