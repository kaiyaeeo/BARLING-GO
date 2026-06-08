    import { createClient } from "@/lib/supabase/server"
    import UserRoleManager from "@/components/super-admin/UserRoleManager"
    import { Users } from "lucide-react"

    export default async function SuperAdminUsersPage() {
    const supabase = await createClient()

    const { data: users } = await supabase
        .from("profiles")
        .select("id, full_name, phone, role, is_active, created_at")
        .order("created_at", { ascending: false })
        .limit(100)

    const counts = {
        all: users?.length ?? 0,
        user: users?.filter((u) => u.role === "user").length ?? 0,
        admin: users?.filter((u) => u.role === "admin").length ?? 0,
        super_admin: users?.filter((u) => u.role === "super_admin").length ?? 0,
    }

    return (
        <main className="min-h-screen bg-gray-50 pt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <h1 className="text-xl font-bold text-gray-900 mb-8">Manajemen User & Role</h1>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
                { label: "Total User", value: counts.all, color: "text-gray-900" },
                { label: "Pengguna", value: counts.user, color: "text-blue-600" },
                { label: "Admin UMKM", value: counts.admin, color: "text-green-600" },
                { label: "Super Admin", value: counts.super_admin, color: "text-purple-600" },
            ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                </div>
            ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Users size={16} className="text-[#2D7D46]" />
                <h2 className="text-sm font-bold text-gray-800">Semua Pengguna</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50 text-left">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400">Nama</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400">Telepon</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400">Role</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400">Status</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400">Bergabung</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {(users ?? []).map((u: any) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 font-semibold text-gray-800">{u.full_name ?? "—"}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{u.phone ?? "—"}</td>
                        <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            u.role === "super_admin" ? "bg-purple-100 text-purple-700"
                            : u.role === "admin" ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}>
                            {u.role.replace("_", " ")}
                        </span>
                        </td>
                        <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.is_active ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                            {u.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-400">
                        {new Date(u.created_at).toLocaleDateString("id-ID")}
                        </td>
                        <td className="px-5 py-3">
                        <UserRoleManager userId={u.id} currentRole={u.role} isActive={u.is_active} />
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
