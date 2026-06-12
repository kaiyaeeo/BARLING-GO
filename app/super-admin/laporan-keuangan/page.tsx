    import { createClient } from "@/lib/supabase/server"
    import { redirect } from "next/navigation"
    import { 
    Wallet, TrendingUp, TrendingDown, Download, FileText, 
    PieChart, Activity, AlertCircle, Award 
    } from "lucide-react"
    import Link from "next/link"

    export default async function LaporanKeuanganPage() {
    const supabase = await createClient()
    
    // 1. Proteksi Halaman (Wajib Super Admin)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")
    
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (profile?.role !== "super_admin") redirect("/dashboard")

    // 2. Data Visual (Aman untuk Presentasi)
    // Di masa depan, data ini bisa di-fetch menggunakan agregasi SQL dari Supabase
    const revenueData = [
        { source: "Paket Iklan Premium", amount: "Rp 6.800.000", pct: "36%", trend: "+30%" },
        { source: "Paket Iklan Pro", amount: "Rp 3.700.000", pct: "20%", trend: "+15%" },
        { source: "Paket Iklan Basic", amount: "Rp 2.000.000", pct: "11%", trend: "+8%" },
        { source: "Langganan Mitra Pro", amount: "Rp 3.600.000", pct: "19%", trend: "+20%" },
        { source: "Langganan Mitra Basic", amount: "Rp 1.650.000", pct: "9%", trend: "+12%" },
        { source: "Lainnya", amount: "Rp 1.000.000", pct: "5%", trend: "-" },
    ]

    const expensesData = [
        { category: "Server & Infrastruktur", amount: "Rp 1.800.000" },
        { category: "Gaji Tim", amount: "Rp 1.500.000" },
        { category: "Biaya Marketing", amount: "Rp 600.000" },
        { category: "Tools & Lisensi", amount: "Rp 300.000" },
    ]

    const topAdvertisers = [
        { rank: 1, name: "Toko Batik Motif Serayu", paket: "PREMIUM", value: "Rp 2.500.000", kab: "Banyumas" },
        { rank: 2, name: "Oleh-oleh Khas Nopia", paket: "PRO", value: "Rp 1.800.000", kab: "Purbalingga" },
        { rank: 3, name: "Kerajinan Bambu Jaya", paket: "PRO", value: "Rp 1.500.000", kab: "Banjarnegara" },
        { rank: 4, name: "Resto Sate Bebek Pak H.", paket: "BASIC", value: "Rp 1.000.000", kab: "Kebumen" },
        { rank: 5, name: "Batik Canting Emas", paket: "PREMIUM", value: "Rp 2.200.000", kab: "Cilacap" },
    ]

    return (
        <main className="min-h-screen bg-gray-50/30 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Laporan Keuangan Platform</h1>
                <p className="text-sm text-gray-500 mt-1">Ringkasan pendapatan dan pengeluaran operasional platform Barling-GO</p>
            </div>
            <div className="flex flex-col items-end gap-3">
                <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                <button className="px-4 py-1.5 text-sm font-semibold text-gray-600 rounded-lg hover:bg-white transition-all">Bulanan</button>
                <button className="px-4 py-1.5 text-sm font-semibold bg-white text-[#2D7D46] shadow-sm rounded-lg">Triwulan</button>
                <button className="px-4 py-1.5 text-sm font-semibold text-gray-600 rounded-lg hover:bg-white transition-all">Tahunan</button>
                </div>
                <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-[#2D7D46] text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all">
                    <FileText size={16} /> Export PDF
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-[#2D7D46] text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all">
                    <Download size={16} /> Export Excel
                </button>
                </div>
            </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Pendapatan */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-green-50 text-[#2D7D46] rounded-xl flex items-center justify-center">
                    <Wallet size={20} />
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                    <TrendingUp size={12} /> 24%
                </span>
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Pendapatan</p>
                <h2 className="text-2xl font-black text-gray-900 mt-1">Rp 18.750.000</h2>
                <p className="text-xs text-gray-400 mt-2">vs Maret: Rp 15.120.000</p>
            </div>

            {/* Breakdown */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <PieChart size={20} />
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Breakdown Sumber</p>
                <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Iklan <span className="text-xs text-gray-400">(67%)</span></span>
                    <span className="font-bold text-gray-900">Rp 12.500.000</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Langganan <span className="text-xs text-gray-400">(33%)</span></span>
                    <span className="font-bold text-gray-900">Rp 6.250.000</span>
                </div>
                </div>
            </div>

            {/* Pengeluaran */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center mb-4">
                <Activity size={20} />
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Biaya Operasional</p>
                <h2 className="text-2xl font-black text-red-600 mt-1">Rp 4.200.000</h2>
                <p className="text-xs text-gray-400 mt-2">22% dari total pendapatan</p>
            </div>

            {/* Laba Bersih (Themed) */}
            <div className="bg-[#1A4C2E] p-5 rounded-2xl shadow-md text-white relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10">
                <TrendingUp size={120} className="-mr-6 -mt-6" />
                </div>
                <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Wallet size={20} />
                    </div>
                    <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">Bersih</span>
                </div>
                <p className="text-xs font-bold text-green-100 uppercase tracking-wider">Laba Bersih Platform</p>
                <h2 className="text-3xl font-black mt-1">Rp 14.550.000</h2>
                <div className="flex items-center gap-2 mt-3 text-xs text-green-100">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Profitabilitas Tinggi
                </div>
                </div>
            </div>
            </div>

            {/* CSS Bar Chart (Safe for server components & presentation) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-6">Tren Pendapatan Platform (6 Bulan)</h3>
            <div className="h-48 flex items-end justify-between gap-2 border-b border-gray-100 pb-2">
                {[30, 20, 50, 70, 90, 100].map((h, i) => (
                <div key={i} className="w-full flex flex-col items-center gap-2 group">
                    <div className="w-12 bg-green-100 rounded-t-md relative flex flex-col justify-end transition-all hover:opacity-80" style={{ height: `${h}%` }}>
                    <div className="w-full bg-[#2D7D46] rounded-t-md" style={{ height: `${h * 0.7}%` }}></div>
                    </div>
                    <span className="text-xs font-medium text-gray-400">{["NOV", "DES", "JAN", "FEB", "MAR", "APR"][i]}</span>
                </div>
                ))}
            </div>
            </div>

            {/* Two Columns Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pendapatan Detail */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-900">Pendapatan per Sumber</h3>
                </div>
                <div className="p-0">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-400 uppercase bg-white border-b border-gray-100">
                    <tr>
                        <th className="px-5 py-3 font-semibold">Sumber</th>
                        <th className="px-5 py-3 font-semibold">Jumlah</th>
                        <th className="px-5 py-3 font-semibold text-right">Trend</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                    {revenueData.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 font-medium text-gray-700">{item.source}</td>
                        <td className="px-5 py-3 font-bold text-gray-900">{item.amount}</td>
                        <td className="px-5 py-3 text-right font-semibold text-green-600">{item.trend}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>

            {/* Pengeluaran Detail */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-900">Pengeluaran Operasional</h3>
                <AlertCircle size={16} className="text-red-400" />
                </div>
                <div className="p-0">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-400 uppercase bg-white border-b border-gray-100">
                    <tr>
                        <th className="px-5 py-3 font-semibold">Kategori</th>
                        <th className="px-5 py-3 font-semibold text-right">Jumlah</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                    {expensesData.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 font-medium text-gray-700 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                            {item.category}
                        </td>
                        <td className="px-5 py-3 text-right font-bold text-gray-900">{item.amount}</td>
                        </tr>
                    ))}
                    <tr className="bg-red-50/30 border-t border-red-100">
                        <td className="px-5 py-4 font-bold text-gray-900">Total Pengeluaran</td>
                        <td className="px-5 py-4 text-right font-black text-red-600">Rp 4.200.000</td>
                    </tr>
                    </tbody>
                </table>
                </div>
            </div>
            </div>

            {/* Top Advertisers */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                <Award size={20} />
                </div>
                <div>
                <h3 className="text-sm font-bold text-gray-900">Mitra Pengiklan Teratas Bulan Ini</h3>
                <p className="text-xs text-gray-500">Daftar mitra dengan kontribusi nilai iklan tertinggi di platform</p>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase border-b border-gray-100">
                    <tr>
                    <th className="pb-3 font-semibold pl-2">Rank</th>
                    <th className="pb-3 font-semibold">Nama Mitra</th>
                    <th className="pb-3 font-semibold">Paket</th>
                    <th className="pb-3 font-semibold">Nilai Iklan</th>
                    <th className="pb-3 font-semibold">Kabupaten</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {topAdvertisers.map((mitra, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 pl-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            mitra.rank === 1 ? 'bg-amber-100 text-amber-700' :
                            mitra.rank === 2 ? 'bg-gray-100 text-gray-600' :
                            mitra.rank === 3 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-400'
                        }`}>
                            {mitra.rank}
                        </div>
                        </td>
                        <td className="py-4 font-semibold text-gray-800">{mitra.name}</td>
                        <td className="py-4">
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-md ${
                            mitra.paket === 'PREMIUM' ? 'bg-amber-100 text-amber-700' :
                            mitra.paket === 'PRO' ? 'bg-[#2D7D46]/10 text-[#2D7D46]' : 'bg-blue-100 text-blue-700'
                        }`}>
                            {mitra.paket}
                        </span>
                        </td>
                        <td className="py-4 font-bold text-[#2D7D46]">{mitra.value}</td>
                        <td className="py-4 text-gray-500">{mitra.kab}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>

        </div>
        </main>
    )
    }