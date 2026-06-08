    import { createClient } from "@/lib/supabase/server"
    import { BarChart2 } from "lucide-react"

    export default async function LaporanPlatformPage() {
    const supabase = await createClient()

    const [
        { data: orders },
        { count: totalUsers },
        { count: totalProducts },
        { data: dailySales },
    ] = await Promise.all([
        supabase.from("orders")
        .select("total_amount, status, payment_status, created_at")
        .not("status", "in", '("cancelled","refunded")'),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("daily_sales").select("date, revenue, order_count").limit(7),
    ])

    const totalRevenue = orders?.filter((o) => o.payment_status === "paid")
        .reduce((s, o) => s + o.total_amount, 0) ?? 0
    const totalOrders = orders?.length ?? 0
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Hitung omzet per bulan (6 bulan terakhir)
    const monthlyMap: Record<string, number> = {}
    orders?.filter((o) => o.payment_status === "paid").forEach((o) => {
        const key = new Date(o.created_at).toLocaleDateString("id-ID", { month: "short", year: "2-digit" })
        monthlyMap[key] = (monthlyMap[key] ?? 0) + o.total_amount
    })
    const monthly = Object.entries(monthlyMap).slice(-6)

    return (
        <main className="min-h-screen bg-gray-50 pt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <h1 className="text-xl font-bold text-gray-900 mb-8">Laporan Platform</h1>

            {/* Summary KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
                { label: "Total Omzet", value: `Rp ${(totalRevenue / 1_000_000).toFixed(1)}jt` },
                { label: "Total Transaksi", value: totalOrders.toLocaleString("id-ID") },
                { label: "Avg. Order Value", value: `Rp ${Math.round(avgOrderValue / 1000)}rb` },
                { label: "Produk Aktif", value: totalProducts?.toLocaleString("id-ID") ?? "0" },
            ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-2xl font-black text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                </div>
            ))}
            </div>

            {/* Monthly revenue table */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
            <div className="flex items-center gap-2 mb-5">
                <BarChart2 size={16} className="text-[#2D7D46]" />
                <h2 className="text-sm font-bold text-gray-900">Omzet Per Bulan</h2>
            </div>
            {monthly.length === 0 ? (
                <p className="text-sm text-gray-300 text-center py-6">Belum ada data.</p>
            ) : (
                <div className="space-y-3">
                {monthly.map(([month, revenue]) => {
                    const maxRevenue = Math.max(...monthly.map(([, r]) => r))
                    const pct = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0
                    return (
                    <div key={month} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-16 shrink-0">{month}</span>
                        <div className="flex-1 h-6 bg-gray-100 rounded-lg overflow-hidden">
                        <div
                            className="h-full bg-[#2D7D46] rounded-lg transition-all"
                            style={{ width: `${pct}%` }}
                        />
                        </div>
                        <span className="text-xs font-bold text-gray-700 w-20 text-right shrink-0">
                        Rp {(revenue / 1_000_000).toFixed(1)}jt
                        </span>
                    </div>
                    )
                })}
                </div>
            )}
            </div>

            {/* 7 hari terakhir */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-4">7 Hari Terakhir</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400">Tanggal</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-400">Pesanan</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-400">Omzet</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {(dailySales ?? []).map((d: any) => (
                    <tr key={d.date}>
                        <td className="px-4 py-2.5 text-gray-700">
                        {new Date(d.date).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold text-gray-700">{d.order_count}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-[#2D7D46]">
                        Rp {Number(d.revenue).toLocaleString("id-ID")}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>
        </div>
        </main>
    )
    }
