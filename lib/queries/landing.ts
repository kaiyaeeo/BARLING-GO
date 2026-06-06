    import { createClient } from "@/lib/supabase/server"

    export type Product = {
    id: string
    name: string
    slug: string
    price: number
    discount_price: number | null
    images: string[]
    is_top_umkm: boolean
    is_featured: boolean
    rating: number
    total_sold: number
    categories: { name: string; type: string; slug: string } | null
    }

    export type Testimonial = {
    id: string
    name: string
    avatar_initials: string
    avatar_color: string
    rating: number
    content: string
    }

    export type SiteStat = {
    key: string
    value: string
    label: string
    sub_label: string | null
    }

    export type HeroSettings = {
    image_url: string | null
    title: string
    subtitle: string
    }

    // Ambil produk Top UMKM (is_top_umkm = true, max 8)
    export async function getTopUMKM(): Promise<Product[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("products")
        .select(`
        id, name, slug, price, discount_price,
        images, is_top_umkm, is_featured, rating, total_sold,
        categories (name, type, slug)
        `)
        .eq("is_active", true)
        .eq("is_top_umkm", true)
        .order("total_sold", { ascending: false })
        .limit(8)

    if (error) {
        console.error("getTopUMKM error:", error.message)
        return []
    }
    return (data as unknown as Product[]) ?? []
    }

    // Ambil produk Favorites (semua kategori, bisa filter, max 8)
    export async function getFavoriteProducts(type?: string): Promise<Product[]> {
    const supabase = await createClient()

    let query = supabase
        .from("products")
        .select(`
        id, name, slug, price, discount_price,
        images, is_top_umkm, is_featured, rating, total_sold,
        categories (name, type, slug)
        `)
        .eq("is_active", true)
        .order("rating", { ascending: false })
        .limit(8)

    if (type && type !== "All") {
        query = query.eq("categories.type", type.toLowerCase())
    }

    const { data, error } = await query
    if (error) {
        console.error("getFavoriteProducts error:", error.message)
        return []
    }
    return (data as unknown as Product[]) ?? []
    }

    // Ambil testimonial featured
    export async function getFeaturedTestimonials(): Promise<Testimonial[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("testimonials")
        .select("id, name, avatar_initials, avatar_color, rating, content")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(3)

    if (error) {
        console.error("getFeaturedTestimonials error:", error.message)
        return []
    }
    return data ?? []
    }

    // Ambil site stats
    export async function getSiteStats(): Promise<SiteStat[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("site_stats")
        .select("key, value, label, sub_label")
        .order("sort_order")

    if (error) {
        console.error("getSiteStats error:", error.message)
        return []
    }
    return data ?? []
    }

    // Ambil hero settings
    export async function getHeroSettings(): Promise<HeroSettings> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("hero_settings")
        .select("image_url, title, subtitle")
        .eq("id", 1)
        .single()

    if (error || !data) {
        return {
        image_url: null,
        title: "BARLING-GO",
        subtitle: "Jelajahi kuliner khas 5 kabupaten dalam hitungan detik dengan AI",
        }
    }
    return data
    }

    // Helper: ambil public URL foto dari Supabase Storage
    export function getStorageUrl(bucket: string, path: string | null): string {
    if (!path) return "/images/placeholder.jpg"
    if (path.startsWith("http")) return path

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
    }