import React from 'react';
import roby from '../../images/roby.png';
import './Footer.css';

const Footer = () => {
  return (
    <footer>
      <div className="social_logo">
        <img src={roby} alt="Логотип Robi" />
        
        <div className="social-icons">
          <a 
            href="https://facebook.com" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <i className="fab fa-facebook-f" />
          </a>
          
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <i className="fab fa-instagram" />
          </a>
          
          <a 
            href="https://twitter.com" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Twitter"
          >
            <i className="fab fa-twitter" />
          </a>
          
          <a 
            href="https://linkedin.com" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <i className="fab fa-linkedin-in" />
          </a>
          
          <a 
            href="https://dribbble.com" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Dribbble"
          >
            <i className="fa-brands fa-dribbble" />
          </a>
        </div>
      </div>

      <div className="prelast">
        <div className="addressf">
          <h5>address</h5>
          <p>14 New South Head Rd,</p>
          <p>Triple Bay 3148</p>
          <p>London, UK</p>
          <button className="map">find on map</button>
        </div>

        <div className="sitemapf">
          <h5>sitemap</h5>
          <nav>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/about">About</a></li>
              <li><a href="/blog">Blog</a></li>
              <li><a href="/pricing">Pricing</a></li>
              <li><a href="/style-guide">Style Guide</a></li>
              <li><a href="/image-licensing">Image Licensing</a></li>
            </ul>
          </nav>
        </div>

        <div className="contactf">
          <h5>contact</h5>
          <p>
            <span>P: 3740 213 301 <br /></span>
            <span>E: contact@robi.com</span>
          </p>
        </div>
      </div>

      <p className="copyright">
        © This is a Deni Bozo template powered by Webflow.
      </p>
    </footer>
  );
};

export default Footer;