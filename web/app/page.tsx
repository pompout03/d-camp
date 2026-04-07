import Navbar from "@/components/layout/Navbar/Navbar";
import Footer from "@/features/landing/components/Footer";
import HeroSection from "@/features/landing/sections/HeroSection";
import FeaturesSection from "@/features/landing/sections/FeaturesSection";
import HowItWorksSection from "@/features/landing/sections/HowItWorksSection";
import TestimonialsSection from "@/features/landing/sections/TestimonialsSection";
import PricingSection from "@/features/landing/sections/PricingSection";
import FAQSection from "@/features/landing/sections/FAQSection";
import CTABannerSection from "@/features/landing/sections/CTABannerSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <CTABannerSection />
      </main>
      <Footer />
    </>
  );
}
