    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import Link from "next/link"
    import { Plus, Search, Package, Edit2 } from "lucide-react"
    import ProductStatusToggle from "@/components/admin/dashboard/ProductStatusToggle"

    type SearchParams = { q?: string; status?: string; page?: string }

    export default async function AdminProdukListPage({ searchParams }: { searchParams: SearchParams }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login?mode=seller")

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (!["admin", "super_admin"].includes(profile?.role ?? "")) redirect("/dashboard")

    const q      = searchParams.q ?? ""
    const status = searchParams.status ?? "all"
    const page   = parseInt(searchParams.page ?? "1")
    const perPage = 12
    const from   = (page - 1) * perPage

    let query = supabase
        .from("products")
        .select(`
        id, name, slug, price, discount_price, stock,
        images, is_active, is_top_umkm, is_featured,
        total_sold, rating, sku, created_at,
        categories(name, type)
        `, { count: "exact" })
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false })
        .range(from, from + perPage - 1)

    if (q) query = query.ilike("name", `%${q}%`)
    if (status === "active")   query = query.eq("is_active", true)
    if (status === "inactive") query = query.eq("is_active", false)
    if (status === "low_stock") query = query.lte("stock", 5)

    const { data: products, count } = await query
    const totalPages = Math.ceil((count ?? 0) / perPage)

    const { count: activeCount }   = await supabase.from("products").select("*", { count: "exact", head: true }).eq("seller_id", user.id).eq("is_active", true)
    const { count: inactiveCount } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("seller_id", user.id).eq("is_active", false)
    const { count: lowCount }      = await supabase.from("products").select("*", { count: "exact", head: true }).eq("seller_id", user.id).lte("stock", 5)

    const PLACEHOLDER = "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&q=60"

    return (
        <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-8">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-xl font-bold text-gray-900">Daftar Produk</h1>
                <p className="text-sm text-gray-400 mt-0.5">{count ?? 0} produk terdaftar</p>
            </div>
            <Link href="/admin/produk/tambah"
                className="flex items-center gap-2 px-4 py-2.5 bg-[#2D7D46] hover:bg-[#236338] text-white text-sm font-semibold rounded-xl transition-all">
                <Plus size={15} /> Tambah Produk
            </Link>
            </div>

            {/* Summary tabs */}
            <div className="flex gap-3 mb-5 flex-wrap">
            {[
                { value: "all",       label: "Semua",         count: count ?? 0 },
                { value: "active",    label: "Aktif",         count: activeCount ?? 0 },
                { value: "inactive",  label: "Nonaktif",      count: inactiveCount ?? 0 },
                { value: "low_stock", label: "Stok Menipis",  count: lowCount ?? 0 },
            ].map((tab) => (
                <Link
                key={tab.value}
                href={`/admin/produk?status=${tab.value}${q ? `&q=${q}` : ""}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    status === tab.value
                    ? "bg-[#2D7D46] text-white border-[#2D7D46]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
                >
                {tab.label}
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                    status === tab.value ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                    {tab.count}
                </span>
                </Link>
            ))}
            </div>

            {/* Search */}
            <form method="GET" className="mb-5">
            <div className="relative max-w-sm">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                name="q"
                defaultValue={q}
                placeholder="Cari nama produk..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7D46]/30 focus:border-[#2D7D46] bg-white"
                />
                {status !== "all" && <input type="hidden" name="status" value={status} />}
            </div>
            </form>

            {/* Product grid */}
            {!products || products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <Package size={40} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-400 text-sm mb-4">
                {q ? `Produk "${q}" tidak ditemukan.` : "Belum ada produk."}
                </p>
                <Link href="/admin/produk/tambah"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2D7D46] text-white text-sm font-semibold rounded-xl hover:bg-[#236338] transition-all">
                <Plus size={15} /> Tambah Produk Pertama
                </Link>
            </div>
            ) : (
            <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((p: any) => {
                    const img = p.images?.[0]
                    ? p.images[0].startsWith("http") ? p.images[0]
                        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${p.images[0]}`
                    : PLACEHOLDER
                    const discounted = p.discount_price && p.discount_price < p.price

                    return (
                    <div key={p.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden group hover:shadow-md transition-all">
                        {/* Image */}
                        <div className="relative aspect-square overflow-hidden">
                        <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {!p.is_active && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-xs font-bold text-white bg-black/50 px-2.5 py-1 rounded-full">Nonaktif</span>
                            </div>
                        )}
                        {p.stock === 0 && p.is_active && (
                            <span className="absolute top-2 left-2 text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">Habis</span>
                        )}
                        {p.stock > 0 && p.stock <= 5 && (
                            <span className="absolute top-2 left-2 text-[10px] font-bold text-white bg-amber-500 px-2 py-0.5 rounded-full">Menipis</span>
                        )}
                        </div>

                        {/* Info */}
                        <div className="p-3">
                        <p className="text-xs font-semibold text-gray-800 truncate mb-1">{p.name}</p>

                        <div className="flex items-center justify-between mb-2">
                            <div>
                            {discounted ? (
                                <>
                                <p className="text-sm font-black text-[#2D7D46]">Rp {p.discount_price.toLocaleString("id-ID")}</p>
                                <p className="text-[11px] text-gray-400 line-through">Rp {p.price.toLocaleString("id-ID")}</p>
                                </>
                            ) : (
                                <p className="text-sm font-black text-gray-900">Rp {p.price.toLocaleString("id-ID")}</p>
                            )}
                            </div>
                            <div className="text-right">
                            <p className="text-[11px] text-gray-400">Stok</p>
                            <p className={`text-xs font-bold ${p.stock === 0 ? "text-red-500" : p.stock <= 5 ? "text-amber-600" : "text-gray-700"}`}>
                                {p.stock}
                            </p>
                            </div>
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2.5">
                            <span>{p.total_sold ?? 0} terjual</span>
                            {p.rating > 0 && <span>★ {Number(p.rating).toFixed(1)}</span>}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <Link
                            href={`/admin/produk/${p.id}/edit`}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all"
                            >
                            <Edit2 size={11} /> Edit
                            </Link>
                            <ProductStatusToggle
                            productId={p.id}
                            isActive={p.is_active}
                            />
                        </div>
                        </div>
                    </div>
                    )
                })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <Link
                        key={pg}
                        href={`/admin/produk?status=${status}&page=${pg}${q ? `&q=${q}` : ""}`}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold border transition-all ${
                        pg === page
                            ? "bg-[#2D7D46] text-white border-[#2D7D46]"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                        }`}
                    >
                        {pg}
                    </Link>
                    ))}
                </div>
                )}
            </>
            )}
        </div>
        </main>
    )
    }
