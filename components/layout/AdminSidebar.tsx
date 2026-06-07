    "use client"

    import Link from "next/link"
    import { usePathname } from "next/navigation"
    import {
    LayoutDashboard, ShoppingBag, Package, Users,
    CreditCard, Truck, Tag, BarChart2, Settings,
    Store, LogOut, ChevronLeft, Menu
    } from "lucide-react"
    import { useState } from "react"
    import { createClient } from "@/lib/supabase/client"
    import { useRouter } from "next/navigation"

    const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/produk", label: "Produk", icon: Package },
    { href: "/admin/inventori", label: "Inventori", icon: Store },
    { href: "/admin/pesanan", label: "Pesanan", icon: ShoppingBag },
    { href: "/admin/pembayaran", label: "Pembayaran", icon: CreditCard },
    { href: "/admin/pengiriman", label: "Pengiriman", icon: Truck },
    { href: "/admin/pelanggan", label: "Pelanggan", icon: Users },
    { href: "/admin/promosi", label: "Promosi", icon: Tag },
    { href: "/admin/laporan", label: "Laporan", icon: BarChart2 },
    { href: "/admin/toko", label: "Pengaturan Toko", icon: Settings },
    ]

    export default function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [collapsed, setCollapsed] = useState(false)

    async function handleLogout() {
        await supabase.auth.signOut()
        router.replace("/login")
    }

    return (
        <aside className={`fixed top-0 left-0 h-full bg-white border-r border-gray-100 z-40 flex flex-col transition-all duration-200 ${collapsed ? "w-16" : "w-56"}`}>
        {/* Logo */}
        <div className={`flex items-center h-16 border-b border-gray-100 px-4 ${collapsed ? "justify-center" : "justify-between"}`}>
            {!collapsed && (
            <Link href="/admin/dashboard" className="flex items-center">
                <span className="text-base font-black text-gray-900">BARLING</span>
                <span className="text-base font-black text-[#2D7D46]">GO</span>
            </Link>
            )}
            <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
            {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
            </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
            {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname.startsWith(item.href)
            return (
                <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm font-medium transition-all mb-0.5 ${
                    active
                    ? "bg-[#2D7D46] text-white"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                } ${collapsed ? "justify-center" : ""}`}
                >
                <Icon size={17} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
                </Link>
            )
            })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-100">
            <button
            onClick={handleLogout}
            title={collapsed ? "Keluar" : undefined}
            className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 hover:text-red-500 transition-all ${collapsed ? "justify-center" : ""}`}
            >
            <LogOut size={17} className="shrink-0" />
            {!collapsed && <span>Keluar</span>}
            </button>
        </div>
        </aside>
    )
    }
