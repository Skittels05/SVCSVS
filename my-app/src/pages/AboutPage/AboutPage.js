import React from 'react';
import AgencySection from './AgencySection/AgencySection';
import TestimonialsSection from './TestimonialsSection/TestimonialsSection';
import SkillsSection from './SkillsSection/SkillsSection';
import FactsSection from './FactsSection/FactsSection';

const AboutPage = () => {
  return (
    <div>
      <AgencySection />
      <TestimonialsSection />
      <SkillsSection />
      <FactsSection />
    </div>
  );
};

export default AboutPage;