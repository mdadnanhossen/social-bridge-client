import Hero from "@/components/sections/Hero";
import ImpactStats from "@/components/sections/ImpactStats";
import FeaturedEvents from "@/components/sections/FeaturedEvents";
import HowItWorks from "@/components/sections/HowItWorks";
import Mission from "@/components/sections/Mission";
import Gallery from "@/components/sections/Gallery";
import Testimonials from "@/components/sections/Testimonials";
import CallToAction from "@/components/sections/CallToAction";
import Newsletter from "@/components/sections/Newsletter";

export default function Home() {
  return (
    <>
      <Hero />
      <ImpactStats />
      <FeaturedEvents />
      <HowItWorks />
      <Mission />
      <Gallery />
      <Testimonials />
      <CallToAction />
      <Newsletter />
    </>
  );
}
