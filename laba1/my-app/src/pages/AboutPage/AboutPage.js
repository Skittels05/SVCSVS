import React, { useState, useEffect } from 'react';
import testimonialsData from '../../data/testimonials.json';
import skillsData from '../../data/skills.json';
import factsData from '../../data/facts.json';
import teamImage from '../../images/team.png';
import './AboutPage.css';

const AboutPage = () => {
  // AgencySection Component
  const AgencySection = () => {
    const awards = [
      {
        title: 'Awwards',
        items: [
          { text: 'Site of the Day', count: 3 },
          { text: 'Developer Award', count: 1 },
          { text: 'Honorable Mention', count: 7 },
          { text: 'Mobile Excellence', count: 3 },
        ],
      },
      {
        title: 'CSS Design Awards',
        items: [
          { text: 'UX Design Award', count: 10 },
          { text: 'UI Design Award', count: 4 },
          { text: 'Innovation Design Award', count: 7 },
          { text: 'Website of the Day', count: 13 },
        ],
      },
    ];

    return (
      <section className="section1">
        <div className="agency">
          <h2>
            <span className="bold">THE PERFECT<br /></span>
            <span className="regular2">AGENCY FOR YOUR BRAND</span>
          </h2>
          <p>
            We love what we do and create partnerships with our clients to ensure
            their digital transformation is positioned for long-term success.
          </p>
          <p>
            We believe that the human dimensions essential to start any successful
            project and that this is where splendid emotional relationships between
            the company and people are born.
          </p>
        </div>
        <div className="awwards">
          {awards.map((award, index) => (
            <div key={index}>
              <div className="awwards-title">
                <h4>{award.title}</h4>
                <h4>{award.items.reduce((sum, item) => sum + item.count, 0)}</h4>
              </div>
              <hr />
              <ul>
                {award.items.map((item, i) => (
                  <li key={i}>
                    <span>{item.text}</span>
                    <span>{item.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    );
  };

  // TestimonialsSection Component
  const TestimonialsSection = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
      setTestimonials(testimonialsData);
    }, []);

    const handleNext = () => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    };

    const handlePrev = () => {
      setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    return (
      <section className="think-section">
        <h2 className="think">
          <span className="bold">what</span>
          <span className="regular6">they</span>
          <span className="bold">think</span>
        </h2>
        <div className="carousel-controls">
          <button onClick={handlePrev}>Previous</button>
          <button onClick={handleNext}>Next</button>
        </div>
        <section className="cards">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`card ${index === activeIndex ? 'active' : ''}`}
            >
              <p className={testimonial.name === 'Matthew Webster' ? 'quote-w' : 'quote'}>
                {testimonial.quote}
              </p>
              <img
                src={require(`../../images/${testimonial.img}`)}
                alt={testimonial.name}
                onError={(e) => (e.target.src = require('../../images/placeholder.png'))}
              />
              <p className="card-name">{testimonial.name}</p>
              <p className="status">{testimonial.status}</p>
            </div>
          ))}
        </section>
        <div className="rectangles">
          {testimonials.map((_, index) => (
            <div
              key={index}
              className={`rectangle ${index === activeIndex ? 'chosen' : ''}`}
              onClick={() => setActiveIndex(index)}
            ></div>
          ))}
        </div>
      </section>
    );
  };

  // SkillsSection Component
  const SkillsSection = () => {
    const [skills, setSkills] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);

    useEffect(() => {
      setSkills(skillsData);
    }, []);

    const handleSelect = (id) => {
      setSelectedItems((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    };

    return (
      <section className="team_skills">
        <div className="skills-block">
          <h2>
            <span>our</span>
            <span className="regular7">team</span>
            <span>skills</span>
          </h2>
          <div className="graphic">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className={`skill-item ${selectedItems.includes(skill.id) ? 'selected' : ''}`}
                onClick={() => handleSelect(skill.id)}
              >
                <div className="skill-text">
                  <span>{skill.name}</span>
                  <span>{skill.percentage}%</span>
                </div>
                <hr className={skill.className} />
              </div>
            ))}
            <p>* Over 8 years creating templates on Marketplace.</p>
          </div>
        </div>
        <img src={teamImage} alt="team" />
      </section>
    );
  };

  // FactsSection Component
  const FactsSection = () => {
    const [facts, setFacts] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);

    useEffect(() => {
      setFacts(factsData);
    }, []);

    const handleSelect = (id) => {
      setSelectedItems((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    };

    return (
      <section className="facts-section">
        <h2>
          <span className="bold3">fun</span>
          <span className="regular8">facts</span>
        </h2>
        <div className="facts">
          {facts.map((fact) => (
            <div
              key={fact.id}
              className={selectedItems.includes(fact.id) ? 'selected' : ''}
              onClick={() => handleSelect(fact.id)}
            >
              {fact.img && <img src={require(`../../images/${fact.img}`)} alt="icon" />}
              <p className={fact.className || ''}>
                <span className={fact.digit.length > 2 ? 'digit2' : 'digit'}>
                  {fact.digit}
                </span>
                <span className="regular9">{fact.text}</span>
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  };

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