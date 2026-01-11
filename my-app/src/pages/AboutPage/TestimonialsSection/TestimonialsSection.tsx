import React, { useState, useEffect } from 'react';
import './TestimonialsSection.css';
import testimonialsData from '../../../data/testimonials.json';

interface Testimonial {
  id: number | string;
  name: string;
  quote: string;
  img: string;
  status: string;
}

const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setTestimonials(testimonialsData as Testimonial[]);
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
            <p
              className={
                testimonial.name === 'Matthew Webster' ? 'quote-w' : 'quote'
              }
            >
              {testimonial.quote}
            </p>

            <img
              src={require(`../../../images/${testimonial.img}`)}
              alt={testimonial.name}
              onError={(e) => {
                e.currentTarget.src = require('../../../images/placeholder.png');
              }}
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
          />
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;