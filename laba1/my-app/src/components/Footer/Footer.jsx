import React from 'react';
import styled from 'styled-components';
import roby from '../../images/roby.png';

const FooterWrapper = styled.footer`
  padding-inline: 12rem;

  @media (max-width: 768px) {
    padding-inline: 3rem;
  }

  @media (max-width: 560px) {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    text-align: center;
  }
`;

const SocialLogo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 7.4rem;

  @media (max-width: 560px) {
    flex-wrap: wrap;
    justify-content: center;
  }

  img {
    width: 11rem;
  }
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 3rem;
  margin-top: 2.2rem;
  margin-right: 1.4rem;

  a {
    color: ${props => props.theme.colors.primary};
    font-size: 1.7rem;
    transition: opacity 0.3s;

    &:hover {
      opacity: 0.5;
    }
  }
`;

const Prelast = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 6rem;

  @media (max-width: 560px) {
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const Column = styled.div`
  h5 {
    font-weight: bold;
    font-size: 2rem;
    color: ${props => props.theme.colors.primary};
    text-transform: uppercase;
    margin-bottom: 2.2rem;
  }

  p {
    font-size: 1.9rem;
    line-height: 2.47rem;
  }
`;

const Address = styled(Column)`
  margin-top: 6.2rem;
`;

const Sitemap = styled(Column)`
  margin-top: 6.2rem;
  position: relative;
  right: 6rem;

  @media (max-width: 768px) {
    display: none;
  }

  ul {
    list-style: none;

    li {
      margin-top: 0.6rem;

      a {
        text-decoration: none;
        color: inherit;
      }
    }
  }
`;

const Contact = styled(Column)`
  margin-top: 3.8rem;
  position: relative;
  right: 2rem;

  @media (max-width: 560px) {
    text-align: center;
  }
`;

const MapButton = styled.button`
  margin-top: 4rem;
  width: fit-content;
  padding: 1.6rem 2.7rem;
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.background};
  border: none;
  border-radius: 30px;
  font-size: 1.5rem;
  text-transform: uppercase;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.7;
  }
`;

const Copyright = styled.p`
  margin-top: 3rem;
  font-size: 1.7rem;
  text-align: center;
`;

const Footer = () => {
  return (
    <FooterWrapper>
      <SocialLogo>
        <img src={roby} alt="roby" />
        <SocialIcons>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in"></i></a>
          <a href="https://dribbble.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-dribbble"></i></a>
        </SocialIcons>
      </SocialLogo>

      <Prelast>
        <Address>
          <h5>address</h5>
          <p>14 New South Head Rd,</p>
          <p>Triple Bay 3148</p>
          <p>London, UK</p>
          <MapButton>find on map</MapButton>
        </Address>

        <Sitemap>
          <h5>sitemap</h5>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/pricing">Pricing</a></li>
            <li><a href="/style-guide">Style Guide</a></li>
            <li><a href="/image-licensing">Image Licensing</a></li>
          </ul>
        </Sitemap>

        <Contact>
          <h5>contact</h5>
          <p>P: 3740 213 301 <br /> E: contact@robi.com</p>
        </Contact>
      </Prelast>

      <Copyright>&copy; This is a Deni Bozo template powered by Webflow.</Copyright>
    </FooterWrapper>
  );
};

export default Footer;