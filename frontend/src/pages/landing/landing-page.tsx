import { ContactSection } from './sections/contact-section'
import { CtaSection } from './sections/cta-section'
import { HeroSection } from './sections/hero-section'
import { HighlightsSection } from './sections/highlights-section'
import { HowItWorksSection } from './sections/how-it-works-section'
import { QualificationSection } from './sections/qualification-section'
import { SpecialtiesSection } from './sections/specialties-section'
import { StatisticsSection } from './sections/statistics-section'

export function LandingPage() {
  return (
    <>
      <HeroSection />
      <HighlightsSection />
      <StatisticsSection />
      <SpecialtiesSection />
      <HowItWorksSection />
      <QualificationSection />
      <CtaSection />
      <ContactSection />
    </>
  )
}
