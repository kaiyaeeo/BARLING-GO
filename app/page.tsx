import { supabase } from '@/lib/supabase'

// Karena ini Server Component, kita bisa langsung pakai "async"
export default async function Home() {
  // Mengambil data dari tabel products di Supabase
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true) // Hanya ambil produk yang aktif

  if (error) {
    return <div className="p-8 text-red-500">Gagal mengambil data: {error.message}</div>
  }

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Katalog Barling-GO</h1>
        <p className="text-gray-500">Eksplorasi Wisata & UMKM Barlingmascakep</p>
      </div>

      {/* Grid untuk menampilkan kartu produk */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products?.map((product) => (
          <div key={product.id} className="border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
              <img 
                src={product.foto_url[0]} 
                alt={product.nama_produk}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-xs font-semibold text-blue-600 mb-1">
              {product.kategori}
            </div>
            <h2 className="text-lg font-bold line-clamp-1 mb-1">
              {product.nama_produk}
            </h2>
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {product.deskripsi}
            </p>
            <div className="text-lg font-extrabold text-green-600">
              Rp {product.harga_dasar.toLocaleString('id-ID')}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}