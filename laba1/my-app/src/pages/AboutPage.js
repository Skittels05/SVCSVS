import React from 'react';
import AgencySection from '../components/AgencySection';
import TestimonialsSection from '../components/TestimonialsSection';
import SkillsSection from '../components/SkillsSection';
import FactsSection from '../components/FactsSection';

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