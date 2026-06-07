    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import TokoForm from "@/components/admin/dashboard/TokoForm"

    export default async function AdminTokoPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")
    const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, phone, avatar_url, role, umkm_name, umkm_logo, umkm_description")
        .eq("id", user.id)
        .single()
    if (!["admin", "super_admin"].includes(profile?.role)) redirect("/dashboard")

    return (
        <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-xl font-bold text-gray-900 mb-8">Pengaturan Toko</h1>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-8">
            <TokoForm initialData={profile} />
            </div>
        </div>
        </main>
    )
    }
