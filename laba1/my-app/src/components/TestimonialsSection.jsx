import React, { useState, useEffect } from 'react';
import './TestimonialsSection.css';
import testimonialsData from '../data/testimonials.json';

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    setTestimonials(testimonialsData);
  }, []);

  const handleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section className="think-section">
      <h2 className="think">
        <span className="bold">what</span>
        <span className="regular6">they</span>
        <span className="bold">think</span>
      </h2>
      <section className="cards">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className={`${testimonial.name.toLowerCase().replace(' ', '')} ${
              selectedItems.includes(testimonial.id) ? 'selected' : ''
            }`}
            onClick={() => handleSelect(testimonial.id)}
          >
            <p className={testimonial.name === 'Matthew Webster' ? 'quote-w' : 'quote'}>
              {testimonial.quote}
            </p>
            <img src={require(`../images/${testimonial.img}`)} alt={testimonial.name} />
            <p className="card-name">{testimonial.name}</p>
            <p className="status">{testimonial.status}</p>
          </div>
        ))}
      </section>
      <div className="rectangles">
        <div className="chosen"></div>
        {[...Array(4)].map((_, index) => (
          <div key={index} className="rectangle"></div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;