    import { NextRequest, NextResponse } from "next/server"
    import { createClient } from "@/lib/supabase/server"

    // POST /api/ai/rekomendasi
    export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { query, categoryType } = await request.json()

    // Ambil produk sebagai konteks
    let productQuery = supabase
        .from("products")
        .select("id, name, slug, price, discount_price, images, rating, categories(name, type)")
        .eq("is_active", true)
        .order("rating", { ascending: false })
        .limit(30)

    if (categoryType) productQuery = productQuery.eq("categories.type", categoryType)

    const { data: products } = await productQuery

    // Jika ada histori pembelian user, sertakan sebagai konteks
    let purchaseContext = ""
    if (user) {
        const { data: history } = await supabase
        .from("order_items")
        .select("product_name, products(categories(type))")
        .eq("orders.user_id", user.id)
        .limit(10)
        if (history?.length) {
        purchaseContext = `\nHistori pembelian user: ${history.map((h: any) => h.product_name).join(", ")}`
        }
    }

    const productList = (products ?? [])
        .map((p: any) => `${p.name} (${p.categories?.name ?? ""}) - Rp ${Number(p.price).toLocaleString("id-ID")} - rating: ${p.rating}`)
        .join("\n")

    try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [{
            role: "user",
            content: `Berdasarkan daftar produk berikut dan query pengguna, rekomendasikan 4 produk paling relevan.
            
    Query: "${query ?? "produk terpopuler"}"
    ${purchaseContext}

    Daftar produk:
    ${productList}

    Respond ONLY dengan JSON array berisi 4 nama produk yang paling relevan, format: ["nama1", "nama2", "nama3", "nama4"]
    Jangan tambahkan teks lain di luar JSON.`,
            }],
        }),
        })

        const aiData = await response.json()
        const text = aiData.content?.[0]?.text ?? "[]"

        let recommendedNames: string[] = []
        try {
        recommendedNames = JSON.parse(text.replace(/```json|```/g, "").trim())
        } catch { recommendedNames = [] }

        // Match nama ke produk asli
        const recommended = recommendedNames
        .map((name: string) => products?.find((p) => p.name.toLowerCase().includes(name.toLowerCase())))
        .filter(Boolean)
        .slice(0, 4)

        return NextResponse.json(recommended)
    } catch (e: any) {
        // Fallback: return produk berdasarkan rating tertinggi
        return NextResponse.json((products ?? []).slice(0, 4))
    }
    }
