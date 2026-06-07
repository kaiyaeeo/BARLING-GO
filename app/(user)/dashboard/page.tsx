    import { createClient } from '@/lib/supabase/server'
    import { redirect } from 'next/navigation'

    export default async function DashboardPage() {
    const supabase = await createClient()

    // Ambil data user yang sedang login
    const { data: { user } } = await supabase.auth.getUser()

    // Jika tidak ada user (belum login), kembalikan ke halaman login
    if (!user) {
        redirect('/login')
    }

    // Ambil profil user dari database
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="min-h-screen bg-gray-50 pt-24 px-6">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Selamat datang, {profile?.full_name || 'Pengguna'}!
            </h1>
            <p className="text-gray-500 mb-6">Ini adalah halaman dashboard pelanggan Barling-GO.</p>
            
            <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
            <p className="text-sm text-teal-800">
                <strong>Email Anda:</strong> {user.email}
            </p>
            <p className="text-sm text-teal-800 mt-1">
                <strong>Role Anda:</strong> {profile?.role}
            </p>
            </div>
        </div>
        </div>
    )
    }