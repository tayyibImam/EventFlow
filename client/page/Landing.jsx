import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../component/landing/Navbar';
import HeroSection from '../component/landing/HeroSection';
import FeaturesSection from '../component/landing/FeaturesSection';
import HowItWorksSection from '../component/landing/HowItWorksSection';
import RolesSection from '../component/landing/RolesSection';
import CtaSection from '../component/landing/CtaSection';
import Footer from '../component/landing/Footer';

export default function Landing() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-[#1F2937] font-sans antialiased">
      {/* 1. Navigation Bar */}
      <Navbar />

      {/* Main Landing Sections */}
      <main className="flex-1">
        {/* 2. Hero Section with Dashboard Preview */}
        <HeroSection />

        {/* 3. Features Section */}
        <FeaturesSection />

        {/* 4. How It Works Section */}
        <HowItWorksSection />

        {/* 5. Role Section */}
        <RolesSection />

        {/* 6. Final Call to Action */}
        <CtaSection />
      </main>

      {/* 7. Footer */}
      <Footer />
    </div>
  );
}
