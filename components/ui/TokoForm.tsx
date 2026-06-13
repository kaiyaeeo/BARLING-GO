    "use client"

    import { useState, useRef } from "react"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import { Loader2, Upload, Check, MapPin, Building, Megaphone, Crown, Star, ArrowRight } from "lucide-react"
    import Link from "next/link"

    type Profile = {
    id: string; full_name: string | null; phone: string | null;
    avatar_url: string | null; umkm_name: string | null;
    umkm_logo: string | null; umkm_description: string | null;
    address: string | null; city: string | null;
    postal_code: string | null; promo_package: string | null;
    }

    export default function TokoForm({ initialData }: { initialData: Profile }) {
    const router = useRouter()
    const supabase = createClient()
    const logoRef = useRef<HTMLInputElement>(null)

    const [form, setForm] = useState({
        full_name: initialData.full_name ?? "",
        phone: initialData.phone ?? "",
        umkm_name: initialData.umkm_name ?? "",
        umkm_description: initialData.umkm_description ?? "",
        address: initialData.address ?? "",
        city: initialData.city ?? "",
        postal_code: initialData.postal_code ?? "",
    })
    
    const [logoUrl, setLogoUrl] = useState<string | null>(
        initialData.umkm_logo
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${initialData.umkm_logo}`
        : null
    )
    const [logoPath, setLogoPath] = useState(initialData.umkm_logo ?? "")
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    }

    async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        const ext = file.name.split(".").pop()
        const path = `umkm-logos/${initialData.id}-${Date.now()}.${ext}`
        
        const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true })
        if (!error) {
        setLogoPath(path)
        setLogoUrl(URL.createObjectURL(file))
        }
        setUploading(false)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)

        const { error } = await supabase
        .from("profiles")
        .update({
            full_name: form.full_name, phone: form.phone,
            umkm_name: form.umkm_name, umkm_logo: logoPath || null,
            umkm_description: form.umkm_description,
            address: form.address, city: form.city, postal_code: form.postal_code,
            updated_at: new Date().toISOString(),
        })
        .eq("id", initialData.id)

        setSaving(false)
        if (!error) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
        router.refresh()
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
            
            {/* KOLOM KIRI: Profil & Promosi */}
            <div className="space-y-6">
            
            {/* Profil Dasar */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <Building size={18} className="text-[#2D7D46]" /> Profil Dasar UMKM
                </h2>
                <div className="flex items-center gap-5">
                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
                    {logoUrl ? <img src={logoUrl} alt="logo" className="w-full h-full object-cover" /> : <span className="text-3xl font-black text-gray-200">{form.umkm_name?.[0] ?? "T"}</span>}
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Logo Toko</h3>
                    <button type="button" onClick={() => logoRef.current?.click()} disabled={uploading} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} {uploading ? "Mengupload..." : "Pilih Logo"}
                    </button>
                </div>
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </div>
                <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Toko / UMKM</label>
                    <input name="umkm_name" value={form.umkm_name} onChange={handleChange} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7D46]/30 focus:border-[#2D7D46]" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi Singkat</label>
                    <textarea name="umkm_description" value={form.umkm_description} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7D46]/30 focus:border-[#2D7D46] resize-none" />
                </div>
                </div>
            </div>

            {/* Mitra Promosi (Dipindah ke sini) */}
            <div className="bg-gradient-to-r from-gray-900 to-[#1A4C2E] p-6 rounded-2xl shadow-sm text-white relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
                <Megaphone size={140} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                    <Crown size={22} className="text-yellow-400" />
                    <h2 className="text-lg font-bold text-white">Status Kemitraan: <span className="text-yellow-400 uppercase">{initialData.promo_package || 'REGULER'}</span></h2>
                    </div>
                    <p className="text-sm text-gray-300 max-w-md">
                    Ingin toko Anda tampil di halaman utama Barling-GO dan menjangkau lebih banyak wisatawan? Tingkatkan paket promosi Anda sekarang!
                    </p>
                </div>
                <Link href="/admin/langganan" className="shrink-0 flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-6 py-3 rounded-xl transition-all shadow-lg">
                    Upgrade Paket <ArrowRight size={18} />
                </Link>
                </div>
            </div>
            </div>

            {/* KOLOM KANAN: Lokasi & Kontak */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5 h-fit">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <MapPin size={18} className="text-[#2D7D46]" /> Lokasi & Kontak
            </h2>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat Lengkap Toko</label>
                <textarea name="address" value={form.address} onChange={handleChange} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7D46]/30 focus:border-[#2D7D46] resize-none" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kota / Kabupaten</label>
                <select name="city" value={form.city} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7D46]/30 focus:border-[#2D7D46] bg-white">
                <option value="">Pilih Kota...</option>
                <option value="Purbalingga">Purbalingga</option><option value="Banyumas">Banyumas</option>
                <option value="Banjarnegara">Banjarnegara</option><option value="Cilacap">Cilacap</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kode Pos</label>
                <input name="postal_code" value={form.postal_code} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7D46]/30 focus:border-[#2D7D46]" />
            </div>
            <div className="pt-2 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Pemilik</label>
                <input name="full_name" value={form.full_name} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm mb-4" />
                <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp Outlet</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm" />
            </div>
            </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
            <button type="submit" disabled={saving || saved} className={`px-8 py-3 font-bold rounded-xl text-sm flex items-center gap-2 transition-all ${saved ? "bg-[#2D7D46] text-white" : "bg-[#2D7D46] hover:bg-[#236338] text-white disabled:opacity-60"}`}>
            {saving && <Loader2 size={16} className="animate-spin" />} {saved && <Check size={16} />}
            {saved ? "Berhasil Disimpan!" : "Simpan Profil Toko"}
            </button>
        </div>
        </form>
    )
    }