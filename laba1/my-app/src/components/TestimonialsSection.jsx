import React from 'react';
import './TestimonialsSection.css';
import brennanImage from '../images/brennan.png';
import wardImage from '../images/ward.png';
import websterImage from '../images/webster.png';

class TestimonialsSection extends React.Component {
  render() {
    const testimonials = [
      {
        name: 'Paige Brennan',
        quote:
          'The public is more familiar with bad design than good design. It is, in effect, conditioned to prefer bad design, because that is what it lives with.',
        img: brennanImage,
        status: 'Webflow Founder',
        className: 'brennan',
      },
      {
        name: 'Caitlin Ward',
        quote:
          'The public is more familiar with bad design than good design. It is, in effect, conditioned to prefer bad design, because that is what it lives with.',
        img: wardImage,
        status: 'Webflow Founder',
        className: 'ward',
      },
      {
        name: 'Matthew Webster',
        quote:
          'A designer knows he has achieved perfection not when there is nothing left to add, but when there is nothing left to take away.',
        img: websterImage,
        status: 'Webflow Founder',
        className: 'webster',
      },
    ];

    return (
      <section className="think-section">
        <h2 className="think">
          <span className="bold">what</span>
          <span className="regular6">they</span>
          <span className="bold">think</span>
        </h2>
        <section className="cards">
          {testimonials.map((testimonial, index) => (
            <div key={index} className={testimonial.className}>
              <p className={testimonial.name === 'Matthew Webster' ? 'quote-w' : 'quote'}>
                {testimonial.quote}
              </p>
              <img src={testimonial.img} alt={testimonial.name} />
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
  }
}

export default TestimonialsSection;