    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import { RevenueChart, OrdersChart } from "@/components/admin/charts/SalesCharts"

    export default async function AdminAnalitikPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (!["admin", "super_admin"].includes(profile?.role)) redirect("/dashboard")

    const [{ data: dailySales }, { data: topProducts }] = await Promise.all([
        supabase.from("daily_sales").select("date, revenue, order_count").limit(30),
        supabase.from("top_products").select("name, total_sold, total_revenue").limit(5),
    ])

    return (
        <main className="min-h-screen bg-white">
        <div className="px-6 py-8 max-w-5xl">
            <h1 className="text-xl font-bold text-gray-900 mb-8">Analitik Toko</h1>

            <div className="space-y-5">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Omzet 30 Hari Terakhir</h2>
                {dailySales?.length ? <RevenueChart data={dailySales as any} /> : (
                <p className="text-sm text-gray-300 text-center py-10">Belum ada data</p>
                )}
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Jumlah Pesanan Harian</h2>
                {dailySales?.length ? <OrdersChart data={dailySales as any} /> : (
                <p className="text-sm text-gray-300 text-center py-10">Belum ada data</p>
                )}
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Produk Terlaris</h2>
                {topProducts?.length ? (
                <div className="space-y-3">
                    {topProducts.map((p: any, i) => {
                    const maxSold = Math.max(...topProducts.map((x: any) => x.total_sold))
                    const pct = maxSold > 0 ? (p.total_sold / maxSold) * 100 : 0
                    return (
                        <div key={i} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-300 w-4 shrink-0">{i + 1}</span>
                        <div className="flex-1">
                            <div className="flex justify-between mb-1">
                            <p className="text-xs font-semibold text-gray-700 truncate">{p.name}</p>
                            <p className="text-xs font-bold text-[#2D7D46] shrink-0 ml-2">{p.total_sold} terjual</p>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#2D7D46] rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                        </div>
                        </div>
                    )
                    })}
                </div>
                ) : (
                <p className="text-sm text-gray-300 text-center py-6">Belum ada data</p>
                )}
            </div>
            </div>
        </div>
        </main>
    )
    }
