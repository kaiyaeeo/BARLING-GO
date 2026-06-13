    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import { Search, Filter, Bell, Star, MapPin, Package, ShoppingBag, Clock, BadgeCheck, ChevronDown } from "lucide-react"
    import Link from "next/link"

    export default async function AdminEtalasePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const [{ data: profile }, { data: products }, { count: totalProducts }] = await Promise.all([
        supabase.from("profiles")
        .select("full_name, umkm_name, umkm_logo, umkm_description, city, postal_code, promo_package")
        .eq("id", user.id).single(),
        supabase.from("products")
        .select("id, name, slug, price, discount_price, images, rating, total_sold, is_active, is_featured")
        .eq("seller_id", user.id)
        .eq("is_active", true)
        .order("total_sold", { ascending: false })
        .limit(9),
        supabase.from("products")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", user.id)
        .eq("is_active", true),
    ])

    const shopName = profile?.umkm_name ?? profile?.full_name ?? "Toko Saya"
    const initials = shopName.slice(0, 2).toUpperCase()
    const logoUrl = profile?.umkm_logo
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.umkm_logo}`
        : null

    // Aggregate stats derived from visible products
    const avgRating = products && products.length
        ? (products.reduce((sum: number, p: any) => sum + (Number(p.rating) || 0), 0) /
            products.filter((p: any) => p.rating > 0).length || 0)
        : 0
    const totalSold = products?.reduce((sum: number, p: any) => sum + (p.total_sold || 0), 0) ?? 0

    function getPrice(p: any) {
        const price = p.discount_price ?? p.price
        return `Rp ${Number(price).toLocaleString("id-ID")}`
    }

    const PLACEHOLDER = "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&q=70"
    const COVER_PLACEHOLDER = "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1200&q=70"

    const isPremium = (profile?.promo_package || "REGULER").toUpperCase() !== "REGULER"

    return (
        <main className="min-h-screen bg-gray-50">
        {/* Topbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-20">
            <nav className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/admin/dashboard" className="hover:text-gray-600">Dashboard</Link>
            <span>›</span>
            <span className="text-gray-700 font-medium">Etalase Toko</span>
            </nav>
            <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all relative">
                <Bell size={17} />
            </button>
            <Link href="/bantuan" className="px-4 py-2 bg-[#2D7D46] text-white text-sm font-semibold rounded-xl hover:bg-[#236338] transition-all">
                Bantuan
            </Link>
            </div>
        </div>

        {/* Store header */}
        <div className="relative bg-white">
            {/* Cover */}
            <div className="h-40 sm:h-56 overflow-hidden relative">
            <img src={COVER_PLACEHOLDER} alt="cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/10" />
            {isPremium && (
                <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 text-gray-900 text-xs font-black uppercase tracking-wider rounded-full shadow-md">
                <Star size={12} className="fill-gray-900" /> Mitra {profile?.promo_package}
                </span>
            )}
            </div>

            {/* Logo + info */}
            <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 relative z-10">
                <div className="w-24 h-24 rounded-2xl bg-[#2D7D46] flex items-center justify-center text-white font-black text-3xl border-4 border-white shadow-lg shrink-0 overflow-hidden">
                {logoUrl ? (
                    <img src={logoUrl} alt={shopName} className="w-full h-full object-cover" />
                ) : (
                    initials
                )}
                </div>

                <div className="flex-1 pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-black text-gray-900">{shopName}</h1>
                    <BadgeCheck size={20} className="text-[#2D7D46]" />
                </div>
                {profile?.umkm_description && (
                    <p className="text-sm text-gray-500 mt-1 max-w-xl line-clamp-2">{profile.umkm_description}</p>
                )}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-[#2D7D46] text-xs font-semibold rounded-full">
                    <Clock size={11} />
                    Buka: 08:00 – 17:00
                    </span>
                    {profile?.city && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-50 text-gray-600 text-xs font-semibold rounded-full">
                        <MapPin size={11} />
                        {profile.city}
                    </span>
                    )}
                </div>
                </div>

                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-3 sm:gap-6 sm:pl-6 sm:border-l border-gray-100 pt-2 sm:pt-0">
                <div className="text-center">
                    <p className="text-lg font-black text-gray-900">{totalProducts ?? 0}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Produk</p>
                </div>
                <div className="text-center">
                    <p className="text-lg font-black text-gray-900">{totalSold}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Terjual</p>
                </div>
                <div className="text-center">
                    <p className="text-lg font-black text-gray-900 flex items-center justify-center gap-1">
                    {avgRating > 0 ? avgRating.toFixed(1) : "—"}
                    {avgRating > 0 && <Star size={13} className="fill-amber-400 text-amber-400" />}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Rating</p>
                </div>
                </div>
            </div>
            </div>
        </div>

        {/* Category / filter bar */}
        <div className="px-6 pt-5 pb-1 bg-white border-b border-gray-100 sticky top-[57px] z-10">
            <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
            {["Semua Produk", "Terlaris", "Promo", "Terbaru"].map((tab, i) => (
                <button
                key={tab}
                className={`shrink-0 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                    i === 0
                    ? "bg-[#2D7D46] text-white shadow-sm"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
                >
                {tab}
                </button>
            ))}
            </div>
        </div>

        {/* Product section */}
        <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
                <h2 className="text-lg font-bold text-gray-900">Produk Unggulan</h2>
                <p className="text-xs text-gray-400 mt-0.5">Menampilkan {products?.length ?? 0} dari {totalProducts ?? 0} produk aktif</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    placeholder="Cari di toko ini..."
                    className="pl-8 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#2D7D46] w-44 bg-white"
                />
                </div>
                <button className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-all bg-white">
                <Filter size={13} /> Filter
                </button>
                <button className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-all bg-white">
                Urutkan <ChevronDown size={13} />
                </button>
            </div>
            </div>

            {products && products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {products.map((p: any) => {
                const img = p.images?.[0]
                    ? p.images[0].startsWith("http")
                    ? p.images[0]
                    : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${p.images[0]}`
                    : PLACEHOLDER
                const isBest = p.total_sold >= 5
                const hasDiscount = p.discount_price && p.discount_price < p.price
                const discountPct = hasDiscount
                    ? Math.round(((p.price - p.discount_price) / p.price) * 100)
                    : 0

                return (
                    <Link key={p.id} href={`/produk/${p.slug}`} className="group block bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all overflow-hidden">
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                        {isBest && (
                            <span className="text-[11px] font-bold text-white bg-[#FF6B35] px-2.5 py-1 rounded-full">
                            Terlaris
                            </span>
                        )}
                        {hasDiscount && (
                            <span className="text-[11px] font-bold text-white bg-red-500 px-2.5 py-1 rounded-full">
                            -{discountPct}%
                            </span>
                        )}
                        {p.is_featured && !isBest && (
                            <span className="text-[11px] font-bold text-white bg-[#2D7D46] px-2.5 py-1 rounded-full">
                            Unggulan
                            </span>
                        )}
                        </div>
                    </div>
                    <div className="p-3">
                        <h3 className="text-sm font-semibold text-gray-800 mb-1 group-hover:text-[#2D7D46] transition-colors line-clamp-2 min-h-[2.5rem]">
                        {p.name}
                        </h3>
                        <div className="flex items-center gap-2">
                        <p className="text-base font-black text-[#2D7D46]">{getPrice(p)}</p>
                        {hasDiscount && (
                            <p className="text-xs text-gray-400 line-through">Rp {Number(p.price).toLocaleString("id-ID")}</p>
                        )}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
                        {p.rating > 0 && (
                            <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                            <Star size={11} className="fill-amber-400" /> {Number(p.rating).toFixed(1)}
                            </span>
                        )}
                        {p.total_sold > 0 && (
                            <span className="flex items-center gap-1">
                            <ShoppingBag size={11} /> {p.total_sold} terjual
                            </span>
                        )}
                        </div>
                    </div>
                    </Link>
                )
                })}
            </div>
            ) : (
            <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
                <Package size={36} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Belum ada produk. Tambahkan produk pertamamu!</p>
                <Link href="/admin/produk/tambah" className="mt-4 inline-block px-5 py-2.5 bg-[#2D7D46] text-white text-sm font-semibold rounded-xl hover:bg-[#236338] transition-all">
                + Tambah Produk
                </Link>
            </div>
            )}

            {products && totalProducts && totalProducts > products.length && (
            <div className="flex justify-center mt-8">
                <button className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-white hover:border-gray-300 transition-all bg-white">
                Lihat Semua Produk ({totalProducts})
                </button>
            </div>
            )}
        </div>
        </main>
    )
    }