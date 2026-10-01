import Navbar from "../../components/layout/Navbar";
import Hero from "../../components/common/Hero";
import Stats from "../../components/common/Stats";
import Features from "../../components/common/Features";
import Testimonials from "../../components/common/Testimonials";
import CTA from "../../components/common/CTA";
import Footer from "../../components/layout/Footer";

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main>
        <Hero />

        <Stats />

        <Features />

        <Testimonials />

        <CTA />
      </main>

      <Footer />
    </div>
  );
}

export default HomePage;