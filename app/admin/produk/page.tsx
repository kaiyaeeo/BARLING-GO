    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import Link from "next/link"
    import { Plus, Search } from "lucide-react"
    import ProductRowActions from "@/components/admin/dashboard/ProductRowActions"

    type SearchParams = { q?: string; page?: string }

    export default async function AdminProdukPage({ searchParams }: { searchParams: SearchParams }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login?mode=seller")

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (!["admin","super_admin"].includes(profile?.role ?? "")) redirect("/dashboard")

    const q       = searchParams.q ?? ""
    const page    = parseInt(searchParams.page ?? "1")
    const perPage = 5
    const from    = (page - 1) * perPage

    let query = supabase
        .from("products")
        .select("id,name,slug,price,stock,images,is_active,sku,categories(name)", { count: "exact" })
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false })
        .range(from, from + perPage - 1)

    if (q) query = query.ilike("name", `%${q}%`)

    const { data: products, count } = await query
    const totalPages = Math.ceil((count ?? 0) / perPage)

    const PLACEHOLDER = "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=80&q=60"

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-5xl mx-auto px-6 py-8">

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
            <div>
                <h1 className="text-xl font-bold text-gray-900">Produk Saya</h1>
                <p className="text-sm text-gray-400 mt-0.5">Kelola inventaris produk UMKM Anda di satu tempat.</p>
            </div>
            <Link href="/admin/produk/tambah"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#2D7D46] hover:bg-[#236338] text-white text-sm font-bold rounded-xl transition-all">
                <Plus size={16} /> Tambah Produk
            </Link>
            </div>

            {/* Search */}
            <form method="GET" className="mb-5">
            <div className="relative max-w-sm">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="q" defaultValue={q}
                placeholder="Cari nama produk atau SKU..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7D46]/30 focus:border-[#2D7D46] bg-white" />
            </div>
            </form>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[64px_1fr_130px_80px_150px_100px] items-center px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                <span>FOTO</span>
                <span>NAMA PRODUK</span>
                <span>HARGA</span>
                <span>STOK</span>
                <span>STATUS</span>
                <span className="text-right">AKSI</span>
            </div>

            {/* Rows */}
            {!products || products.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                <p className="text-sm">Belum ada produk.{" "}
                    <Link href="/admin/produk/tambah" className="text-[#2D7D46] hover:underline">Tambah sekarang</Link>
                </p>
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                {products.map((p: any) => {
                    const img = p.images?.[0]
                    ? p.images[0].startsWith("http") ? p.images[0]
                        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${p.images[0]}`
                    : PLACEHOLDER
                    return (
                    <div key={p.id}
                        className="grid grid-cols-[64px_1fr_130px_80px_150px_100px] items-center px-5 py-4 hover:bg-gray-50/70 transition-colors">
                        {/* Foto */}
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        <img src={img} alt={p.name} className="w-full h-full object-cover" />
                        </div>

                        {/* Nama */}
                        <div className="min-w-0 pr-4">
                        <p className={`text-sm font-semibold truncate ${p.is_active ? "text-gray-800" : "text-gray-400"}`}>
                            {p.name}
                        </p>
                        {p.sku && <p className="text-xs text-gray-400 mt-0.5">SKU: {p.sku}</p>}
                        </div>

                        {/* Harga */}
                        <p className={`text-sm font-semibold ${p.is_active ? "text-gray-800" : "text-gray-400"}`}>
                        Rp {p.price.toLocaleString("id-ID")}
                        </p>

                        {/* Stok */}
                        <p className={`text-sm font-semibold ${
                        p.stock === 0 ? "text-red-500" : p.stock <= 5 ? "text-amber-500" : p.is_active ? "text-gray-800" : "text-gray-400"
                        }`}>
                        {p.stock}
                        </p>

                        {/* Status toggle */}
                        <ProductRowActions productId={p.id} isActive={p.is_active} />

                        {/* Aksi */}
                        <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/produk/${p.id}/edit`}
                            className="p-1.5 text-[#2D7D46] hover:bg-green-50 rounded-lg transition-all">
                            ✏️
                        </Link>
                        <button className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all">🗑️</button>
                        </div>
                    </div>
                    )
                })}
                </div>
            )}

            {/* Footer pagination */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/50">
                <p className="text-sm text-gray-400">
                Menampilkan {Math.min(perPage, (products?.length ?? 0))} dari {count ?? 0} produk
                </p>
                {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                    {page > 1 && (
                    <Link href={`/admin/produk?page=${page-1}${q ? `&q=${q}` : ""}`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-100">‹</Link>
                    )}
                    {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((pg) => (
                    <Link key={pg} href={`/admin/produk?page=${pg}${q ? `&q=${q}` : ""}`}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                        pg === page ? "bg-[#2D7D46] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-100"
                        }`}>
                        {pg}
                    </Link>
                    ))}
                    {page < totalPages && (
                    <Link href={`/admin/produk?page=${page+1}${q ? `&q=${q}` : ""}`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-100">›</Link>
                    )}
                </div>
                )}
            </div>
            </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-100 mt-auto">
            <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
            <div>
                <p className="text-sm font-bold text-gray-700">BARLING-GO</p>
                <p className="text-xs text-gray-400">© 2026 Memberdayakan UMKM Barlingmascakep.</p>
            </div>
            <div className="flex gap-5 text-xs text-gray-400">
                {["Tentang Kami","Pusat Bantuan","Privasi","Syarat & Ketentuan"].map((l) => (
                <a key={l} href="#" className="hover:text-gray-600">{l}</a>
                ))}
            </div>
            </div>
        </footer>
        </main>
    )
    }
