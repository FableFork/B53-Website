import Hero from "@/components/hero/Hero";
import About from "@/components/about/About";
import Capabilities from "@/components/capabilities/Capabilities";
import Testimonials from "@/components/testimonials/Testimonials";
import Contact from "@/components/contact/Contact";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Capabilities />
      <Testimonials />
      <Contact />
    </main>
  );
}
