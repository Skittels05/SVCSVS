import React from 'react';
import './FactsSection.css';
import medalImage from '../images/medal.svg';
import imageImage from '../images/IMAGE.svg';
import cupImage from '../images/cup.svg';

class FactsSection extends React.Component {
  render() {
    const facts = [
      {
        img: medalImage,
        digit: '8',
        text: 'Years on market',
        className: 'killer123',
      },
      { img: imageImage, digit: '110+', text: 'Projects done' },
      { digit: '15', text: "Hero's member" },
      { img: cupImage, digit: '100+', text: 'Cups of coffee' },
    ];

    return (
      <section className="facts-section">
        <h2>
          <span className="bold3">fun</span>
          <span className="regular8">facts</span>
        </h2>
        <div className="facts">
          {facts.map((fact, index) => (
            <div key={index}>
              {fact.img && <img src={fact.img} alt="icon" />}
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
  }
}

export default FactsSection;