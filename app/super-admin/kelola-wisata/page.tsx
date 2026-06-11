    import { createClient } from "@/lib/supabase/server"
    import Link from "next/link"
    import { Plus, Search, Star, TrendingUp, Map } from "lucide-react"
    import ContentPublishToggle from "@/components/super-admin/ContentPublishToggle"
    import ContentDeleteButton from "@/components/super-admin/ContentDeleteButton"

    type SearchParams = { q?: string; kabupaten?: string; kategori?: string; page?: string }

    const KABUPATEN_OPTS = ["Semua Kabupaten","Banjarnegara","Purbalingga","Banyumas","Cilacap","Kebumen"]
    const KATEGORI_OPTS  = ["Semua","Alam","Budaya","Buatan"]

    export default async function KelolaWisataPage({ searchParams }: { searchParams: SearchParams }) {
    const supabase  = await createClient()
    const q         = searchParams.q         ?? ""
    const kabupaten = searchParams.kabupaten ?? "Semua Kabupaten"
    const kategori  = searchParams.kategori  ?? "Semua"
    const page      = parseInt(searchParams.page ?? "1")
    const perPage   = 5
    const from      = (page - 1) * perPage

    // Summary stats
    const [
        { count: totalDest },
        { data: ratingData },
    ] = await Promise.all([
        supabase.from("contents").select("*",{count:"exact",head:true}).eq("type","destinasi"),
        supabase.from("contents").select("rating").eq("type","destinasi").eq("is_published",true),
    ])

    const avgRating = ratingData?.length
        ? (ratingData.reduce((s,r) => s + (r.rating ?? 0), 0) / ratingData.length).toFixed(2)
        : "0"

    // Main query
    let query = supabase
        .from("contents")
        .select("id,title,slug,cover_image,kabupaten,rating,review_count,is_published,tags,created_at", { count: "exact" })
        .eq("type","destinasi")
        .order("created_at", { ascending: false })
        .range(from, from + perPage - 1)

    if (q)                           query = query.ilike("title", `%${q}%`)
    if (kabupaten !== "Semua Kabupaten") query = query.eq("kabupaten", kabupaten)
    if (kategori !== "Semua")        query = query.contains("tags", [kategori.toLowerCase()])

    const { data: destinations, count } = await query
    const totalPages = Math.ceil((count ?? 0) / perPage)

    const PLACEHOLDER = "https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=200&q=60"

    function buildUrl(overrides: Record<string,string>) {
        const params: Record<string,string> = { kabupaten, kategori, page:"1" }
        if (q) params.q = q
        Object.assign(params, overrides)
        return `/super-admin/kelola-wisata?${new URLSearchParams(params)}`
    }

    return (
        <main className="min-h-screen bg-white">
        {/* Top search bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
            <form method="GET" className="flex-1 max-w-sm">
            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="q" defaultValue={q}
                placeholder="Cari destinasi..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D7D46]" />
                {kabupaten !== "Semua Kabupaten" && <input type="hidden" name="kabupaten" value={kabupaten} />}
                {kategori !== "Semua" && <input type="hidden" name="kategori" value={kategori} />}
            </div>
            </form>
            <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg relative">
                🔔
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">⚙️</button>
            <span className="text-sm font-semibold text-gray-700">Super Admin</span>
            </div>
        </div>

        <div className="px-6 py-6 max-w-5xl mx-auto">

            {/* Header */}
            <div className="flex items-start justify-between mb-5">
            <div>
                <h1 className="text-xl font-bold text-gray-900">Manajemen Destinasi Wisata</h1>
                <p className="text-sm text-gray-400 mt-0.5">Kelola dan pantau seluruh aset wisata di wilayah Barling-GO.</p>
            </div>
            <Link href="/super-admin/kelola-wisata/tambah"
                className="flex items-center gap-2 px-4 py-2.5 bg-[#2D7D46] hover:bg-[#236338] text-white text-sm font-bold rounded-xl transition-all">
                <Plus size={15} /> Tambah Destinasi
            </Link>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                <Map size={18} className="text-[#2D7D46]" />
                </div>
                <div>
                <p className="text-xs text-gray-400">Total Destinasi</p>
                <p className="text-2xl font-black text-gray-900">{totalDest ?? 0}</p>
                </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                <Star size={18} className="text-amber-500" />
                </div>
                <div>
                <p className="text-xs text-gray-400">Rating Rata-rata</p>
                <p className="text-2xl font-black text-gray-900">{avgRating}</p>
                </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                <TrendingUp size={18} className="text-blue-500" />
                </div>
                <div>
                <p className="text-xs text-gray-400">Pertumbuhan Pengunjung (Bulan Ini)</p>
                <p className="text-lg font-black text-green-600">+12.4% <span className="text-xs font-normal text-gray-400">Wisatawan Domestik</span></p>
                </div>
            </div>
            </div>

            {/* Filters row */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
            {/* Kabupaten dropdown */}
            <div className="relative">
                <form method="GET">
                {q && <input type="hidden" name="q" value={q} />}
                {kategori !== "Semua" && <input type="hidden" name="kategori" value={kategori} />}
                <select name="kabupaten" defaultValue={kabupaten}
                    onChange={(e) => e.currentTarget.form?.submit()}
                    className="pl-4 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none cursor-pointer appearance-none">
                    {KABUPATEN_OPTS.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
                </form>
            </div>

            {/* Kategori tabs */}
            <div className="flex gap-2">
                {KATEGORI_OPTS.map((kat) => (
                <Link key={kat} href={buildUrl({ kategori: kat })}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    kategori === kat
                        ? "bg-[#2D7D46] text-white border-[#2D7D46]"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}>
                    {kat}
                </Link>
                ))}
            </div>

            <button className="ml-auto flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                ⚙ More Filters
            </button>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[80px_1fr_130px_110px_90px_100px_90px] items-center px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                <span>FOTO</span>
                <span>NAMA DESTINASI</span>
                <span>KABUPATEN</span>
                <span>KATEGORI</span>
                <span>RATING</span>
                <span>STATUS</span>
                <span className="text-right">AKSI</span>
            </div>

            {!destinations || destinations.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                <Map size={36} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">Tidak ada destinasi ditemukan.</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-50">
                {destinations.map((dest: any, i: number) => {
                    const img = dest.cover_image
                    ? dest.cover_image.startsWith("http") ? dest.cover_image
                        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content-images/${dest.cover_image}`
                    : PLACEHOLDER
                    const idStr = `ID: WST-${String(i + 1 + from).padStart(3,"0")}`
                    const tag = dest.tags?.[0] ?? "alam"
                    const tagLabel = tag.charAt(0).toUpperCase() + tag.slice(1)
                    const TAG_COLOR: Record<string,string> = {
                    alam:   "bg-green-100 text-green-700",
                    budaya: "bg-amber-100 text-amber-700",
                    buatan: "bg-blue-100 text-blue-700",
                    }

                    return (
                    <div key={dest.id}
                        className="grid grid-cols-[80px_1fr_130px_110px_90px_100px_90px] items-center px-5 py-4 hover:bg-gray-50/70 transition-colors">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        <img src={img} alt={dest.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 pr-3">
                        <p className="text-sm font-semibold text-gray-800 truncate">{dest.title}</p>
                        <p className="text-xs text-gray-400">{idStr}</p>
                        </div>
                        <p className="text-sm text-gray-600">{dest.kabupaten ?? "—"}</p>
                        <div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TAG_COLOR[tag.toLowerCase()] ?? "bg-gray-100 text-gray-600"}`}>
                            {tagLabel}
                        </span>
                        </div>
                        <div className="flex items-center gap-1">
                        <Star size={13} className="fill-amber-400 text-amber-400" />
                        <span className="text-sm font-semibold text-gray-800">
                            {dest.rating ? Number(dest.rating).toFixed(1) : "—"}
                        </span>
                        </div>
                        <div>
                        <span className={`flex items-center gap-1.5 text-xs font-semibold ${dest.is_published ? "text-green-600" : "text-gray-400"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${dest.is_published ? "bg-green-500" : "bg-gray-400"}`} />
                            {dest.is_published ? "Published" : "Draft"}
                        </span>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                        <Link href={`/super-admin/kelola-wisata/${dest.id}/edit`}
                            className="p-1.5 text-gray-400 hover:text-[#2D7D46] hover:bg-green-50 rounded-lg transition-all text-sm">
                            ✏️
                        </Link>
                        <ContentDeleteButton contentId={dest.id} />
                        </div>
                    </div>
                    )
                })}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/50">
                <p className="text-sm text-gray-400">
                Menampilkan {Math.min(perPage, destinations?.length ?? 0)} dari {count ?? 0} destinasi
                </p>
                {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                    {page > 1 && <Link href={buildUrl({page:String(page-1)})} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-100">‹</Link>}
                    {Array.from({length:Math.min(totalPages,3)},(_,i)=>i+1).map((pg)=>(
                    <Link key={pg} href={buildUrl({page:String(pg)})}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold ${pg===page?"bg-[#2D7D46] text-white":"border border-gray-200 text-gray-600 hover:bg-gray-100"}`}>
                        {pg}
                    </Link>
                    ))}
                    {page < totalPages && <Link href={buildUrl({page:String(page+1)})} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-100">›</Link>}
                </div>
                )}
            </div>
            </div>
        </div>
        </main>
    )
    }
