import React from 'react';
import Hero from './Hero/Hero';
import Partners from './Partners/Partners';
import WorkSection from './WorkSection/WorkSection';
import WebSection from './WebSection/WebSection';
import roby from '../../images/roby.png';

const HomePage: React.FC = () => {
  return (
    <div>
      <Hero logo={roby} />
      <Partners />
      <WorkSection />
      <WebSection />
    </div>
  );
};

export default HomePage;