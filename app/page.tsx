  import Link from 'next/link';
  import { supabase } from '@/lib/supabase';
  import { ArrowRight, Utensils, Tent, Gift, CheckCircle2 } from 'lucide-react';

  export default async function LandingPage() {
    // Mengambil 4 produk teratas dari Supabase untuk section "Top UMKM"
    const { data: topProducts } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .limit(4);

    // Mengambil 8 produk campuran untuk section "Favorite Destinations"
    const { data: favoriteItems } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('id', { ascending: false })
      .limit(8);

    return (
      <main className="flex flex-col min-h-screen bg-white">
        
        {/* 1. HERO SECTION */}
        {/* Ganti URL gambar dengan gambar asli hutan pinus/baturraden milikmu */}
        <section 
          className="relative w-full h-[80vh] bg-cover bg-center flex items-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1590069818804-032228510103?q=80&w=2070&auto=format&fit=crop')" }}
        >
          <div className="absolute inset-0 bg-black/40"></div> {/* Overlay gelap */}
          <div className="container mx-auto px-6 relative z-10 text-white">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-4 max-w-3xl leading-tight">
              BARLING-GO
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl text-gray-200">
              Jelajahi keindahan alam, cicipi kuliner khas, dan dukung pertumbuhan UMKM lokal di wilayah Barlingmascakep dalam satu genggaman.
            </p>
            <div className="flex gap-4">
              <Link href="/wisata" className="bg-white text-teal-800 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition">
                Mulai Sekarang
              </Link>
              <Link href="/oleh-oleh" className="border-2 border-white text-white px-6 py-3 rounded-full font-bold hover:bg-white/20 transition">
                Explore lebih jauh
              </Link>
            </div>
          </div>
        </section>

        {/* 2. STATISTIK & KATEGORI SECTION */}
        <section className="container mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Kenapa Ribuan Wisatawan Mengandalkan Barling-GO?</h2>
              <p className="text-gray-600 mb-10 leading-relaxed">
                Jelajahi keindahan pantai hingga wisata budaya di Barlingmascakep dengan lebih mudah, aman, dan menyenangkan. Kami menyediakan *itinerary* terbaik, buatan para ahli dan layanan dukungan 24 jam penuh untuk menemani petualangan liburanmu.
              </p>
              <div className="flex gap-8 text-center">
                <div>
                  <div className="text-3xl font-extrabold text-teal-600">8k+</div>
                  <div className="text-sm text-gray-500 mt-1">Wisatawan<br/>Tercerahkan</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-teal-600">30m</div>
                  <div className="text-sm text-gray-500 mt-1">Kunjungan Wisata<br/>yang Terjalin</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-teal-600">50+</div>
                  <div className="text-sm text-gray-500 mt-1">UMKM dan Mitra<br/>Terintegrasi</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <Link href="/kuliner" className="flex items-center gap-4 bg-teal-50/50 p-4 rounded-2xl hover:bg-teal-100 transition border border-teal-100">
                <div className="bg-red-100 p-4 rounded-full text-red-500"><Utensils size={28} /></div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Kuliner</h3>
                  <p className="text-sm text-gray-600">Nikmati cita rasa otentik dengan resep turun-temurun.</p>
                </div>
              </Link>
              <Link href="/wisata" className="flex items-center gap-4 bg-teal-50/50 p-4 rounded-2xl hover:bg-teal-100 transition border border-teal-100">
                <div className="bg-blue-100 p-4 rounded-full text-blue-500"><Tent size={28} /></div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Wisata</h3>
                  <p className="text-sm text-gray-600">Akses langsung ke destinasi alam dan budaya tersembunyi.</p>
                </div>
              </Link>
              <Link href="/oleh-oleh" className="flex items-center gap-4 bg-teal-50/50 p-4 rounded-2xl hover:bg-teal-100 transition border border-teal-100">
                <div className="bg-orange-100 p-4 rounded-full text-orange-500"><Gift size={28} /></div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Oleh-Oleh</h3>
                  <p className="text-sm text-gray-600">Mendukung karya tangguh perajin dan produk lokal.</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* 3. TOP UMKM (Dinamis dari Supabase) */}
        <section className="bg-[#8FBDAF]/20 py-20">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Top UMKM</h2>
                <p className="text-gray-600">Mulai dari pesona keindahan alam hingga uniknya kriya pegunungan.</p>
              </div>
              <Link href="/oleh-oleh" className="hidden md:flex items-center gap-2 text-teal-700 font-semibold hover:underline">
                View More <ArrowRight size={20} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {topProducts?.map((product) => (
                <Link href={`/produk/${product.id}`} key={product.id} className="group rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition">
                  <div className="h-48 overflow-hidden">
                    <img src={product.foto_url[0]} alt={product.nama_produk} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-bold text-teal-600 mb-1">{product.kategori}</p>
                    <h3 className="font-bold text-gray-800 line-clamp-1">{product.nama_produk}</h3>
                    <p className="text-sm text-gray-500 mt-2 font-semibold">Rp {product.harga_dasar.toLocaleString('id-ID')}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 4. FAVORITE DESTINATIONS & UMKM */}
        <section className="container mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Our Favorite Destinations & UMKM</h2>
          <p className="text-gray-600 mb-10">Pilihan wisata dan produk terbaik untuk petualanganmu.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {favoriteItems?.map((item) => (
              <Link href={`/produk/${item.id}`} key={item.id} className="relative rounded-2xl overflow-hidden aspect-square group">
                <img src={item.foto_url[0]} alt={item.nama_produk} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white font-semibold text-left line-clamp-2">{item.nama_produk}</span>
                </div>
              </Link>
            ))}
          </div>
          <Link href="/wisata" className="inline-block border-2 border-teal-600 text-teal-600 px-8 py-3 rounded-full font-bold hover:bg-teal-600 hover:text-white transition">
            Explore More
          </Link>
        </section>

        {/* 5. TESTIMONIALS */}
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-12">What They Say About Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border-2 border-[#8FBDAF]/30 shadow-sm relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?img=${i + 10}`} alt="User" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">Pengguna Setia {i}</h4>
                      <p className="text-xs text-gray-500">Wisatawan</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm italic">
                    "Menggunakan Barling-GO sangat membantu saya! Terutama fitur AI-nya yang merekomendasikan oleh-oleh mendoan terdekat dengan penginapan."
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. SPONSORS */}
        <section className="container mx-auto px-6 py-16 text-center border-t">
          <h2 className="text-xl font-bold text-gray-800 mb-8">Sponsored and Media Partner</h2>
          <div className="flex justify-center items-center gap-12 opacity-60 grayscale hover:grayscale-0 transition duration-500">
            {/* Ganti dengan logo sungguhan di folder public/images/ */}
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center font-bold text-xs">Pemkab BMA</div>
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center font-bold text-xs">ASTON</div>
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center font-bold text-xs">UNSOED</div>
          </div>
        </section>

        {/* 7. BOTTOM CTA */}
        <section className="bg-[#8FBDAF] py-20 mt-10">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Siap Petualangan di Barlingmascakep?</h2>
            <Link href="/ai-assistant" className="inline-block bg-[#F58F29] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-600 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Coba Asisten AI Sekarang
            </Link>
          </div>
        </section>

      </main>
    );
  }