    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import Link from "next/link"
    import { Search, Download, Printer, Filter } from "lucide-react"
    import OrderActionButton from "@/components/admin/pesanan/OrderActionButton"

    type SearchParams = { tab?: string; q?: string; page?: string; date?: string }

    const TAB_FILTERS: Record<string, string[]> = {
    semua:       [],
    baru:        ["paid"],
    diproses:    ["processing","packing"],
    selesai:     ["delivered"],
    dibatalkan:  ["cancelled"],
    }

    export default async function AdminPesananPage({ searchParams }: { searchParams: SearchParams }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login?mode=seller")

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (!["admin","super_admin"].includes(profile?.role ?? "")) redirect("/dashboard")

    const tab     = searchParams.tab  ?? "semua"
    const q       = searchParams.q    ?? ""
    const page    = parseInt(searchParams.page ?? "1")
    const perPage = 5
    const from    = (page - 1) * perPage

    // Summary counts
    const [
        { count: needProcess },
        { count: inShipping },
        { count: doneToday },
        { count: cancelled },
    ] = await Promise.all([
        supabase.from("orders").select("*",{count:"exact",head:true}).in("status",["paid","processing"]),
        supabase.from("orders").select("*",{count:"exact",head:true}).eq("status","shipped"),
        supabase.from("orders").select("*",{count:"exact",head:true}).eq("status","delivered")
        .gte("updated_at", new Date().toISOString().slice(0,10)),
        supabase.from("orders").select("*",{count:"exact",head:true}).eq("status","cancelled"),
    ])

    // Tab counts
    const tabCounts: Record<string, number> = {}
    await Promise.all(
        Object.entries(TAB_FILTERS).map(async ([key, statuses]) => {
        let q2 = supabase.from("orders").select("*",{count:"exact",head:true})
        if (statuses.length) q2 = q2.in("status", statuses)
        const { count } = await q2
        tabCounts[key] = count ?? 0
        })
    )

    // Main query
    let query = supabase
        .from("orders")
        .select(`
        id, order_number, status, total_amount, payment_status,
        shipping_name, created_at,
        order_items(product_name, product_image, qty, sku:product_id)
        `, { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, from + perPage - 1)

    const tabStatuses = TAB_FILTERS[tab] ?? []
    if (tabStatuses.length) query = query.in("status", tabStatuses)
    if (q) query = query.or(`order_number.ilike.%${q}%,shipping_name.ilike.%${q}%`)

    const { data: orders, count } = await query
    const totalPages = Math.ceil((count ?? 0) / perPage)

    const STATUS_DOT: Record<string,string> = {
        paid:       "bg-blue-500",
        processing: "bg-purple-500",
        packing:    "bg-indigo-500",
        shipped:    "bg-cyan-500",
        delivered:  "bg-green-500",
        cancelled:  "bg-red-500",
        pending:    "bg-amber-500",
    }
    const STATUS_LABEL_MAP: Record<string,string> = {
        paid:"Baru", processing:"Diproses", packing:"Dikemas",
        shipped:"Dikirim", delivered:"Selesai", cancelled:"Dibatalkan", pending:"Pending",
    }

    const TABS = [
        { key:"semua",      label:"Semua" },
        { key:"baru",       label:"Baru" },
        { key:"diproses",   label:"Diproses" },
        { key:"selesai",    label:"Selesai" },
        { key:"dibatalkan", label:"Dibatalkan" },
    ]

    function buildUrl(overrides: Record<string,string>) {
        const params: Record<string,string> = { tab, page:"1" }
        if (q) params.q = q
        Object.assign(params, overrides)
        return `/admin/pesanan?${new URLSearchParams(params)}`
    }

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-5xl mx-auto px-6 py-8">

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Pesanan Masuk</h1>
                <p className="text-sm text-gray-400 mt-0.5">Kelola pesanan dari pembeli dengan mudah dan cepat.</p>
            </div>
            <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
                <Download size={14} /> Export CSV
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-[#2D7D46] hover:bg-[#236338] text-white rounded-xl text-sm font-semibold transition-all">
                <Printer size={14} /> Cetak Label
                </button>
            </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
                { icon:"📦", label:"Perlu Diproses",      value: needProcess ?? 0, color:"text-amber-600" },
                { icon:"🚚", label:"Dalam Pengiriman",     value: inShipping  ?? 0, color:"text-cyan-600" },
                { icon:"✅", label:"Selesai (Hari Ini)",   value: doneToday   ?? 0, color:"text-green-600" },
                { icon:"❌", label:"Dibatalkan",           value: cancelled   ?? 0, color:"text-red-500" },
            ].map((s) => (
                <div key={s.label} className="bg-white border border-gray-200 rounded-2xl px-4 py-4 flex items-center gap-3">
                <span className="text-2xl">{s.icon}</span>
                <div>
                    <p className="text-xs text-gray-400">{s.label}</p>
                    <p className={`text-xl font-black ${s.color}`}>{s.value} Pesanan</p>
                </div>
                </div>
            ))}
            </div>

            {/* Tabs */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex border-b border-gray-100">
                {TABS.map((t) => (
                <Link key={t.key} href={buildUrl({ tab: t.key })}
                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all border-b-2 ${
                    tab === t.key
                        ? "border-[#2D7D46] text-[#2D7D46]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}>
                    {t.label}
                    {tabCounts[t.key] > 0 && (
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                        tab === t.key ? "bg-[#2D7D46] text-white" : "bg-gray-100 text-gray-500"
                    }`}>
                        {tabCounts[t.key]}
                    </span>
                    )}
                </Link>
                ))}
            </div>

            {/* Search + filter */}
            <div className="flex gap-3 px-5 py-4 border-b border-gray-100">
                <form method="GET" className="flex gap-3 flex-1">
                <input type="hidden" name="tab" value={tab} />
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input name="q" defaultValue={q}
                    placeholder="Cari ID pesanan atau nama pembeli..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7D46]/30 focus:border-[#2D7D46]" />
                </div>
                <input type="date" name="date"
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D7D46] text-gray-500" />
                <button type="button"
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                    <Filter size={13} /> Filter
                </button>
                </form>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-[120px_100px_130px_1fr_110px_100px_120px] items-center px-5 py-3 bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <span>NO. PESANAN</span>
                <span>TANGGAL</span>
                <span>NAMA PEMBELI</span>
                <span>PRODUK</span>
                <span>TOTAL</span>
                <span>STATUS</span>
                <span className="text-right">AKSI</span>
            </div>

            {/* Rows */}
            {!orders || orders.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                <p className="text-sm">Tidak ada pesanan ditemukan.</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-50">
                {orders.map((order: any) => {
                    const item    = order.order_items?.[0]
                    const dotColor = STATUS_DOT[order.status] ?? "bg-gray-400"
                    const statusLabel = STATUS_LABEL_MAP[order.status] ?? order.status
                    return (
                    <div key={order.id}
                        className="grid grid-cols-[120px_100px_130px_1fr_110px_100px_120px] items-center px-5 py-4 hover:bg-gray-50/70 transition-colors">
                        <span className="text-sm font-bold text-gray-800">{order.order_number}</span>
                        <span className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"})}
                        </span>
                        <span className="text-sm font-medium text-gray-800 truncate pr-2">{order.shipping_name}</span>
                        <div className="min-w-0 pr-2">
                        {item ? (
                            <>
                            <p className="text-sm text-gray-700 truncate">{item.product_name} x{item.qty}</p>
                            {item.sku && <p className="text-xs text-gray-400">SKU: {item.sku}</p>}
                            </>
                        ) : <p className="text-sm text-gray-400">—</p>}
                        </div>
                        <div>
                        <p className="text-sm font-black text-gray-900">Rp</p>
                        <p className="text-sm font-black text-gray-900">{order.total_amount.toLocaleString("id-ID")}</p>
                        </div>
                        <div>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                            order.status === "paid"      ? "bg-blue-50 text-blue-600" :
                            order.status === "processing" ? "bg-purple-50 text-purple-600" :
                            order.status === "delivered"  ? "bg-green-50 text-green-600" :
                            order.status === "cancelled"  ? "bg-red-50 text-red-500" :
                            "bg-gray-100 text-gray-600"
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                            {statusLabel}
                        </span>
                        </div>
                        <div className="flex justify-end">
                        <OrderActionButton orderId={order.id} status={order.status} />
                        </div>
                    </div>
                    )
                })}
                </div>
            )}

            {/* Table footer */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/50">
                <p className="text-sm text-gray-400">
                Menampilkan {Math.min(perPage, orders?.length ?? 0)} dari {count ?? 0} pesanan
                </p>
                {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                    {page > 1 && (
                    <Link href={buildUrl({ page: String(page-1) })}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-100">‹</Link>
                    )}
                    {Array.from({length: Math.min(totalPages,3)},(_,i)=>i+1).map((pg)=>(
                    <Link key={pg} href={buildUrl({ page: String(pg) })}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold ${
                        pg===page?"bg-[#2D7D46] text-white":"border border-gray-200 text-gray-600 hover:bg-gray-100"
                        }`}>{pg}</Link>
                    ))}
                    {totalPages > 4 && <span className="text-gray-400 text-sm">...</span>}
                    {totalPages > 3 && (
                    <Link href={buildUrl({ page: String(totalPages) })}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100">
                        {totalPages}
                    </Link>
                    )}
                    {page < totalPages && (
                    <Link href={buildUrl({ page: String(page+1) })}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-100">›</Link>
                    )}
                </div>
                )}
            </div>
            </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-100 mt-4">
            <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
            <div>
                <p className="text-sm font-bold text-gray-700">BARLING-GO</p>
                <p className="text-xs text-gray-400">© 2024 BARLING-GO. Memberdayakan UMKM Barlingmascakep.</p>
            </div>
            <div className="flex gap-5 text-xs text-gray-400">
                {["Tentang Kami","Pusat Bantuan","Privasi","Syarat & Ketentuan"].map((l)=>(
                <a key={l} href="#" className="hover:text-gray-600">{l}</a>
                ))}
            </div>
            </div>
        </footer>
        </main>
    )
    }
