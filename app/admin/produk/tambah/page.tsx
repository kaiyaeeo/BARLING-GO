    "use client"

    import { useState, useEffect } from "react"
    import { useRouter } from "next/navigation"
    import { createClient } from "@/lib/supabase/client"
    import { Loader2, UploadCloud } from "lucide-react"

    export default function TambahProdukPage() {
    const router = useRouter()
    const supabase = createClient()
    
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<any[]>([])
    const [imageFile, setImageFile] = useState<File | null>(null)
    
    const [formData, setFormData] = useState({
        name: "",
        category_id: "",
        price: "",
        stock: "",
        description: ""
    })

    // Ambil data kategori saat halaman dimuat
    useEffect(() => {
        async function fetchCategories() {
        const { data } = await supabase.from("categories").select("id, name").eq("type", "oleh-oleh")
        if (data) setCategories(data)
        }
        fetchCategories()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
        // 1. Dapatkan data user (Seller) saat ini
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("User tidak ditemukan, silakan login ulang.")

        let imageUrls: string[] = []

        // 2. Upload Gambar ke Storage (Bucket: products)
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `product-images/${fileName}`

            const { error: uploadError } = await supabase.storage
            .from("products")
            .upload(filePath, imageFile)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
            .from("products")
            .getPublicUrl(filePath)
            
            imageUrls.push(publicUrl)
        }

        // 3. Insert ke Database (Table: products)
        const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()
        
        const { error: insertError } = await supabase.from("products").insert({
            name: formData.name,
            slug: slug,
            category_id: formData.category_id,
            price: Number(formData.price),
            stock: Number(formData.stock),
            description: formData.description,
            images: imageUrls,
            seller_id: user.id,
            is_active: true
        })

        if (insertError) throw insertError

        alert("Produk berhasil ditambahkan!")
        router.push("/admin/etalase") // Redirect ke halaman etalase

        } catch (error: any) {
        alert("Gagal menyimpan produk: " + error.message)
        } finally {
        setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Tambah Produk Baru</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nama Produk</label>
                <input required type="text" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="Contoh: Keripik Tempe Rohani"
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Kategori</label>
                <select required className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})}>
                <option value="">Pilih Kategori</option>
                {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Harga (Rp)</label>
                <input required type="number" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="15000"
                value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Stok</label>
                <input required type="number" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="100"
                value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
            </div>
            </div>

            <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Deskripsi Produk</label>
            <textarea required rows={5} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="Jelaskan detail produkmu..."
                value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>

            <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Upload Foto Produk</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors">
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">{imageFile ? imageFile.name : "Klik untuk memilih gambar (Max 2MB)"}</span>
                </label>
            </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => router.back()} className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Simpan Produk
            </button>
            </div>
        </form>
        </div>
    )
    }