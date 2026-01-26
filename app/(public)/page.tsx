import Hero from '../components/Home/Hero/Hero';
import HowItWorks from '../components/Home/HowItWorks';
import StatsImpact from '../components/Home/StatsImpact';
import Testimonials from '../components/Home/Testimonials';
import Partners from '../components/Home/Partners';
import CTABanner from '../components/Home/CTABanner';
import FAQSection from '../components/Home/FAQSection';
import BlogPreview from '../components/Home/BlogPreview';
import NewsletterSignup from '../components/Home/NewsletterSignup';
import ContactSupportTeaser from '../components/Home/ContactSupportTeaser';
import Footer from '../components/Home/Footer';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            <Hero />
            <StatsImpact />
            <HowItWorks />
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
