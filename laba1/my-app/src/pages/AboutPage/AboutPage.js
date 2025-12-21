import React from 'react';
import AgencySection from './AgencySection/AgencySection';
import FactsSection from './FactsSection/FactsSection';
import SkillsSection from './SkillsSection/SkillsSection';
import TestimonialsSection from './TestimonialsSection/TestimonialsSection';

const AboutPage = () => {
  return (
    <>
      <AgencySection />
      <TestimonialsSection />
      <SkillsSection />
      <FactsSection />
    </>
  );
};

export default AboutPage;