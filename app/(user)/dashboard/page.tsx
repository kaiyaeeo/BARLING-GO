    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import Link from "next/link"
    import { ShoppingBag, Bell, User, Sparkles, ArrowRight, ChevronRight } from "lucide-react"

    const STATUS_COLOR: Record<string, string> = {
    pending:    "bg-amber-100 text-amber-700",
    paid:       "bg-blue-100 text-blue-700",
    processing: "bg-purple-100 text-purple-700",
    shipped:    "bg-cyan-100 text-cyan-700",
    delivered:  "bg-green-100 text-green-700",
    cancelled:  "bg-red-100 text-red-600",
    }
    const STATUS_LABEL: Record<string, string> = {
    pending: "Menunggu Bayar", paid: "Dibayar", processing: "Diproses",
    shipped: "Dikirim", delivered: "Selesai", cancelled: "Dibatalkan",
    }

    export default async function UserDashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const [
        { data: profile },
        { data: orders },
        { data: notifications },
        { count: unreadCount },
    ] = await Promise.all([
        supabase.from("profiles").select("full_name, phone, avatar_url, role").eq("id", user.id).single(),
        supabase.from("orders")
        .select("id, order_number, status, total_amount, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
        supabase.from("notifications")
        .select("id, type, title, message, link, is_read, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
        supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false),
    ])

    const firstName = profile?.full_name?.split(" ")[0] ?? "Kamu"

    return (
        <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Greeting */}
            <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#2D7D46]/10 flex items-center justify-center text-[#2D7D46] font-black text-lg shrink-0">
                {profile?.full_name?.[0] ?? "U"}
            </div>
            <div>
                <h1 className="text-xl font-bold text-gray-900">Halo, {firstName}! 👋</h1>
                <p className="text-sm text-gray-400">{user.email}</p>
            </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-3 gap-3 mb-8">
            {[
                { label: "Pesanan Saya", href: "/pesanan", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Notifikasi", href: "#notif", icon: Bell, color: "text-amber-600", bg: "bg-amber-50", badge: unreadCount },
                { label: "Profil", href: "/profil", icon: User, color: "text-green-600", bg: "bg-green-50" },
            ].map((item) => {
                const Icon = item.icon
                return (
                <Link key={item.label} href={item.href}
                    className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all relative">
                    <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
                    <Icon size={18} className={item.color} />
                    </div>
                    <p className="text-xs font-semibold text-gray-700 text-center">{item.label}</p>
                    {(item.badge ?? 0) > 0 && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {item.badge}
                    </span>
                    )}
                </Link>
                )
            })}
            </div>

            {/* AI banner */}
            <Link href="/ai-assistant"
            className="flex items-center gap-4 bg-[#2D7D46] rounded-2xl p-5 mb-6 hover:bg-[#236338] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles size={18} className="text-white" />
            </div>
            <div className="flex-1">
                <p className="text-sm font-bold text-white">Rencanakan perjalananmu</p>
                <p className="text-xs text-green-200">Tanyakan AI Assistant seputar wisata Barlingmascakep</p>
            </div>
            <ArrowRight size={16} className="text-white/60 group-hover:text-white transition-colors" />
            </Link>

            <div className="grid sm:grid-cols-2 gap-5">
            {/* Recent orders */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
                <h2 className="text-sm font-bold text-gray-900">Pesanan Terbaru</h2>
                <Link href="/pesanan" className="text-xs text-[#2D7D46] hover:underline">Lihat semua</Link>
                </div>
                {!orders || orders.length === 0 ? (
                <div className="text-center py-8">
                    <ShoppingBag size={28} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-xs text-gray-400">Belum ada pesanan</p>
                </div>
                ) : (
                <div className="divide-y divide-gray-50">
                    {orders.map((order) => (
                    <Link key={order.id} href={`/pesanan/${order.id}`}
                        className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div>
                        <p className="text-xs font-semibold text-gray-800">{order.order_number}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                            {new Date(order.created_at).toLocaleDateString("id-ID")}
                        </p>
                        </div>
                        <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                            {STATUS_LABEL[order.status] ?? order.status}
                        </span>
                        <ChevronRight size={12} className="text-gray-300" />
                        </div>
                    </Link>
                    ))}
                </div>
                )}
            </div>

            {/* Notifications */}
            <div id="notif" className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
                <h2 className="text-sm font-bold text-gray-900">Notifikasi</h2>
                {(unreadCount ?? 0) > 0 && (
                    <span className="text-xs font-bold bg-red-100 text-red-500 px-2 py-0.5 rounded-full">{unreadCount} baru</span>
                )}
                </div>
                {!notifications || notifications.length === 0 ? (
                <div className="text-center py-8">
                    <Bell size={28} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-xs text-gray-400">Belum ada notifikasi</p>
                </div>
                ) : (
                <div className="divide-y divide-gray-50">
                    {notifications.map((n: any) => (
                    <Link key={n.id} href={n.link ?? "#"}
                        className={`flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${!n.is_read ? "bg-green-50/40" : ""}`}>
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.is_read ? "bg-[#2D7D46]" : "bg-transparent"}`} />
                        <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{n.title}</p>
                        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(n.created_at).toLocaleDateString("id-ID")}
                        </p>
                        </div>
                    </Link>
                    ))}
                </div>
                )}
            </div>
            </div>
        </div>
        </main>
    )
    }
