import Navbar from "@/components/layout/Navbar/Navbar";
import Footer from "@/features/landing/components/Footer";
import HeroSection from "@/features/landing/sections/HeroSection";
import FeaturesSection from "@/features/landing/sections/FeaturesSection";
import HowItWorksSection from "@/features/landing/sections/HowItWorksSection";
import TestimonialsSection from "@/features/landing/sections/TestimonialsSection";
import PricingSection from "@/features/landing/sections/PricingSection";
import FAQSection from "@/features/landing/sections/FAQSection";
import CTABannerSection from "@/features/landing/sections/CTABannerSection";
import WaitlistModal from "@/features/landing/components/WaitlistModal";
import WaitlistWidget from "@/components/WaitlistWidget";

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
      <WaitlistModal />
      <WaitlistWidget />
      <Footer />
    </>
  );
}
