    import { NextRequest, NextResponse } from "next/server"
    import { createClient } from "@/lib/supabase/server"

    // POST /api/ai/chat
    export async function POST(request: NextRequest) {
    const supabase = await createClient()

    // Boleh diakses tanpa login, tapi history disimpan jika login
    const { data: { user } } = await supabase.auth.getUser()

    const { messages, sessionId } = await request.json()
    if (!messages?.length) return NextResponse.json({ error: "messages required" }, { status: 400 })

    // Ambil data konteks: produk & destinasi terpopuler untuk AI
    const [{ data: destinations }, { data: topProducts }] = await Promise.all([
        supabase.from("contents")
        .select("title, type, description, location")
        .eq("is_published", true)
        .limit(20),
        supabase.from("products")
        .select("name, price, categories(name, type)")
        .eq("is_active", true)
        .order("rating", { ascending: false })
        .limit(20),
    ])

    const contextText = [
        "=== DESTINASI WISATA ===",
        ...(destinations ?? []).map((d) => `- ${d.title} (${d.type}): ${d.description ?? ""} ${d.location ? `· Lokasi: ${d.location}` : ""}`),
        "\n=== PRODUK & KULINER ===",
        ...(topProducts ?? []).map((p: any) => `- ${p.name} (${p.categories?.name ?? p.categories?.type ?? ""}): Rp ${Number(p.price).toLocaleString("id-ID")}`),
    ].join("\n")

    const systemPrompt = `Kamu adalah AI Assistant Barling-GO, platform wisata dan UMKM untuk kawasan Barlingmascakep (Banyumas, Purbalingga, Cilacap, Kebumen, Banjarnegara) di Jawa Tengah.

    Tugasmu:
    - Merekomendasikan destinasi wisata, kuliner, dan oleh-oleh khas Barlingmascakep
    - Membantu pengguna merencanakan itinerary perjalanan
    - Menjawab pertanyaan seputar produk dan UMKM lokal
    - Berbicara ramah, informatif, dan antusias dalam Bahasa Indonesia

    Data terkini yang kamu miliki:
    ${contextText}

    Jika ditanya di luar topik wisata/kuliner Barlingmascakep, arahkan kembali ke topik tersebut dengan ramah.
    Jawab secara ringkas dan padat, gunakan emoji secukupnya agar lebih menarik.`

    try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            system: systemPrompt,
            messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
        }),
        })

        if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error?.message ?? "AI error")
        }

        const data = await response.json()
        const assistantMessage = data.content?.[0]?.text ?? "Maaf, saya tidak bisa memproses permintaan kamu saat ini."

        // Simpan history jika user login
        if (user && sessionId) {
        const lastUserMsg = messages[messages.length - 1]
        await supabase.from("ai_chat_history").insert([
            { user_id: user.id, session_id: sessionId, role: "user", content: lastUserMsg.content },
            { user_id: user.id, session_id: sessionId, role: "assistant", content: assistantMessage },
        ])
        }

        return NextResponse.json({ message: assistantMessage })
    } catch (e: any) {
        console.error("AI chat error:", e.message)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
    }
