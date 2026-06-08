    import { createClient } from "@/lib/supabase/server"
    import Link from "next/link"
    import { Users, Store, ShoppingBag, TrendingUp, ArrowRight, Clock, CheckCircle2, XCircle } from "lucide-react"

    export default async function SuperAdminDashboardPage() {
    const supabase = await createClient()

    const [
        { count: totalUsers },
        { count: totalUMKM },
        { count: totalOrders },
        { data: revenueData },
        { data: pendingVerif },
        { data: recentUsers },
        { data: platformStats },
    ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "user"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin"),
        supabase.from("orders").select("*", { count: "exact", head: true }).not("status", "in", '("cancelled","refunded")'),
        supabase.from("orders").select("total_amount").eq("payment_status", "paid"),
        supabase.from("umkm_verifications").select("id, business_name, created_at, profiles(full_name)").eq("status", "pending").limit(5),
        supabase.from("profiles").select("id, full_name, role, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("site_stats").select("key, value, label"),
    ])

    const totalRevenue = revenueData?.reduce((s, o) => s + o.total_amount, 0) ?? 0

    const kpis = [
        { label: "Total User", value: totalUsers?.toLocaleString("id-ID") ?? "0", icon: Users, color: "text-blue-600", bg: "bg-blue-50", href: "/super-admin/users" },
        { label: "UMKM Terdaftar", value: totalUMKM?.toLocaleString("id-ID") ?? "0", icon: Store, color: "text-green-600", bg: "bg-green-50", href: "/super-admin/umkm" },
        { label: "Total Transaksi", value: totalOrders?.toLocaleString("id-ID") ?? "0", icon: ShoppingBag, color: "text-purple-600", bg: "bg-purple-50", href: "/super-admin/laporan-platform" },
        { label: "Total Omzet Platform", value: `Rp ${(totalRevenue / 1_000_000).toFixed(1)}jt`, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50", href: "/super-admin/laporan-platform" },
    ]

    const ROLE_COLOR: Record<string, string> = {
        user: "bg-blue-100 text-blue-700",
        admin: "bg-green-100 text-green-700",
        super_admin: "bg-purple-100 text-purple-700",
    }

    return (
        <main className="min-h-screen bg-gray-50 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="mb-8">
            <h1 className="text-xl font-bold text-gray-900">Platform Overview</h1>
            <p className="text-sm text-gray-400 mt-0.5">Super Admin · Barling-GO</p>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpis.map((kpi) => {
                const Icon = kpi.icon
                return (
                <Link key={kpi.label} href={kpi.href} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all group">
                    <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
                    <Icon size={18} className={kpi.color} />
                    </div>
                    <p className="text-2xl font-black text-gray-900">{kpi.value}</p>
                    <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                    {kpi.label} <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                </Link>
                )
            })}
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
            {/* Pending UMKM verifications */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <Clock size={15} className="text-amber-500" />
                    <h2 className="text-sm font-bold text-gray-900">Menunggu Verifikasi UMKM</h2>
                </div>
                {(pendingVerif?.length ?? 0) > 0 && (
                    <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    {pendingVerif?.length} pending
                    </span>
                )}
                </div>
                {!pendingVerif || pendingVerif.length === 0 ? (
                <div className="flex items-center gap-2 px-5 py-8 text-gray-400">
                    <CheckCircle2 size={18} className="text-green-400" />
                    <p className="text-sm">Semua UMKM sudah diverifikasi.</p>
                </div>
                ) : (
                <div className="divide-y divide-gray-50">
                    {pendingVerif.map((v: any) => (
                    <Link key={v.id} href={`/super-admin/umkm`} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                        <div>
                        <p className="text-sm font-semibold text-gray-800">{v.business_name}</p>
                        <p className="text-xs text-gray-400">{(v.profiles as any)?.full_name} · {new Date(v.created_at).toLocaleDateString("id-ID")}</p>
                        </div>
                        <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">Pending</span>
                    </Link>
                    ))}
                </div>
                )}
                <div className="px-5 py-3 border-t border-gray-50">
                <Link href="/super-admin/umkm" className="text-xs text-[#2D7D46] hover:underline flex items-center gap-1">
                    Lihat semua <ArrowRight size={11} />
                </Link>
                </div>
            </div>

            {/* Recent users */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900">User Terbaru</h2>
                </div>
                <div className="divide-y divide-gray-50">
                {(recentUsers ?? []).map((u: any) => (
                    <div key={u.id} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#2D7D46]/10 flex items-center justify-center text-[#2D7D46] font-bold text-xs shrink-0">
                        {u.full_name?.[0] ?? "?"}
                        </div>
                        <div>
                        <p className="text-sm font-semibold text-gray-800">{u.full_name ?? "—"}</p>
                        <p className="text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString("id-ID")}</p>
                        </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLOR[u.role] ?? "bg-gray-100 text-gray-600"}`}>
                        {u.role.replace("_", " ")}
                    </span>
                    </div>
                ))}
                </div>
                <div className="px-5 py-3 border-t border-gray-50">
                <Link href="/super-admin/users" className="text-xs text-[#2D7D46] hover:underline flex items-center gap-1">
                    Kelola semua user <ArrowRight size={11} />
                </Link>
                </div>
            </div>
            </div>
        </div>
        </main>
    )
    }
