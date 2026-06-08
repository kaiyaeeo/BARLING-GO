    import { createClient } from "@/lib/supabase/server"
    import Link from "next/link"
    import ContentToggle from "@/components/super-admin/ContentToggle"
    import { FileText, Plus, Eye, EyeOff } from "lucide-react"

    export default async function SuperAdminKontenPage() {
    const supabase = await createClient()

    const { data: contents } = await supabase
        .from("contents")
        .select("id, type, title, slug, is_published, view_count, created_at")
        .order("created_at", { ascending: false })

    const tabs = ["semua", "destinasi", "kuliner", "oleh-oleh", "artikel"]
    const counts = tabs.reduce((acc, t) => {
        acc[t] = t === "semua"
        ? contents?.length ?? 0
        : contents?.filter((c) => c.type === t).length ?? 0
        return acc
    }, {} as Record<string, number>)

    const TYPE_COLOR: Record<string, string> = {
        destinasi: "bg-blue-100 text-blue-700",
        kuliner:   "bg-orange-100 text-orange-700",
        "oleh-oleh": "bg-amber-100 text-amber-700",
        artikel:   "bg-purple-100 text-purple-700",
    }

    return (
        <main className="min-h-screen bg-gray-50 pt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-bold text-gray-900">Kelola Konten</h1>
            <Link
                href="/super-admin/konten/tambah"
                className="flex items-center gap-2 px-4 py-2 bg-[#2D7D46] text-white text-sm font-semibold rounded-xl hover:bg-[#236338] transition-all"
            >
                <Plus size={15} /> Tambah Konten
            </Link>
            </div>

            {/* Summary */}
            <div className="flex gap-3 flex-wrap mb-6">
            {tabs.map((t) => (
                <div key={t} className="bg-white rounded-xl border border-gray-100 px-4 py-2 text-center">
                <p className="text-lg font-black text-gray-900">{counts[t]}</p>
                <p className="text-xs text-gray-400 capitalize">{t}</p>
                </div>
            ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <FileText size={16} className="text-[#2D7D46]" />
                <h2 className="text-sm font-bold text-gray-800">Semua Konten</h2>
            </div>
            <div className="divide-y divide-gray-50">
                {(contents ?? []).map((c) => (
                <div key={c.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${TYPE_COLOR[c.type] ?? "bg-gray-100 text-gray-600"}`}>
                        {c.type}
                        </span>
                        <p className="text-sm font-semibold text-gray-800 truncate">{c.title}</p>
                    </div>
                    <p className="text-xs text-gray-400">
                        {c.view_count} views · {new Date(c.created_at).toLocaleDateString("id-ID")}
                    </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                    <span className={`flex items-center gap-1 text-xs font-medium ${c.is_published ? "text-green-600" : "text-gray-400"}`}>
                        {c.is_published ? <Eye size={13} /> : <EyeOff size={13} />}
                        {c.is_published ? "Publik" : "Draft"}
                    </span>
                    <ContentToggle contentId={c.id} isPublished={c.is_published} />
                    <Link
                        href={`/super-admin/konten/${c.id}/edit`}
                        className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-all"
                    >
                        Edit
                    </Link>
                    </div>
                </div>
                ))}
                {(!contents || contents.length === 0) && (
                <p className="text-center text-sm text-gray-300 py-12">Belum ada konten.</p>
                )}
            </div>
            </div>
        </div>
        </main>
    )
    }
