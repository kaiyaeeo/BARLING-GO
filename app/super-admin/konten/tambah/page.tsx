    "use client"

    import { useState } from "react"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import { Loader2, MapPin, UploadCloud } from "lucide-react"

    export default function TambahWisataPage() {
    const router = useRouter()
    const supabase = createClient()
    
    const [loading, setLoading] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    
    const [formData, setFormData] = useState({
        title: "",
        kabupaten: "Banyumas",
        location: "",
        ticket_price_min: "0",
        description: "",
        body: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Sesi tidak valid.")

        let coverUrl = ""

        // Upload Cover Image ke Storage (Bucket: contents)
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop()
            const fileName = `wisata-${Date.now()}.${fileExt}`
            
            const { error: uploadError } = await supabase.storage
            .from("contents")
            .upload(fileName, imageFile)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
            .from("contents")
            .getPublicUrl(fileName)
            
            coverUrl = publicUrl
        }

        // Insert ke Table contents
        const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()
        
        const { error: insertError } = await supabase.from("contents").insert({
            type: "destinasi",
            title: formData.title,
            slug: slug,
            kabupaten: formData.kabupaten,
            location: formData.location,
            ticket_price_min: Number(formData.ticket_price_min),
            description: formData.description, // Deskripsi singkat
            body: formData.body,               // Penjelasan lengkap
            cover_image: coverUrl,
            created_by: user.id,
            is_published: true
        })

        if (insertError) throw insertError

        alert("Destinasi Wisata berhasil dipublikasikan!")
        router.push("/super-admin/konten")

        } catch (error: any) {
        alert("Gagal mempublikasikan: " + error.message)
        } finally {
        setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Tambah Destinasi Wisata</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nama Tempat Wisata</label>
                <input required type="text" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-green-500 outline-none" 
                value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Kabupaten</label>
                <select className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-green-500"
                value={formData.kabupaten} onChange={(e) => setFormData({...formData, kabupaten: e.target.value})}>
                <option value="Banyumas">Banyumas</option>
                <option value="Purbalingga">Purbalingga</option>
                <option value="Banjarnegara">Banjarnegara</option>
                <option value="Cilacap">Cilacap</option>
                <option value="Kebumen">Kebumen</option>
                </select>
            </div>
            
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Alamat Singkat</label>
                <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"/>
                <input required type="text" className="w-full p-3 pl-10 border border-gray-200 rounded-lg outline-none" placeholder="Contoh: Lereng Gunung Slamet"
                    value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Harga Tiket Masuk (Mulai dari)</label>
                <input required type="number" className="w-full p-3 border border-gray-200 rounded-lg outline-none" placeholder="0 untuk gratis"
                value={formData.ticket_price_min} onChange={(e) => setFormData({...formData, ticket_price_min: e.target.value})} />
            </div>
            </div>

            <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Deskripsi Singkat (Tampil di Card)</label>
            <textarea required rows={2} className="w-full p-3 border border-gray-200 rounded-lg outline-none" placeholder="Kalimat penarik wisatawan..."
                value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>

            <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Penjelasan Lengkap (Body)</label>
            <textarea required rows={6} className="w-full p-3 border border-gray-200 rounded-lg outline-none" placeholder="Ceritakan sejarah, fasilitas, dan daya tarik tempat ini..."
                value={formData.body} onChange={(e) => setFormData({...formData, body: e.target.value})} />
            </div>

            <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Upload Cover Gambar</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors">
                <input required type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="hidden" id="wisata-upload" />
                <label htmlFor="wisata-upload" className="cursor-pointer flex flex-col items-center">
                <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">{imageFile ? imageFile.name : "Upload Gambar Utama Wisata"}</span>
                </label>
            </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => router.back()} className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Publikasikan Wisata
            </button>
            </div>
        </form>
        </div>
    )
    }