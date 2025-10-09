import React from 'react';
import Hero from '../components/Hero';
import Partners from '../components/Partners';
import WorkSection from '../components/WorkSection';
import WebSection from '../components/WebSection';
import roby from '../images/roby.png';

const HomePage = () => {
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