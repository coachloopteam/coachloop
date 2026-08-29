import Hero from "@/components/landing/Hero";
import FeatureBentoGrid from "@/components/landing/FeatureBentoGrid";
import ActivityNutritionTeaser from "@/components/landing/ActivityNutritionTeaser";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <FeatureBentoGrid />
      <ActivityNutritionTeaser />
      <LandingFooter />
    </div>
  );
}
