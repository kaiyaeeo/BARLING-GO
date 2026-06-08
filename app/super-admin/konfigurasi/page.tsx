    import { createClient } from "@/lib/supabase/server"
    import SiteStatsEditor from "@/components/super-admin/SiteStatsEditor"
    import HeroSettingsEditor from "@/components/super-admin/HeroSettingsEditor"
    import { Settings } from "lucide-react"

    export default async function KonfigurasiPage() {
    const supabase = await createClient()

    const [{ data: stats }, { data: hero }] = await Promise.all([
        supabase.from("site_stats").select("*").order("sort_order"),
        supabase.from("hero_settings").select("*").eq("id", 1).single(),
    ])

    return (
        <main className="min-h-screen bg-gray-50 pt-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="flex items-center gap-2 mb-8">
            <Settings size={18} className="text-[#2D7D46]" />
            <h1 className="text-xl font-bold text-gray-900">Konfigurasi Platform</h1>
            </div>

            <div className="space-y-5">
            {/* Hero settings */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Pengaturan Hero Landing Page</h2>
                <HeroSettingsEditor initialData={hero ?? { title: "BARLING-GO", subtitle: "", image_url: null }} />
            </div>

            {/* Site stats */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Statistik Platform (Ditampilkan di Landing Page)</h2>
                <SiteStatsEditor stats={stats ?? []} />
            </div>
            </div>
        </div>
        </main>
    )
    }
