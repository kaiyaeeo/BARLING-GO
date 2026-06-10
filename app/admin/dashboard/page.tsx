    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import Link from "next/link"
    import {
    Package, ShoppingBag, TrendingUp, Star,
    ArrowRight, ChevronRight, AlertTriangle,
    Clock, CheckCircle2, Truck, XCircle
    } from "lucide-react"
    import SellerWeekChart from "@/components/admin/dashboard/SellerWeekChart"
    import AIInsightBox from "@/components/admin/dashboard/AIInsightBox"

    const STATUS_COLOR: Record<string, string> = {
    pending:    "bg-amber-100 text-amber-700",
    paid:       "bg-blue-100 text-blue-700",
    processing: "bg-purple-100 text-purple-700",
    packing:    "bg-indigo-100 text-indigo-700",
    shipped:    "bg-cyan-100 text-cyan-700",
    delivered:  "bg-green-100 text-green-700",
    cancelled:  "bg-red-100 text-red-600",
    }
    const STATUS_LABEL: Record<string, string> = {
    pending: "Menunggu", paid: "Dibayar",
    processing: "Diproses", packing: "Dikemas",
    shipped: "Dikirim", delivered: "Selesai",
    cancelled: "Dibatalkan",
    }

    export default async function AdminDashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login?mode=seller")

    const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name, umkm_name, umkm_logo")
        .eq("id", user.id)
        .single()

    if (!["admin", "super_admin"].includes(profile?.role ?? "")) redirect("/dashboard")

    const today = new Date()
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString()
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
    const todayStr = today.toLocaleDateString("id-ID", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
    })

    // Ambil semua data paralel
    const [
        { count: totalProducts },
        { count: totalProductsLastMonth },
        { data: newOrders },
        { data: revenueThisMonth },
        { data: revenueLastMonth },
        { data: allRatings },
        { data: weekSales },
        { data: recentOrders },
        { data: lowStockProducts },
        { data: topProducts },
    ] = await Promise.all([
        // Total produk aktif milik seller ini
        supabase.from("products")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", user.id)
        .eq("is_active", true),

        // Total produk bulan lalu (untuk growth)
        supabase.from("products")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", user.id)
        .eq("is_active", true)
        .lt("created_at", monthStart),

        // Pesanan baru bulan ini yang perlu diproses
        supabase.from("orders")
        .select("id, order_number, status, total_amount, shipping_name, created_at, order_items(product_name, product_image, qty)")
        .in("status", ["paid", "processing"])
        .gte("created_at", monthStart)
        .order("created_at", { ascending: false })
        .limit(5),

        // Revenue bulan ini
        supabase.from("orders")
        .select("total_amount, created_at")
        .eq("payment_status", "paid")
        .gte("created_at", monthStart),

        // Revenue bulan lalu (untuk growth %)
        supabase.from("orders")
        .select("total_amount")
        .eq("payment_status", "paid")
        .gte("created_at", lastMonthStart)
        .lt("created_at", lastMonthEnd),

        // Rating rata-rata toko dari ulasan produk
        supabase.from("content_reviews")
        .select("rating")
        .limit(100),

        // Data penjualan 7 hari untuk chart
        supabase.from("daily_sales")
        .select("date, order_count, revenue")
        .order("date", { ascending: true })
        .limit(7),

        // 5 pesanan terbaru
        supabase.from("orders")
        .select("id, order_number, status, total_amount, payment_status, shipping_name, created_at")
        .order("created_at", { ascending: false })
        .limit(5),

        // Produk stok menipis (stok <= 5)
        supabase.from("products")
        .select("id, name, stock, sku")
        .eq("seller_id", user.id)
        .eq("is_active", true)
        .lte("stock", 5)
        .order("stock", { ascending: true })
        .limit(5),

        // Top produk berdasarkan total_sold
        supabase.from("products")
        .select("id, name, total_sold, images, price")
        .eq("seller_id", user.id)
        .eq("is_active", true)
        .order("total_sold", { ascending: false })
        .limit(5),
    ])

    // Hitung KPI
    const revenue    = revenueThisMonth?.reduce((s, o) => s + o.total_amount, 0) ?? 0
    const revPrev    = revenueLastMonth?.reduce((s, o) => s + o.total_amount, 0) ?? 0
    const revGrowth  = revPrev > 0 ? Math.round(((revenue - revPrev) / revPrev) * 100) : 0
    const prodGrowth = totalProductsLastMonth != null
        ? Math.round((((totalProducts ?? 0) - totalProductsLastMonth) / Math.max(totalProductsLastMonth, 1)) * 100)
        : 0
    const avgRating = allRatings?.length
        ? (allRatings.reduce((s, r) => s + r.rating, 0) / allRatings.length).toFixed(1)
        : "—"

    // Hitung omzet per hari untuk chart (7 hari terakhir)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        return {
        date: d.toLocaleDateString("id-ID", { weekday: "short" }),
        revenue: 0,
        order_count: 0,
        }
    })
    if (weekSales) {
        weekSales.forEach((s: any, i: number) => {
        if (last7Days[i]) {
            last7Days[i].revenue     = s.revenue ?? 0
            last7Days[i].order_count = s.order_count ?? 0
        }
        })
    }

    // AI insight text
    const peakIdx    = last7Days.reduce((best, d, i) => d.order_count > last7Days[best].order_count ? i : best, 0)
    const peakDay    = last7Days[peakIdx]?.date ?? "Rabu"
    const aiInsight  = `Aktivitas pengguna web Barling-GO melonjak tajam pada hari ${peakDay}. Optimalkan pembaruan info produk di hari tersebut!`

    const shopName   = profile?.umkm_name ?? profile?.full_name ?? "Toko"
    const firstName  = profile?.full_name?.split(" ")[0] ?? shopName

    const kpis = [
        {
        label:    "Total Produk",
        value:    totalProducts ?? 0,
        sub:      `${prodGrowth >= 0 ? "↑" : "↓"}${Math.abs(prodGrowth)}% dari bulan lalu`,
        subColor: prodGrowth >= 0 ? "text-green-600" : "text-red-500",
        icon:     Package,
        href:     "/admin/produk",
        },
        {
        label:    "Pesanan Baru",
        value:    newOrders?.length ?? 0,
        sub:      "Perlu diproses",
        subColor: "text-gray-400",
        icon:     ShoppingBag,
        href:     "/admin/pesanan",
        },
        {
        label:    "Pendapatan",
        value:    revenue >= 1_000_000
                    ? `${(revenue / 1_000_000).toFixed(1)} jt`
                    : `${Math.round(revenue / 1_000)} rb`,
        sub:      `${revGrowth >= 0 ? "↑" : "↓"}${Math.abs(revGrowth)}% dari bulan lalu`,
        subColor: revGrowth >= 0 ? "text-green-600" : "text-red-500",
        icon:     TrendingUp,
        href:     "/admin/laporan",
        },
        {
        label:    "Rating Toko",
        value:    avgRating,
        sub:      `Dari ${allRatings?.length ?? 0} ulasan`,
        subColor: "text-gray-400",
        icon:     Star,
        href:     "/admin/analitik",
        },
    ]

    return (
        <main className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-8">

            {/* Greeting */}
            <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
                Halo, {firstName} 👋
            </h1>
            <p className="text-sm text-gray-400 mt-1">
                Selamat datang di dashboard BarlingGo — Ringkasan Penjualan, {todayStr}
            </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpis.map((kpi) => {
                const Icon = kpi.icon
                return (
                <Link key={kpi.label} href={kpi.href}
                    className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-500">{kpi.label}</p>
                    <Icon size={15} className="text-gray-300 group-hover:text-[#2D7D46] transition-colors" />
                    </div>
                    <p className="text-3xl font-black text-gray-900 mb-1">{kpi.value}</p>
                    <p className={`text-xs font-medium ${kpi.subColor}`}>{kpi.sub}</p>
                </Link>
                )
            })}
            </div>

            {/* Chart */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-gray-900">Penjualan 7 hari terakhir</h2>
                <Link href="/admin/analitik" className="text-xs text-[#2D7D46] hover:underline flex items-center gap-1">
                Lihat analitik <ArrowRight size={11} />
                </Link>
            </div>
            <SellerWeekChart data={last7Days} />
            <AIInsightBox text={aiInsight} />
            </div>

            <div className="grid lg:grid-cols-2 gap-5 mb-5">
            {/* Recent orders */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <ShoppingBag size={15} className="text-[#2D7D46]" />
                    <h2 className="text-sm font-bold text-gray-900">Pesanan Masuk</h2>
                </div>
                <Link href="/admin/pesanan" className="text-xs text-[#2D7D46] hover:underline flex items-center gap-1">
                    Semua <ChevronRight size={11} />
                </Link>
                </div>
                {!recentOrders || recentOrders.length === 0 ? (
                <div className="text-center py-10">
                    <ShoppingBag size={28} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-sm text-gray-400">Belum ada pesanan</p>
                </div>
                ) : (
                <div className="divide-y divide-gray-50">
                    {recentOrders.map((order: any) => (
                    <Link key={order.id} href={`/admin/pesanan/${order.id}`}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                        <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{order.order_number}</p>
                        <p className="text-[11px] text-gray-400">{order.shipping_name}</p>
                        </div>
                        <div className="text-right shrink-0">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full block mb-0.5 ${STATUS_COLOR[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                            {STATUS_LABEL[order.status] ?? order.status}
                        </span>
                        <p className="text-xs font-bold text-gray-800">
                            Rp {order.total_amount.toLocaleString("id-ID")}
                        </p>
                        </div>
                    </Link>
                    ))}
                </div>
                )}
            </div>

            {/* Top products */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <TrendingUp size={15} className="text-[#2D7D46]" />
                    <h2 className="text-sm font-bold text-gray-900">Produk Terlaris</h2>
                </div>
                <Link href="/admin/produk" className="text-xs text-[#2D7D46] hover:underline flex items-center gap-1">
                    Semua <ChevronRight size={11} />
                </Link>
                </div>
                {!topProducts || topProducts.length === 0 ? (
                <div className="text-center py-10">
                    <Package size={28} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-sm text-gray-400 mb-3">Belum ada produk</p>
                    <Link href="/admin/produk/tambah" className="text-xs font-semibold text-[#2D7D46] hover:underline">
                    + Tambah Produk
                    </Link>
                </div>
                ) : (
                <div className="divide-y divide-gray-50">
                    {topProducts.map((p: any, i: number) => {
                    const img = p.images?.[0]
                        ? p.images[0].startsWith("http") ? p.images[0]
                        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${p.images[0]}`
                        : null
                    const maxSold = Math.max(...(topProducts.map((x: any) => x.total_sold ?? 0)))
                    const pct = maxSold > 0 ? ((p.total_sold ?? 0) / maxSold) * 100 : 0
                    return (
                        <Link key={p.id} href={`/admin/produk/${p.id}/edit`}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                        <span className="text-xs font-bold text-gray-300 w-4 shrink-0">{i + 1}</span>
                        {img ? (
                            <img src={img} alt={p.name} className="w-9 h-9 rounded-xl object-cover shrink-0" />
                        ) : (
                            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                            <Package size={13} className="text-gray-400" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-800 truncate">{p.name}</p>
                            <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#2D7D46] rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                        </div>
                        <p className="text-xs font-bold text-gray-600 shrink-0">{p.total_sold ?? 0} terjual</p>
                        </Link>
                    )
                    })}
                </div>
                )}
            </div>
            </div>

            {/* Low stock alert */}
            {lowStockProducts && lowStockProducts.length > 0 && (
            <div className="bg-white border border-amber-200 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-amber-100 bg-amber-50">
                <div className="flex items-center gap-2">
                    <AlertTriangle size={15} className="text-amber-500" />
                    <h2 className="text-sm font-bold text-amber-800">Stok Menipis</h2>
                </div>
                <Link href="/admin/inventori" className="text-xs text-amber-700 hover:underline flex items-center gap-1">
                    Kelola Inventori <ChevronRight size={11} />
                </Link>
                </div>
                <div className="divide-y divide-gray-50">
                {lowStockProducts.map((p: any) => (
                    <Link key={p.id} href={`/admin/produk/${p.id}/edit`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                    <div>
                        <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.sku ?? "No SKU"}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        p.stock === 0
                        ? "bg-red-100 text-red-600"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                        {p.stock === 0 ? "Habis" : `${p.stock} tersisa`}
                    </span>
                    </Link>
                ))}
                </div>
            </div>
            )}

        </div>
        </main>
    )
    }
