    "use client"

    import { useState, useEffect } from "react"
    import { createClient } from "@/lib/supabase/client"
    import { useRouter } from "next/navigation"
    import { 
    Receipt, Clock, Search, X, Download, MessageCircle, 
    Building2, Landmark, CheckCircle2, AlertCircle
    } from "lucide-react"

    // Tipe data untuk transaksi
    type Transaction = {
    id: string
    mitra: string
    kabupaten: string
    paket: string
    nilai: number
    status: "LUNAS" | "MENUNGGU"
    tanggal: string
    alamat: string
    telepon: string
    }

    export default function LaporanTransaksiPage() {
    const router = useRouter()
    const supabase = createClient()
    
    // State untuk modal
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
    const [isAuthChecking, setIsAuthChecking] = useState(true)

    // Cek Auth
    useEffect(() => {
        async function checkAuth() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.replace("/login")
            return
        }
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
        if (profile?.role !== "super_admin") {
            router.replace("/dashboard")
        }
        setIsAuthChecking(false)
        }
        checkAuth()
    }, [router, supabase])

    // Data Mock persis seperti gambar desainmu (Aman untuk Demo)
    const transactions: Transaction[] = [
        { id: "TRX-0441", mitra: "Toko Batik Banyumas", kabupaten: "Banyumas", paket: "PREMIUM", nilai: 300000, status: "LUNAS", tanggal: "1 Apr 2026", alamat: "Jl. Sudirman No. 12, Purwokerto, Banyumas", telepon: "+62 812-3456-7890" },
        { id: "TRX-0440", mitra: "Curug Indah Adventure", kabupaten: "Purbalingga", paket: "PRO", nilai: 200000, status: "LUNAS", tanggal: "1 Apr 2026", alamat: "Jl. Raya Baturraden, Purbalingga", telepon: "+62 813-9876-5432" },
        { id: "TRX-0439", mitra: "Warung Soto Pak Harto", kabupaten: "Banyumas", paket: "BASIC", nilai: 100000, status: "LUNAS", tanggal: "31 Mar 2026", alamat: "Kawasan Kuliner Sokaraja, Banyumas", telepon: "+62 856-1122-3344" },
        { id: "TRX-0438", mitra: "Keripik Bu Sari", kabupaten: "Cilacap", paket: "PRO", nilai: 200000, status: "MENUNGGU", tanggal: "31 Mar 2026", alamat: "Jl. Tentara Pelajar, Cilacap", telepon: "+62 819-5566-7788" },
        { id: "TRX-0437", mitra: "Batik Mbok Darmi", kabupaten: "Banyumas", paket: "BASIC", nilai: 100000, status: "LUNAS", tanggal: "30 Mar 2026", alamat: "Pasar Wage, Purwokerto", telepon: "+62 821-9988-7766" },
    ]

    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(angka)
    }

    if (isAuthChecking) return <div className="min-h-screen flex items-center justify-center text-green-700">Memuat data...</div>

    return (
        <main className="min-h-screen bg-gray-50/50 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header */}
            <div>
            <h1 className="text-2xl font-bold text-gray-900">Laporan Transaksi Iklan & Langganan</h1>
            <p className="text-sm text-gray-500 mt-1">April 2026 — Ringkasan performa finansial platform</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                <div className="w-10 h-10 bg-green-50 text-[#2D7D46] rounded-xl flex items-center justify-center mb-3">
                <Receipt size={20} />
                </div>
                <p className="text-sm font-semibold text-gray-500">Total Transaksi Bulan Ini</p>
                <div className="flex items-end gap-3 mt-1">
                <h2 className="text-3xl font-black text-gray-900">47</h2>
                <span className="text-xs font-bold text-green-600 mb-1 flex items-center">↗ +12% vs bulan lalu</span>
                </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full">
                PERLU TINDAKAN
                </div>
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-3">
                <Clock size={20} />
                </div>
                <p className="text-sm font-semibold text-gray-500">Menunggu Pembayaran</p>
                <h2 className="text-3xl font-black text-gray-900 mt-1">3</h2>
                <p className="text-xs text-gray-400 mt-1">Menunggu konfirmasi manual atau QRIS</p>
            </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Filters */}
            <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between bg-gray-50/30">
                <div className="flex gap-3">
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Paket</label>
                    <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#2D7D46]">
                    <option>Semua Paket</option>
                    <option>Premium</option>
                    <option>Pro</option>
                    <option>Basic</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Status</label>
                    <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#2D7D46]">
                    <option>Semua Status</option>
                    <option>Lunas</option>
                    <option>Menunggu</option>
                    </select>
                </div>
                </div>
                <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Periode Tanggal</label>
                <div className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 flex items-center gap-2 bg-white">
                    <Clock size={14} className="text-gray-400" />
                    <span>01 Apr 2026 - 30 Apr 2026</span>
                </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase bg-white border-b border-gray-100">
                    <tr>
                    <th className="px-6 py-4 font-semibold">ID Transaksi</th>
                    <th className="px-6 py-4 font-semibold">Nama Mitra</th>
                    <th className="px-6 py-4 font-semibold">Kabupaten</th>
                    <th className="px-6 py-4 font-semibold text-center">Paket</th>
                    <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => setSelectedTx(tx)}>
                        <td className="px-6 py-4 font-bold text-[#2D7D46]">{tx.id}</td>
                        <td className="px-6 py-4 font-semibold text-gray-800">{tx.mitra}</td>
                        <td className="px-6 py-4 text-gray-500">{tx.kabupaten}</td>
                        <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md ${
                            tx.paket === 'PREMIUM' ? 'bg-amber-100 text-amber-700' :
                            tx.paket === 'PRO' ? 'bg-[#2D7D46]/10 text-[#2D7D46]' : 'bg-blue-100 text-blue-700'
                        }`}>
                            {tx.paket}
                        </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                        <button className="text-xs font-semibold text-[#2D7D46] hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                            Lihat Detail →
                        </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-gray-100 text-xs text-gray-400 bg-gray-50/50">
                Menampilkan 1-5 dari 47 transaksi
            </div>
            </div>

        </div>

        {/* MODAL INVOICE (Muncul saat selectedTx tidak null) */}
        {selectedTx && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            {/* Modal Container */}
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                
                {/* Modal Header */}
                <div className="bg-[#1A4C2E] px-6 py-4 flex items-center justify-between text-white">
                <h3 className="font-semibold">Detail Invoice</h3>
                <button onClick={() => setSelectedTx(null)} className="text-white/70 hover:text-white transition-colors">
                    <X size={20} />
                </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                
                {/* Kop & Status */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#2D7D46] rounded-xl flex items-center justify-center text-white">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900">Barling-GO</h4>
                        <p className="text-[10px] text-gray-500 font-semibold tracking-wider">ADS & TOURISM NETWORK</p>
                    </div>
                    </div>
                    {selectedTx.status === "LUNAS" ? (
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={14} /> LUNAS
                    </span>
                    ) : (
                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <AlertCircle size={14} /> MENUNGGU
                    </span>
                    )}
                </div>

                {/* Invoice Info */}
                <div className="flex justify-between border-y border-gray-100 py-3">
                    <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Invoice No</p>
                    <p className="text-sm font-semibold text-gray-800">INV/20260401/{selectedTx.id.split("-")[1]}</p>
                    </div>
                    <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Tanggal</p>
                    <p className="text-sm font-semibold text-gray-800">{selectedTx.tanggal}</p>
                    </div>
                </div>

                {/* Billed To */}
                <div className="bg-blue-50/40 border border-blue-100 p-4 rounded-xl">
                    <p className="text-[10px] font-bold text-blue-400 uppercase mb-2">Ditagih ke Mitra:</p>
                    <h4 className="text-base font-bold text-gray-900">{selectedTx.mitra}</h4>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{selectedTx.alamat}</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedTx.telepon}</p>
                </div>

                {/* Order Summary */}
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Ringkasan Pesanan</p>
                    <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Iklan Banner {selectedTx.paket === "PREMIUM" ? "Premium" : selectedTx.paket === "PRO" ? "Pro" : "Basic"}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Periode: 1–30 Apr 2026 (30 Hari)</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{formatRupiah(selectedTx.nilai)}</p>
                    </div>
                    
                    <div className="space-y-2 pt-3 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-semibold text-gray-700">{formatRupiah(selectedTx.nilai)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Pajak (0%)</span>
                        <span className="font-semibold text-gray-700">Rp 0</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-100">
                        <span className="font-bold text-gray-900">Total Bayar</span>
                        <span className="text-lg font-black text-[#2D7D46]">{formatRupiah(selectedTx.nilai)}</span>
                    </div>
                    </div>
                </div>

                {/* Payment Info */}
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Informasi Pembayaran</p>
                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                        <Landmark size={16} className="text-gray-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-800">Transfer Bank Central Asia (BCA)</p>
                        <p className="text-xs text-gray-500">Ref: {selectedTx.id.split("-")[1]}-{selectedTx.kabupaten.toUpperCase()}</p>
                    </div>
                    </div>
                </div>

                </div>

                {/* Modal Footer (Actions) */}
                <div className="bg-gray-50 p-6 border-t border-gray-100 flex flex-col gap-3">
                <button 
                    onClick={() => {
                    alert("File PDF Invoice sedang diunduh...")
                    setSelectedTx(null)
                    }}
                    className="w-full py-2.5 bg-[#1A4C2E] hover:bg-[#11331e] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                    <Download size={16} /> Unduh Invoice PDF
                </button>
                <button 
                    onClick={() => {
                    alert("Membuka WhatsApp Web...")
                    setSelectedTx(null)
                    }}
                    className="w-full py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                    <MessageCircle size={16} className="text-green-500" /> Kirim via WhatsApp
                </button>
                </div>

            </div>
            </div>
        )}

        </main>
    )
    }