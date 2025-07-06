import React from 'react';
import Hero from './Hero/Hero';
import HowItWorks from './HowItWorks';
import StatsImpact from './StatsImpact';
import Testimonials from './Testimonials';
import Partners from './Partners';
import CTABanner from './CTABanner';
import FAQSection from './FAQSection';
import BlogPreview from './BlogPreview';
import NewsletterSignup from './NewsletterSignup';
import ContactSupportTeaser from './ContactSupportTeaser';
import Footer from './Footer';

const Home = () => {
  return (
    <div>
      <Hero />
      <HowItWorks />
      <StatsImpact />
      <Testimonials />
      <Partners />
      <CTABanner />
      <FAQSection />
      <BlogPreview />
      <NewsletterSignup />
      <ContactSupportTeaser />
      <Footer />
    </div>
  )
}

export default Home