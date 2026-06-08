    import { createClient } from '@/lib/supabase/server'
    import { redirect } from 'next/navigation'
    import { Mail, Phone, ShieldCheck } from 'lucide-react'

    // Tambahkan "async" agar bisa memproses data sebelum dirender
    export default async function ProfilPage() {
    const supabase = await createClient()

    // Ambil data user
    const { data: { user } } = await supabase.auth.getUser()
    
    // Jika user tidak ada, arahkan ke login
    if (!user) {
        redirect('/login')
    }

    // Ambil data profil
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <main className="min-h-screen bg-gray-50 pt-24 px-4 sm:px-6">
        {/* Konten profil kamu di sini */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <h1 className="text-xl font-bold p-6">Profil Saya</h1>
            <p className="px-6 pb-6">Email: {user.email}</p>
        </div>
        </main>
    )
    }