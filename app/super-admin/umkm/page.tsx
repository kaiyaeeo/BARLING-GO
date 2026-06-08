    import { createClient } from "@/lib/supabase/server"
    import UMKMVerifyButton from "@/components/super-admin/UMKMVerifyButton"
    import { Store, CheckCircle2, Clock, XCircle } from "lucide-react"

    export default async function SuperAdminUMKMPage() {
    const supabase = await createClient()

    const { data: verifications } = await supabase
        .from("umkm_verifications")
        .select("*, profiles(full_name, phone)")
        .order("created_at", { ascending: false })

    const pending = verifications?.filter((v) => v.status === "pending").length ?? 0
    const approved = verifications?.filter((v) => v.status === "approved").length ?? 0
    const rejected = verifications?.filter((v) => v.status === "rejected").length ?? 0

    const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
        pending:  { label: "Pending",  color: "bg-amber-100 text-amber-700", icon: Clock },
        approved: { label: "Disetujui", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
        rejected: { label: "Ditolak",  color: "bg-red-100 text-red-600",    icon: XCircle },
    }

    return (
        <main className="min-h-screen bg-gray-50 pt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <h1 className="text-xl font-bold text-gray-900 mb-8">Verifikasi UMKM</h1>

            <div className="grid grid-cols-3 gap-4 mb-8">
            {[
                { label: "Pending", value: pending, color: "text-amber-600" },
                { label: "Disetujui", value: approved, color: "text-green-600" },
                { label: "Ditolak", value: rejected, color: "text-red-500" },
            ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                </div>
            ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Store size={16} className="text-[#2D7D46]" />
                <h2 className="text-sm font-bold text-gray-800">Semua Pengajuan</h2>
            </div>
            <div className="divide-y divide-gray-50">
                {(verifications ?? []).map((v: any) => {
                const cfg = STATUS_CONFIG[v.status]
                const Icon = cfg.icon
                return (
                    <div key={v.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-bold text-gray-800">{v.business_name}</p>
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${cfg.color}`}>
                            <Icon size={10} />{cfg.label}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500">{(v.profiles as any)?.full_name} · {(v.profiles as any)?.phone}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {v.business_type ?? "—"} · {v.address ?? "—"} ·{" "}
                            {new Date(v.created_at).toLocaleDateString("id-ID")}
                        </p>
                        {v.rejection_reason && (
                            <p className="text-xs text-red-500 mt-1">Alasan tolak: {v.rejection_reason}</p>
                        )}
                        </div>
                        {v.status === "pending" && (
                        <UMKMVerifyButton verificationId={v.id} userId={v.user_id} />
                        )}
                    </div>
                    </div>
                )
                })}
                {(!verifications || verifications.length === 0) && (
                <p className="text-center text-sm text-gray-300 py-12">Belum ada pengajuan verifikasi.</p>
                )}
            </div>
            </div>
        </div>
        </main>
    )
    }
