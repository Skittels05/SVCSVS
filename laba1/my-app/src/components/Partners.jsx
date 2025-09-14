import './Partners.css';
import partnersImage from '../images/partners.png';

function Partners() {
  return (
    <div className="partners">
      <p>
        <span>We partner with</span>
        <span className="style1">forward-thinking</span>
        <span>startups.</span>
      </p>
      <div className="icons">
        <img src={partnersImage} alt="partners" className="partners-icons" />
      </div>
    </div>
  );
}

export default Partners;