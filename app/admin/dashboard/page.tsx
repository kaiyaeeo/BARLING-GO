    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import { OrdersChart } from "@/components/admin/charts/SalesCharts"
    import Link from "next/link"
    import { ArrowUpRight, Package, ShoppingBag, TrendingUp, Star } from "lucide-react"

    export default async function AdminDashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")
    const { data: profile } = await supabase.from("profiles").select("role, full_name, umkm_name").eq("id", user.id).single()
    if (!["admin", "super_admin"].includes(profile?.role)) redirect("/dashboard")

    const today = new Date()
    const todayStr = today.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })

    // KPI data
    const [
        { count: totalProducts },
        { count: totalProductsLastMonth },
        { data: newOrders },
        { data: revenueData },
        { data: revenueLastMonth },
        { data: reviews },
        { data: weekSales },
    ] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }).eq("seller_id", user.id).eq("is_active", true),
        supabase.from("products").select("*", { count: "exact", head: true })
        .eq("seller_id", user.id).eq("is_active", true)
        .lt("created_at", new Date(today.getFullYear(), today.getMonth(), 1).toISOString()),
        supabase.from("orders")
        .select("id")
        .in("status", ["paid", "processing"])
        .gte("created_at", new Date(today.getFullYear(), today.getMonth(), 1).toISOString()),
        supabase.from("orders")
        .select("total_amount")
        .eq("payment_status", "paid")
        .gte("created_at", new Date(today.getFullYear(), today.getMonth(), 1).toISOString()),
        supabase.from("orders")
        .select("total_amount")
        .eq("payment_status", "paid")
        .gte("created_at", new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString())
        .lt("created_at", new Date(today.getFullYear(), today.getMonth(), 1).toISOString()),
        supabase.from("content_reviews").select("rating"),
        supabase.from("daily_sales").select("date, order_count, revenue").limit(7),
    ])

    const revenue = revenueData?.reduce((s, o) => s + o.total_amount, 0) ?? 0
    const revenuePrev = revenueLastMonth?.reduce((s, o) => s + o.total_amount, 0) ?? 0
    const revenueGrowth = revenuePrev > 0 ? Math.round(((revenue - revenuePrev) / revenuePrev) * 100) : 0
    const productGrowth = totalProductsLastMonth != null && (totalProducts ?? 0) > 0
        ? Math.round((((totalProducts ?? 0) - totalProductsLastMonth) / Math.max(totalProductsLastMonth, 1)) * 100)
        : 0
    const avgRating = reviews?.length
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : "—"

    const kpis = [
        {
        label: "Total Produk",
        value: totalProducts ?? 0,
        sub: productGrowth >= 0 ? `↑${productGrowth}% dari bulan lalu` : `↓${Math.abs(productGrowth)}% dari bulan lalu`,
        subColor: productGrowth >= 0 ? "text-green-600" : "text-red-500",
        icon: Package,
        },
        {
        label: "Pesanan Baru",
        value: newOrders?.length ?? 0,
        sub: "Perlu diproses",
        subColor: "text-gray-400",
        icon: ShoppingBag,
        },
        {
        label: "Pendapatan",
        value: revenue >= 1_000_000
            ? `${(revenue / 1_000_000).toFixed(1)} jt`
            : `${Math.round(revenue / 1_000)} rb`,
        sub: revenueGrowth >= 0 ? `↑${revenueGrowth}% dari bulan lalu` : `↓${Math.abs(revenueGrowth)}% dari bulan lalu`,
        subColor: revenueGrowth >= 0 ? "text-green-600" : "text-red-500",
        icon: TrendingUp,
        },
        {
        label: "Rating Toko",
        value: avgRating,
        sub: `Dari ${reviews?.length ?? 0} ulasan`,
        subColor: "text-gray-400",
        icon: Star,
        },
    ]

    // AI insight — generate from sales data
    const peakDay = weekSales?.reduce((best: any, d: any) =>
        d.order_count > (best?.order_count ?? 0) ? d : best, null)
    const peakDayName = peakDay
        ? new Date(peakDay.date).toLocaleDateString("id-ID", { weekday: "long" })
        : "Rabu"

    const aiInsight = `Aktivitas pengguna web Barling-GO melonjak tajam pada hari ${peakDayName}. Optimalkan pembaruan info produk di hari tersebut!`

    const shopName = profile?.umkm_name ?? profile?.full_name ?? "Toko"

    return (
        <main className="min-h-screen bg-white">
        <div className="px-6 py-8 max-w-5xl">
            {/* Greeting */}
            <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Halo, {profile?.full_name ?? shopName}</h1>
            <p className="text-sm text-gray-400 mt-1">
                Selamat datang di dashboard BarlingGo — Ringkasan Penjualan, {todayStr}
            </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpis.map((kpi) => {
                const Icon = kpi.icon
                return (
                <div key={kpi.label} className="bg-white border border-gray-200 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-500">{kpi.label}</p>
                    <Icon size={16} className="text-gray-300" />
                    </div>
                    <p className="text-3xl font-black text-gray-900 mb-1">{kpi.value}</p>
                    <p className={`text-xs font-medium ${kpi.subColor}`}>{kpi.sub}</p>
                </div>
                )
            })}
            </div>

            {/* Chart */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-base font-bold text-gray-900 mb-6">Penjualan 7 hari terakhir</h2>
            {weekSales && weekSales.length > 0 ? (
                <>
                <OrdersChart data={weekSales as any} />
                {/* AI insight */}
                <div className="mt-5 bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-sm text-gray-500 text-center leading-relaxed">
                    {aiInsight}
                    </p>
                </div>
                </>
            ) : (
                <div className="h-44 flex items-center justify-center text-sm text-gray-300">
                Belum ada data penjualan
                </div>
            )}
            </div>
        </div>
        </main>
    )
    }
