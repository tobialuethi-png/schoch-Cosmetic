import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import HeroStats from "@/components/HeroStats";
import Marquee from "@/components/Marquee";
import Technology from "@/components/Technology";
import TreatmentsPricing from "@/components/TreatmentsPricing";
import PhotoGallery from "@/components/PhotoGallery";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Lightbox from "@/components/Lightbox";
import HomeEffects from "@/components/HomeEffects";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <HeroStats />
        <Marquee />
        <Technology />
        <TreatmentsPricing mode="haarentfernung" />
        <PhotoGallery />
        <TreatmentsPricing mode="fusspflege" />
        <About />
        <Contact />
      </main>
      <Footer />
      <Lightbox />
      <HomeEffects />
    </>
  );
}
