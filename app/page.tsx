import Navbar from "@/components/layout/Navbar"
import HeroSection from "@/components/landing/HeroSection"
import WhySection from "@/components/landing/WhySection"
import TopUMKMSection from "@/components/landing/TopUMKMSection"
import FavoritesSection from "@/components/landing/FavoritesSection"
import TestimonialsSection from "@/components/landing/TestimonialsSection"
import SponsorsSection from "@/components/landing/SponsorsSection"
import CTASection from "@/components/landing/CTASection"

export const metadata = {
  title: "Barling-GO — Jelajahi Barlingmascakep",
  description:
    "Platform wisata dan kuliner khas 5 kabupaten Barlingmascakep. Temukan destinasi, kuliner, dan oleh-oleh terbaik dengan bantuan AI.",
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <WhySection />
      <TopUMKMSection />
      <FavoritesSection />
      <TestimonialsSection />
      <SponsorsSection />
      <CTASection />
    </main>
  )
}