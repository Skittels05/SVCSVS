import React from 'react';
import websiteImage from '../../../images/website.png';
import phoneImage from '../../../images/phone.png';
import './WebSection.css';

const WebSection: React.FC = () => {
  return (
    <section className="web">
      <div className="web-content">
        <h2>
          <span className="bold2">Improve</span>
          <span className="regular4">your</span>
          <span className="regular4">brand</span>
          <span className="bold2">with an awesome site.</span>
        </h2>

        <h4>
          <span>Comprehensive</span>
          <span className="regular5">brand</span>
        </h4>
        <p className="regular9">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          varius enim in eros.
        </p>

        <h4>
          <span>Web</span>
          <span className="regular5">Presence</span>
        </h4>
        <p className="regular9">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          varius enim in eros.
        </p>
      </div>

      <img src={websiteImage} alt="Пример сайта на компьютере" className="pc" />
      <div className="phone-div">
        <img src={phoneImage} alt="Пример сайта на телефоне" className="phone" />
      </div>
    </section>
  );
};

export default WebSection;