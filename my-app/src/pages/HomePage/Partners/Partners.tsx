import React from 'react';
import partnersImage from '../../../images/partners.png';
import './Partners.css';

const Partners = () => {
  return (
    <div className="partners">
      <p>
        <span>We partner with</span>
        <span className="style1">forward-thinking</span>
        <span>startups.</span>
      </p>

      <div className="icons">
        <img src={partnersImage} alt="Логотипы партнёров" className="partners-icons" />
      </div>
    </div>
  );
};

export default Partners;