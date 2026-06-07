    "use client"

    import { useState, useRef } from "react"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import { Loader2, Upload, Check } from "lucide-react"

    type Profile = {
    id: string; full_name: string | null; phone: string | null
    avatar_url: string | null; umkm_name: string | null
    umkm_logo: string | null; umkm_description: string | null
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
    const [error, setError] = useState<string | null>(null)

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    }

    async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        const ext = file.name.split(".").pop()
        const path = `umkm-logos/${initialData.id}.${ext}`
        const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true })
        if (!error) {
        setLogoPath(path)
        setLogoUrl(URL.createObjectURL(file))
        }
        setUploading(false)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true); setError(null)

        const { error } = await supabase
        .from("profiles")
        .update({
            full_name: form.full_name,
            phone: form.phone,
            umkm_name: form.umkm_name,
            umkm_logo: logoPath || null,
            umkm_description: form.umkm_description,
            updated_at: new Date().toISOString(),
        })
        .eq("id", initialData.id)

        setSaving(false)
        if (error) { setError(error.message); return }
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
        router.refresh()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>}

        {/* Logo toko */}
        <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Logo Toko</label>
            <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                {logoUrl
                ? <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
                : <span className="text-2xl font-black text-gray-200">{form.umkm_name?.[0] ?? "T"}</span>
                }
            </div>
            <div>
                <button type="button" onClick={() => logoRef.current?.click()} disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {uploading ? "Mengupload..." : "Upload Logo"}
                </button>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG. Maks 2MB.</p>
            </div>
            </div>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
        </div>

        {/* Info toko */}
        <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Informasi Toko</h2>
            <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Toko / UMKM</label>
                <input name="umkm_name" value={form.umkm_name} onChange={handleChange}
                placeholder="Contoh: Warung Makan Bu Siti"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7D46]/30 focus:border-[#2D7D46]" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi Toko</label>
                <textarea name="umkm_description" value={form.umkm_description} onChange={handleChange}
                rows={3} placeholder="Ceritakan tentang toko kamu..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7D46]/30 focus:border-[#2D7D46] resize-none" />
            </div>
            </div>
        </div>

        {/* Info pemilik */}
        <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Informasi Pemilik</h2>
            <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
                <input name="full_name" value={form.full_name} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7D46]/30 focus:border-[#2D7D46]" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">No. Telepon</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="08xxxxxxxxxx"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7D46]/30 focus:border-[#2D7D46]" />
            </div>
            </div>
        </div>

        <div className="pt-2 border-t border-gray-100">
            <button type="submit" disabled={saving || saved}
            className={`px-8 py-3 font-semibold rounded-xl text-sm flex items-center gap-2 transition-all ${
                saved ? "bg-green-500 text-white" : "bg-[#2D7D46] hover:bg-[#236338] text-white disabled:opacity-60"
            }`}>
            {saving && <Loader2 size={15} className="animate-spin" />}
            {saved && <Check size={15} />}
            {saved ? "Tersimpan!" : saving ? "Menyimpan..." : "Simpan Pengaturan"}
            </button>
        </div>
        </form>
    )
    }
