import Header from "./components/Header";
import Footer  from "./components/Footer";
import Hero from './components/Hero';
import Partners from './components/Partners';
import AgencySection from './components/AgencySection';
import WorkSection from './components/WorkSection';
import WebSection from './components/WebSection';
import TestimonialsSection from './components/TestimonialsSection';
import SkillsSection from './components/SkillsSection';
import FactsSection from './components/FactsSection';
import BlogSection from './components/BlogSection';
import ContactSection from './components/ContactSection';

import "./App.css"
function App() {
  return (
    <div>
      <Header />
      <Hero/>
      <Partners/>
      <AgencySection/>
      <WorkSection/>
      <WebSection/>
      <TestimonialsSection/>
      <SkillsSection/>
      <FactsSection/>
      <BlogSection/>
      <ContactSection/>
      <Footer/>
    </div>
  );
}

export default App;
