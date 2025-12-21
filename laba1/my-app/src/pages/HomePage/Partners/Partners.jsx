import React from 'react';
import styled from 'styled-components';
import { Container } from '../../../components/ui';
import partnersImage from '../../../images/partners.png';

const PartnersWrapper = styled.div`
  text-align: center;
  text-transform: uppercase;
  font-size: 2.7rem;
  margin-top: 12.6rem;
  color: ${props => props.theme.colors.primary};

  span.style1 {
    font-size: 2.2rem;
    letter-spacing: 0.1rem;
    margin-left: 9px;
  }
`;

const Icons = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 5rem;
`;

const PartnersImg = styled.img`
  width: 80%;
  height: auto;
  margin-left: 6.2rem;

  @media (max-width: 768px) {
    width: 100vw;
    margin: 0;
    object-fit: cover;
  }
`;

const Partners = () => {
  return (
    <Container>
      <PartnersWrapper>
        <p>
          <span>We partner with</span>
          <span className="style1">forward-thinking</span>
          <span>startups.</span>
        </p>
        <Icons>
          <PartnersImg src={partnersImage} alt="partners" />
        </Icons>
      </PartnersWrapper>
    </Container>
  );
};

export default Partners;