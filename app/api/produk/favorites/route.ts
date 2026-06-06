    import { NextRequest, NextResponse } from "next/server"
    import { createClient } from "@/lib/supabase/server"

    export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get("code")
    const next = searchParams.get("next") ?? "/"

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.user) {
        // Tentukan redirect berdasarkan role
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .single()

        const role = profile?.role
        let redirectTo = next

        // Kalau next masih "/", arahkan ke dashboard sesuai role
        if (next === "/") {
            if (role === "super_admin") redirectTo = "/super-admin/dashboard"
            else if (role === "admin") redirectTo = "/admin/dashboard"
            else redirectTo = "/dashboard"
        }

        return NextResponse.redirect(`${origin}${redirectTo}`)
        }
    }

    // Kalau gagal, redirect ke login dengan error param
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
    }