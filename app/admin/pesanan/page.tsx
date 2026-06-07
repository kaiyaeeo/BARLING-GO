    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import Link from "next/link"
    import { ChevronRight, Package } from "lucide-react"

    const STATUS_LABEL: Record<string, { label: string; color: string }> = {
    pending:    { label: "Pending",    color: "bg-amber-100 text-amber-700" },
    paid:       { label: "Dibayar",   color: "bg-blue-100 text-blue-700" },
    processing: { label: "Diproses",  color: "bg-purple-100 text-purple-700" },
    packing:    { label: "Dikemas",   color: "bg-indigo-100 text-indigo-700" },
    shipped:    { label: "Dikirim",   color: "bg-cyan-100 text-cyan-700" },
    delivered:  { label: "Selesai",   color: "bg-green-100 text-green-700" },
    cancelled:  { label: "Batal",     color: "bg-red-100 text-red-700" },
    refunded:   { label: "Refund",    color: "bg-gray-100 text-gray-600" },
    }

    export default async function AdminPesananPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (!["admin", "super_admin"].includes(profile?.role)) redirect("/dashboard")

    const { data: orders } = await supabase
        .from("orders")
        .select(`
        id, order_number, status, total_amount, payment_status,
        payment_method, shipping_name, shipping_city, courier, created_at,
        order_items(product_name, qty)
        `)
        .order("created_at", { ascending: false })
        .limit(50)

    // Summary counts
    const counts = {
        all: orders?.length ?? 0,
        pending: orders?.filter((o) => o.status === "pending").length ?? 0,
        paid: orders?.filter((o) => o.status === "paid").length ?? 0,
        shipped: orders?.filter((o) => o.status === "shipped").length ?? 0,
    }

    return (
        <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-bold text-gray-900">Manajemen Pesanan</h1>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
                { label: "Total Pesanan", value: counts.all, color: "text-gray-900" },
                { label: "Menunggu Bayar", value: counts.pending, color: "text-amber-600" },
                { label: "Sudah Dibayar", value: counts.paid, color: "text-blue-600" },
                { label: "Dikirim", value: counts.shipped, color: "text-cyan-600" },
            ].map((c) => (
                <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-4">
                <p className={`text-2xl font-black ${c.color}`}>{c.value}</p>
                <p className="text-xs text-gray-400 mt-1">{c.label}</p>
                </div>
            ))}
            </div>

            {/* Orders table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-800">Semua Pesanan</h2>
            </div>

            {!orders || orders.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                <Package size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Belum ada pesanan masuk.</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-50">
                {orders.map((order: any) => {
                    const status = STATUS_LABEL[order.status] ?? { label: order.status, color: "bg-gray-100 text-gray-600" }
                    return (
                    <Link
                        key={order.id}
                        href={`/admin/pesanan/${order.id}`}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
                    >
                        <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-bold text-gray-800">{order.order_number}</p>
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${status.color}`}>
                            {status.label}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400">
                            {order.shipping_name} · {order.shipping_city} ·{" "}
                            {new Date(order.created_at).toLocaleDateString("id-ID")}
                        </p>
                        </div>
                        <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-gray-900">
                            Rp {order.total_amount.toLocaleString("id-ID")}
                        </p>
                        <p className={`text-xs mt-0.5 ${order.payment_status === "paid" ? "text-green-500" : "text-amber-500"}`}>
                            {order.payment_status === "paid" ? "Lunas" : "Belum bayar"}
                        </p>
                        </div>
                        <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 shrink-0" />
                    </Link>
                    )
                })}
                </div>
            )}
            </div>
        </div>
        </main>
    )
    }