    "use client"

    import { useState, useEffect } from "react"
    import { createClient } from "@/lib/supabase/client"
    import { useRouter } from "next/navigation"
    import { 
    Info, CreditCard, Mail, Shield, Database, 
    Loader2, Save, Server, Check,
    Bell, FileText, Send, Lock, Clock, LogOut, Edit2, Plus
    } from "lucide-react"

    // Import komponen terpisah kita
    import BackupDataTab from "@/components/super-admin/BackupDataTab"
    import PembayaranTab from "@/components/super-admin/PembayaranTab"

    type Tab = "umum" | "pembayaran" | "notifikasi" | "keamanan" | "backup"

    export default function PengaturanPlatformPage() {
    const router = useRouter()
    const supabase = createClient()
    
    const [activeTab, setActiveTab] = useState<Tab>("umum")
    const [isAuthChecking, setIsAuthChecking] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    // State Tab 1: Umum
    const [formUmum, setFormUmum] = useState({
        nama: "Barling-GO",
        slogan: "Temukan Pesona Barlingmascakep",
        email: "support@barling-go.com",
        isOnline: true
    })

    // State Tab 3: Notifikasi
    const [formNotif, setFormNotif] = useState({
        mitraBaru: { push: true, email: true },
        transaksiIklan: { push: true, email: true },
        laporanHarian: { push: false, email: true },
        keluhan: { push: true, email: true },
        smtpHost: "smtp.gmail.com", smtpPort: "587",
        smtpEmail: "noreply@barling-go.com", smtpPass: "..........."
    })

    // State Tab 4: Keamanan
    const [formKeamanan, setFormKeamanan] = useState({
        minKarakter: "10 Karakter", masaBerlaku: "90 hari",
        wajibSpesial: true, wajibAngka: true,
        duaFaktor: true, batasLogin: 5, timeout: "1 Jam"
    })

    // Proteksi Halaman
    useEffect(() => {
        async function checkAuth() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.replace("/login"); return }
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
        if (profile?.role !== "super_admin") { router.replace("/dashboard") }
        setIsAuthChecking(false)
        }
        checkAuth()
    }, [router, supabase])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setTimeout(() => {
        setIsSaving(false)
        alert(`Pengaturan ${activeTab.toUpperCase()} berhasil disimpan!`)
        }, 800)
    }

    const toggleNotif = (setting: keyof typeof formNotif, type: 'push' | 'email') => {
        setFormNotif(prev => ({
        ...prev,
        [setting]: { ...prev[setting as keyof typeof formNotif] as any, [type]: !(prev[setting as keyof typeof formNotif] as any)[type] }
        }))
    }

    if (isAuthChecking) return <div className="min-h-screen flex items-center justify-center text-[#2D7D46]">Memuat data pengaturan...</div>

    return (
        <main className="min-h-screen bg-gray-50/50 p-6">
        <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
                {activeTab === "umum" && "Pengaturan Platform"}
                {activeTab === "pembayaran" && "Pengaturan Pembayaran & Komisi"}
                {activeTab === "notifikasi" && "Pengaturan Notifikasi & Email"}
                {activeTab === "keamanan" && "Pengaturan Platform (Keamanan)"}
                {activeTab === "backup" && "Backup & Pemulihan Data"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
                {activeTab === "umum" && "Kelola konfigurasi global, preferensi sistem, dan keamanan platform Barling-GO."}
                {activeTab === "pembayaran" && "Kelola rincian komisi platform, biaya layanan, dan konfigurasi gerbang pembayaran (payment gateway)."}
                {activeTab === "notifikasi" && "Kelola preferensi notifikasi sistem, template email, dan konfigurasi server pengiriman (SMTP)."}
                {activeTab === "keamanan" && "Kelola konfigurasi sistem, kebijakan keamanan, dan preferensi operasional Barling-GO."}
                {activeTab === "backup" && "Kelola integritas data sistem Barling-GO melalui penjadwalan backup otomatis, pencadangan manual, dan pemulihan poin data."}
            </p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
            
            {/* Left Sidebar (Tabs Menu) */}
            <div className="w-full md:w-64 shrink-0">
                <nav className="flex flex-col gap-1">
                {(["umum", "pembayaran", "notifikasi", "keamanan", "backup"] as Tab[]).map((tab) => {
                    const icons = { umum: Info, pembayaran: CreditCard, notifikasi: Mail, keamanan: Shield, backup: Database }
                    const labels = { umum: "Umum", pembayaran: "Pembayaran & Komisi", notifikasi: "Notifikasi & Email", keamanan: "Keamanan", backup: "Backup Data" }
                    const Icon = icons[tab]
                    return (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === tab ? "bg-green-50 text-[#2D7D46] shadow-sm border border-green-100" : "text-gray-600 hover:bg-gray-100"}`}>
                        <Icon size={18} className={activeTab === tab ? "text-[#2D7D46]" : "text-gray-400"} /> {labels[tab]}
                    </button>
                    )
                })}
                </nav>
            </div>

            {/* Right Content Area */}
            <div className="flex-1">
                
                {/* TAB: UMUM */}
                {activeTab === "umum" && (
                <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-300">
                    <div className="p-6 border-b border-gray-100"><h2 className="text-lg font-bold text-gray-900">Informasi Umum</h2></div>
                    <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nama Platform</label>
                        <input type="text" value={formUmum.nama} onChange={e => setFormUmum({...formUmum, nama: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#2D7D46]/20 outline-none" required />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Slogan</label>
                        <input type="text" value={formUmum.slogan} onChange={e => setFormUmum({...formUmum, slogan: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#2D7D46]/20 outline-none" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kontak Bantuan (Email)</label>
                        <input type="email" value={formUmum.email} onChange={e => setFormUmum({...formUmum, email: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#2D7D46]/20 outline-none" required />
                        </div>
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Status Platform</p>
                            <p className={`text-xs ${formUmum.isOnline ? "text-green-600" : "text-gray-500"} font-medium`}>{formUmum.isOnline ? "Aktif / Online" : "Maintenance / Offline"}</p>
                        </div>
                        <button type="button" onClick={() => setFormUmum({...formUmum, isOnline: !formUmum.isOnline})} className={`w-11 h-6 rounded-full relative transition-colors ${formUmum.isOnline ? "bg-[#2D7D46]" : "bg-gray-300"}`}>
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formUmum.isOnline ? "left-6" : "left-1"}`} />
                        </button>
                        </div>
                    </div>
                    </div>
                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 bg-[#2D7D46] hover:bg-[#1A4C2E] text-white font-semibold text-sm rounded-xl transition-all">
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Simpan Perubahan
                    </button>
                    </div>
                </form>
                )}

                {/* TAB: PEMBAYARAN (DIPANGGIL DARI KOMPONEN EXTERNAL) */}
                {activeTab === "pembayaran" && (
                <PembayaranTab />
                )}

                {/* TAB: NOTIFIKASI */}
                {activeTab === "notifikasi" && (
                <form onSubmit={handleSave} className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
                        <Bell size={18} className="text-[#2D7D46]" />
                        <h2 className="text-base font-bold text-gray-900">Pengaturan Notifikasi Sistem</h2>
                    </div>
                    <div className="space-y-4">
                        {[
                        { key: 'mitraBaru', title: 'Notifikasi Pendaftaran Mitra Baru', desc: 'Dapatkan pemberitahuan saat mitra baru mendaftar di platform.' },
                        { key: 'transaksiIklan', title: 'Notifikasi Transaksi Iklan Baru', desc: 'Pemberitahuan setiap ada pembayaran iklan atau promosi mitra.' },
                        { key: 'laporanHarian', title: 'Laporan Harian Platform', desc: 'Ringkasan statistik harian dikirimkan ke email admin utama.' },
                        { key: 'keluhan', title: 'Notifikasi Keluhan Pengguna', desc: 'Laporan mendesak dari tiket bantuan atau keluhan pengguna.' },
                        ].map((item) => (
                        <div key={item.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <div>
                            <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                            </div>
                            <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                Push
                                <div onClick={() => toggleNotif(item.key as any, 'push')} className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formNotif[item.key as keyof typeof formNotif].push ? 'bg-[#2D7D46] border-[#2D7D46] text-white' : 'bg-white border-gray-300'}`}>
                                {formNotif[item.key as keyof typeof formNotif].push && <Check size={12} strokeWidth={3} />}
                                </div>
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                Email
                                <div onClick={() => toggleNotif(item.key as any, 'email')} className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formNotif[item.key as keyof typeof formNotif].email ? 'bg-[#2D7D46] border-[#2D7D46] text-white' : 'bg-white border-gray-300'}`}>
                                {formNotif[item.key as keyof typeof formNotif].email && <Check size={12} strokeWidth={3} />}
                                </div>
                            </label>
                            </div>
                        </div>
                        ))}
                    </div>
                    </div>

                    {/* Section 2: Konfigurasi SMTP */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
                        <Server size={18} className="text-[#2D7D46]" />
                        <h2 className="text-base font-bold text-gray-900">Konfigurasi SMTP (Email Server)</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">SMTP Host</label>
                        <input type="text" value={formNotif.smtpHost} onChange={e => setFormNotif({...formNotif, smtpHost: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none" />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Port</label>
                        <input type="text" value={formNotif.smtpPort} onChange={e => setFormNotif({...formNotif, smtpPort: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none" />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Pengirim</label>
                        <input type="text" value={formNotif.smtpEmail} onChange={e => setFormNotif({...formNotif, smtpEmail: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none" />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Password / App Key</label>
                        <input type="password" value={formNotif.smtpPass} onChange={e => setFormNotif({...formNotif, smtpPass: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none" />
                        </div>
                    </div>
                    <div className="mt-5 flex justify-end">
                        <button type="button" className="flex items-center gap-2 px-5 py-2 border border-[#2D7D46] text-[#2D7D46] font-semibold text-sm rounded-xl hover:bg-green-50 transition-colors">
                        <Send size={16} /> Uji Koneksi Email
                        </button>
                    </div>
                    </div>

                    {/* Section 3: Manajemen Template */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
                        <div className="flex items-center gap-3">
                        <FileText size={18} className="text-[#2D7D46]" />
                        <h2 className="text-base font-bold text-gray-900">Manajemen Template Email</h2>
                        </div>
                        <button type="button" className="text-sm font-semibold text-[#2D7D46] flex items-center gap-1 hover:underline">
                        <Plus size={16} /> Buat Template Baru
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase font-semibold border-b border-gray-100">
                            <tr><th className="pb-3">Nama Template</th><th className="pb-3">Trigger</th><th className="pb-3">Status</th><th className="pb-3 text-center">Aksi</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {[
                            { name: 'Selamat Datang Mitra', trigger: 'Pendaftaran Selesai' },
                            { name: 'Invoice Iklan', trigger: 'Pembayaran Terkonfirmasi' },
                            { name: 'Reset Password', trigger: 'Lupa Password' },
                            { name: 'Pengingat Pembayaran', trigger: 'H-1 Jatuh Tempo' }
                            ].map((item, idx) => (
                            <tr key={idx}>
                                <td className="py-3 text-gray-800">{item.name}</td>
                                <td className="py-3 text-gray-600">{item.trigger}</td>
                                <td className="py-3"><span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">Aktif</span></td>
                                <td className="py-3 text-center"><button type="button" className="text-[#2D7D46] p-1.5 hover:bg-green-50 rounded-lg"><Edit2 size={16} /></button></td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                    <button type="button" className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold text-sm rounded-xl">Batalkan</button>
                    <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 bg-[#2D7D46] text-white font-semibold text-sm rounded-xl hover:bg-[#1A4C2E]">
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Simpan Perubahan
                    </button>
                    </div>
                </form>
                )}

                {/* TAB: KEAMANAN */}
                {activeTab === "keamanan" && (
                <form onSubmit={handleSave} className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
                        <div>
                        <h2 className="text-base font-bold text-gray-900">Kebijakan Password</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Atur standar keamanan password untuk semua admin dan mitra.</p>
                        </div>
                        <Lock className="text-gray-300" size={24} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Minimum karakter</label>
                        <select value={formKeamanan.minKarakter} onChange={e => setFormKeamanan({...formKeamanan, minKarakter: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white">
                            <option>8 Karakter</option><option>10 Karakter</option><option>12 Karakter</option>
                        </select>
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Masa berlaku password</label>
                        <select value={formKeamanan.masaBerlaku} onChange={e => setFormKeamanan({...formKeamanan, masaBerlaku: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white">
                            <option>30 hari</option><option>60 hari</option><option>90 hari</option><option>Tidak terbatas</option>
                        </select>
                        </div>
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Wajib karakter spesial</p>
                            <p className="text-xs text-gray-500 mt-0.5">Sertakan simbol (!@#$%^&*)</p>
                        </div>
                        <button type="button" onClick={() => setFormKeamanan({...formKeamanan, wajibSpesial: !formKeamanan.wajibSpesial})} className={`w-11 h-6 rounded-full relative transition-colors ${formKeamanan.wajibSpesial ? "bg-[#2D7D46]" : "bg-gray-300"}`}>
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formKeamanan.wajibSpesial ? "left-6" : "left-1"}`} />
                        </button>
                        </div>
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Wajib angka</p>
                            <p className="text-xs text-gray-500 mt-0.5">Sertakan angka (0-9)</p>
                        </div>
                        <button type="button" onClick={() => setFormKeamanan({...formKeamanan, wajibAngka: !formKeamanan.wajibAngka})} className={`w-11 h-6 rounded-full relative transition-colors ${formKeamanan.wajibAngka ? "bg-[#2D7D46]" : "bg-gray-300"}`}>
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formKeamanan.wajibAngka ? "left-6" : "left-1"}`} />
                        </button>
                        </div>
                    </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="border-b border-gray-100 pb-4 mb-5">
                        <h2 className="text-base font-bold text-gray-900">Keamanan Tambahan</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Tingkatkan keamanan akses akun ke dalam sistem.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-green-50/50 border border-green-100 rounded-xl p-4 flex justify-between items-center">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0"><Shield size={16} /></div>
                            <div>
                            <p className="text-sm font-semibold text-gray-800">Dua Faktor Otentikasi (2FA)</p>
                            <p className="text-xs text-gray-500 mt-0.5">Wajibkan 2FA untuk semua Super Admin melalui aplikasi authenticator atau email.</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => setFormKeamanan({...formKeamanan, duaFaktor: !formKeamanan.duaFaktor})} className={`w-11 h-6 rounded-full shrink-0 relative transition-colors ${formKeamanan.duaFaktor ? "bg-[#2D7D46]" : "bg-gray-300"}`}>
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formKeamanan.duaFaktor ? "left-6" : "left-1"}`} />
                        </button>
                        </div>
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Batas Percobaan Login</p>
                            <p className="text-xs text-gray-500 mt-0.5">Akun akan dikunci sementara selama 30 menit setelah batas terlampaui untuk mencegah Brute Force.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="number" value={formKeamanan.batasLogin} onChange={e => setFormKeamanan({...formKeamanan, batasLogin: parseInt(e.target.value)})} className="w-16 px-3 py-2 rounded-lg border border-gray-300 text-center text-sm outline-none" />
                            <span className="text-sm text-gray-600 font-medium">kali</span>
                        </div>
                        </div>
                    </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="border-b border-gray-100 pb-4 mb-5">
                        <h2 className="text-base font-bold text-gray-900">Manajemen Sesi</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Kelola durasi sesi login aktif.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-end gap-5">
                        <div className="flex-1 w-full relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Sesi Timeout Otomatis</label>
                        <select value={formKeamanan.timeout} onChange={e => setFormKeamanan({...formKeamanan, timeout: e.target.value})} className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm outline-none appearance-none bg-white">
                            <option>30 Menit</option><option>1 Jam</option><option>2 Jam</option><option>12 Jam</option>
                        </select>
                        <Clock size={16} className="absolute right-4 top-9 text-gray-400" />
                        </div>
                        <button type="button" className="w-full sm:w-auto px-6 py-2.5 border border-red-200 text-red-600 font-semibold text-sm rounded-xl hover:bg-red-50 flex items-center justify-center gap-2 transition-colors">
                        <LogOut size={16} /> Logout Semua Akun
                        </button>
                    </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                    <button type="button" className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold text-sm rounded-xl">Batalkan</button>
                    <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 bg-[#2D7D46] text-white font-semibold text-sm rounded-xl hover:bg-[#1A4C2E]">
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Simpan Perubahan
                    </button>
                    </div>
                </form>
                )}

                {/* TAB: BACKUP DATA (DIPANGGIL DARI KOMPONEN EXTERNAL) */}
                {activeTab === "backup" && (
                <BackupDataTab />
                )}

            </div>
            </div>
        </div>
        </main>
    )
    }