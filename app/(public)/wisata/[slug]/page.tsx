    import { createClient } from "@/lib/supabase/server"
    import { notFound } from "next/navigation"
    import Link from "next/link"
    import Navbar from "@/components/layout/Navbar"
    import SavePlaceButton from "@/components/wisata/SavePlaceButton"
    import ReviewForm from "@/components/wisata/ReviewForm"
    import { MapPin, Clock, Phone, Star, Share2, Sparkles, ExternalLink, ChevronRight } from "lucide-react"

    const PLACEHOLDER = "https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=1200&q=80"

    export async function generateMetadata({ params }: { params: { slug: string } }) {
    const supabase = await createClient()
    const { data } = await supabase.from("contents").select("title, description").eq("slug", params.slug).single()
    return {
        title: data ? `${data.title} — Barling-GO` : "Destinasi Wisata",
        description: data?.description ?? "",
    }
    }

    export default async function WisataDetailPage({ params }: { params: { slug: string } }) {
    const supabase = await createClient()

    const { data: dest } = await supabase
        .from("contents")
        .select("*")
        .eq("slug", params.slug)
        .eq("is_published", true)
        .single()

    if (!dest) notFound()

    const { data: reviews } = await supabase
        .from("content_reviews")
        .select("id, rating, body, created_at, profiles(full_name, avatar_url)")
        .eq("content_id", dest.id)
        .order("created_at", { ascending: false })
        .limit(5)

    const { data: { user } } = await supabase.auth.getUser()

    // Check if user already saved this place
    let isSaved = false
    if (user) {
        const { data: saved } = await supabase
        .from("saved_places")
        .select("id")
        .eq("user_id", user.id)
        .eq("content_id", dest.id)
        .single()
        isSaved = !!saved
    }

    const imgSrc = dest.cover_image
        ? dest.cover_image.startsWith("http") ? dest.cover_image
        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content-images/${dest.cover_image}`
        : PLACEHOLDER

    const hasPrice = dest.ticket_price_min > 0 || dest.ticket_price_max > 0
    const mapsUrl  = dest.latitude && dest.longitude
        ? `https://www.google.com/maps?q=${dest.latitude},${dest.longitude}`
        : `https://www.google.com/maps/search/${encodeURIComponent(dest.title + " " + (dest.location ?? ""))}`

    function timeAgo(dateStr: string) {
        const diff = Date.now() - new Date(dateStr).getTime()
        const days = Math.floor(diff / 86400000)
        if (days === 0) return "Hari ini"
        if (days === 1) return "1 hari yang lalu"
        if (days < 7)  return `${days} hari yang lalu`
        if (days < 30) return `${Math.floor(days / 7)} minggu yang lalu`
        return `${Math.floor(days / 30)} bulan yang lalu`
    }

    return (
        <>
        <Navbar />
        <main className="min-h-screen bg-white pt-16">

            {/* Hero */}
            <div className="relative h-72 sm:h-96 overflow-hidden">
            <img src={imgSrc} alt={dest.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Breadcrumb */}
            <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-6">
                <nav className="flex items-center gap-2 text-xs text-white/70 mb-2">
                <Link href="/" className="hover:text-white">Home</Link>
                <ChevronRight size={12} />
                <Link href="/wisata" className="hover:text-white">Wisata</Link>
                <ChevronRight size={12} />
                <span className="text-white">{dest.title}</span>
                </nav>
                <h1 className="text-3xl sm:text-4xl font-black text-white">{dest.title}</h1>
            </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid lg:grid-cols-3 gap-8">

                {/* Left — main content */}
                <div className="lg:col-span-2 space-y-8">

                {/* Badges + rating */}
                <div>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="px-3 py-1 bg-green-100 text-[#2D7D46] text-xs font-bold rounded-full">Wisata</span>
                    {dest.kabupaten && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">{dest.kabupaten}</span>
                    )}
                    </div>

                    {dest.rating > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map((s) => (
                            <Star
                            key={s}
                            size={16}
                            className={s <= Math.round(dest.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"}
                            />
                        ))}
                        </div>
                        <span className="text-sm font-bold text-gray-800">{Number(dest.rating).toFixed(1)}</span>
                        <span className="text-sm text-gray-400">({dest.review_count ?? 0}+ ulasan)</span>
                    </div>
                    )}

                    <p className="text-gray-600 text-[15px] leading-relaxed">{dest.description}</p>
                </div>

                {/* Gallery */}
                {(dest.tags?.length > 0) && (
                    <div>
                    <div className="grid grid-cols-4 gap-2">
                        {[imgSrc, imgSrc, imgSrc, imgSrc].map((img, i) => (
                        <div key={i} className="aspect-square rounded-xl overflow-hidden">
                            <img src={img} alt={`${dest.title} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer" />
                        </div>
                        ))}
                    </div>
                    </div>
                )}

                {/* Map */}
                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Lokasi</h2>
                    <div className="rounded-2xl overflow-hidden border border-gray-100 grid sm:grid-cols-2">
                    {/* Static map placeholder */}
                    <div className="h-48 sm:h-auto bg-gray-100 relative overflow-hidden">
                        <img
                        src={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${dest.longitude ?? 109.2437},${dest.latitude ?? -7.4212},12,0/400x300?access_token=placeholder`}
                        alt="map"
                        className="w-full h-full object-cover opacity-60"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=60"
                        }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-[#2D7D46] rounded-full flex items-center justify-center shadow-lg">
                            <MapPin size={16} className="text-white" />
                        </div>
                        </div>
                    </div>

                    {/* Location info */}
                    <div className="p-5 flex flex-col items-center justify-center gap-4 bg-white">
                        <div className="text-center">
                        <MapPin size={24} className="text-[#2D7D46] mx-auto mb-2" />
                        <p className="text-sm font-semibold text-gray-800 text-center">
                            {dest.address ?? dest.location ?? `${dest.kabupaten}, Jawa Tengah`}
                        </p>
                        </div>
                        <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#2D7D46] text-white text-sm font-semibold rounded-xl hover:bg-[#236338] transition-all"
                        >
                        Lihat di Google Maps <ExternalLink size={13} />
                        </a>
                    </div>
                    </div>
                </div>

                {/* Reviews */}
                <div>
                    <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-gray-900">Ulasan Pengunjung</h2>
                    {user && (
                        <button
                        onClick={() => document.getElementById("review-form")?.scrollIntoView({ behavior: "smooth" })}
                        className="px-4 py-2 text-sm font-semibold text-[#2D7D46] border border-[#2D7D46] rounded-xl hover:bg-green-50 transition-all"
                        >
                        Tulis Ulasan
                        </button>
                    )}
                    </div>

                    {!reviews || reviews.length === 0 ? (
                    <p className="text-sm text-gray-400 py-4">Belum ada ulasan. Jadilah yang pertama!</p>
                    ) : (
                    <div className="space-y-4">
                        {reviews.map((rev: any) => {
                        const name = rev.profiles?.full_name ?? "Pengunjung"
                        const initials = name.split(" ").map((n: string) => n[0]).slice(0,2).join("").toUpperCase()
                        const colors = ["bg-teal-100 text-teal-700", "bg-blue-100 text-blue-700", "bg-orange-100 text-orange-700", "bg-purple-100 text-purple-700"]
                        const color = colors[name.charCodeAt(0) % colors.length]
                        return (
                            <div key={rev.id} className="bg-gray-50 rounded-2xl p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center font-bold text-sm shrink-0`}>
                                    {initials}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">{name}</p>
                                    <p className="text-xs text-gray-400">{timeAgo(rev.created_at)}</p>
                                </div>
                                </div>
                                <div className="flex items-center gap-0.5">
                                {[1,2,3,4,5].map((s) => (
                                    <Star key={s} size={13} className={s <= rev.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
                                ))}
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">"{rev.body}"</p>
                            </div>
                        )
                        })}
                    </div>
                    )}

                    {/* Review form */}
                    {user && (
                    <div id="review-form" className="mt-6">
                        <ReviewForm contentId={dest.id} />
                    </div>
                    )}
                </div>
                </div>

                {/* Right sidebar */}
                <div className="space-y-4">
                {/* Ticket & info card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 sticky top-24">
                    {hasPrice && (
                    <div className="mb-5 pb-5 border-b border-gray-100">
                        <p className="text-xs text-gray-400 mb-1">Tiket Masuk</p>
                        <p className="text-2xl font-black text-gray-900">
                        Rp {dest.ticket_price_min.toLocaleString("id-ID")}
                        {dest.ticket_price_max > dest.ticket_price_min && (
                            <span> – Rp {dest.ticket_price_max.toLocaleString("id-ID")}</span>
                        )}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">*Harga bervariasi sesuai hari operasional</p>
                    </div>
                    )}

                    <div className="space-y-3 mb-5">
                    {dest.opening_hours && (
                        <div className="flex items-center gap-3">
                        <Clock size={16} className="text-gray-400 shrink-0" />
                        <div>
                            <p className="text-xs text-gray-400">Jam Operasional</p>
                            <p className="text-sm font-medium text-gray-700">{dest.opening_hours}</p>
                        </div>
                        </div>
                    )}
                    {dest.phone && (
                        <div className="flex items-center gap-3">
                        <Phone size={16} className="text-gray-400 shrink-0" />
                        <div>
                            <p className="text-xs text-gray-400">Kontak</p>
                            <p className="text-sm font-medium text-gray-700">{dest.phone}</p>
                        </div>
                        </div>
                    )}
                    </div>

                    <div className="space-y-2.5">
                    <a
                        href={`https://wa.me/${dest.phone?.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 bg-[#2D7D46] hover:bg-[#236338] text-white font-bold rounded-xl text-sm flex items-center justify-center transition-all"
                    >
                        Hubungi Pengelola
                    </a>
                    <div className="grid grid-cols-2 gap-2">
                        <SavePlaceButton
                        contentId={dest.id}
                        isLoggedIn={!!user}
                        initialSaved={isSaved}
                        />
                        <button className="flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
                        <Share2 size={14} /> Bagikan
                        </button>
                    </div>
                    </div>
                </div>

                {/* AI assistant card */}
                <Link
                    href={`/ai-assistant?q=Rencanakan kunjungan ke ${dest.title}`}
                    className="block bg-green-50 border border-green-100 rounded-2xl p-4 hover:bg-green-100 transition-all group"
                >
                    <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#2D7D46] flex items-center justify-center shrink-0">
                        <Sparkles size={16} className="text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[#2D7D46]">Tanya AI Assistant</p>
                        <p className="text-xs text-gray-500">Rencanakan kunjunganmu ke {dest.title}</p>
                    </div>
                    </div>
                </Link>
                </div>
            </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-gray-100 mt-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                <p className="font-black text-gray-900">BARLING-GO</p>
                <p className="text-xs text-gray-400 mt-0.5">© 2026 BARLING-GO. All Rights Reserved</p>
                </div>
                <div className="flex gap-6 text-sm text-gray-500">
                {["Terms of Service", "Privacy Policy", "Contact Us"].map((l) => (
                    <a key={l} href="#" className="hover:text-gray-800 transition-colors">{l}</a>
                ))}
                </div>
            </div>
            </footer>
        </main>
        </>
    )
    }
