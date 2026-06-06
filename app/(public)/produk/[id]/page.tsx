    import Link from 'next/link';
    import { supabase } from '@/lib/supabase';
    import { ShoppingCart, ShoppingBag, ChevronRight, MapPin, ShieldCheck, Star } from 'lucide-react';
    import { notFound } from 'next/navigation';

    export default async function ProductDetail({ params }: { params: { id: string } }) {
    // Menarik 1 data produk secara spesifik berdasarkan ID di URL
    const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single();

    // Jika produk tidak ditemukan atau ID salah, arahkan ke halaman 404 (Not Found)
    if (error || !product) {
        notFound();
    }

    // Menentukan warna badge kategori
    const getCategoryColor = (kategori: string) => {
        switch (kategori) {
        case 'Kuliner': return 'bg-red-100 text-red-700';
        case 'Wisata': return 'bg-blue-100 text-blue-700';
        case 'Oleh-Oleh': return 'bg-orange-100 text-orange-700';
        default: return 'bg-teal-100 text-teal-700';
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 py-10">
        <div className="container mx-auto px-4 md:px-6">
            
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-teal-600">Home</Link>
            <ChevronRight size={16} />
            <Link href={`/${product.kategori.toLowerCase()}`} className="hover:text-teal-600">
                {product.kategori}
            </Link>
            <ChevronRight size={16} />
            <span className="text-gray-800 font-medium truncate w-32 md:w-auto">
                {product.nama_produk}
            </span>
            </nav>

            {/* Kontainer Utama Detail Produk */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-0">
                
                {/* Bagian Kiri: Gambar Produk (Mengambil 3 kolom di layar besar) */}
                <div className="lg:col-span-3 bg-gray-100 p-8 flex items-center justify-center">
                <img 
                    src={product.foto_url[0]} 
                    alt={product.nama_produk} 
                    className="w-full max-w-md h-auto object-contain rounded-xl shadow-lg mix-blend-multiply"
                />
                </div>

                {/* Bagian Kanan: Informasi Produk & Aksi (Mengambil 2 kolom di layar besar) */}
                <div className="lg:col-span-2 p-8 md:p-10 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(product.kategori)}`}>
                        {product.kategori}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                        <Star size={16} className="fill-current" />
                        <span>4.9</span>
                        <span className="text-gray-400 font-normal">(120 ulasan)</span>
                    </div>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 leading-tight">
                    {product.nama_produk}
                    </h1>
                    
                    <p className="text-sm text-gray-500 flex items-center gap-2 mb-6">
                    <MapPin size={16} className="text-teal-600" /> 
                    UMKM Mitra Barling-GO
                    </p>

                    <div className="mb-8">
                    <p className="text-sm text-gray-500 mb-1">Harga Spesial</p>
                    <div className="flex items-baseline gap-3">
                        <h2 className="text-4xl font-black text-teal-600">
                        Rp {product.harga_dasar.toLocaleString('id-ID')}
                        </h2>
                        {product.harga_diskon && (
                        <span className="text-lg text-gray-400 line-through">
                            Rp {product.harga_diskon.toLocaleString('id-ID')}
                        </span>
                        )}
                    </div>
                    </div>

                    <div className="mb-8">
                    <h3 className="font-bold text-gray-900 mb-2">Deskripsi</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {product.deskripsi}
                    </p>
                    </div>

                    <div className="flex items-center gap-4 py-4 border-y border-gray-100 mb-8">
                    <div className="bg-gray-50 p-3 rounded-lg flex-1 flex flex-col items-center justify-center border border-gray-100">
                        <span className="text-xs text-gray-500 mb-1">Stok Tersedia</span>
                        <span className="font-bold text-gray-900">{product.stok_saat_ini} Item</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg flex-1 flex flex-col items-center justify-center border border-gray-100">
                        <span className="text-xs text-gray-500 mb-1">Kondisi</span>
                        <span className="font-bold text-gray-900">Baru</span>
                    </div>
                    </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex flex-col gap-3">
                    <button className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-teal-700 transition shadow-lg shadow-teal-600/30">
                    <ShoppingBag size={20} />
                    Beli Langsung
                    </button>
                    <button className="w-full bg-white text-teal-600 border-2 border-teal-600 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-teal-50 transition">
                    <ShoppingCart size={20} />
                    Tambah ke Keranjang
                    </button>
                    
                    <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-1">
                    <ShieldCheck size={14} className="text-green-500" />
                    Transaksi dijamin aman dan terverifikasi oleh platform
                    </p>
                </div>
                </div>

            </div>
            </div>
        </div>
        </main>
    );
    }