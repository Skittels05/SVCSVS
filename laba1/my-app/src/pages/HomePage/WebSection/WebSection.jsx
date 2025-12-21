import React from 'react';
import styled from 'styled-components';
import websiteImage from '../../../images/website.png';
import phoneImage from '../../../images/phone.png';

const Section = styled.section`
  display: flex;
  justify-content: space-between;
  margin-top: 9rem;
  overflow: hidden;

  @media (max-width: 768px) {
    margin: 10rem 3.5rem;
    flex-direction: column;
    align-items: center;
  }
`;

const Content = styled.div`
  max-width: 42.8rem;
  margin-left: 19rem;
  margin-top: 11.4rem;

  @media (max-width: 768px) {
    margin-left: 0;
    max-width: 100%;
    text-align: center;
  }

  h2 {
    text-transform: uppercase;
    color: ${props => props.theme.colors.primary};
    line-height: 4.55rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.6rem;

    @media (max-width: 768px) {
      font-size: 3.6rem;
    }
  }

  h4 {
    font-size: 2.2rem;
    line-height: 3rem;
    font-weight: bold;
    color: ${props => props.theme.colors.primary};
    text-transform: uppercase;
    margin-top: 4.1rem;
    margin-bottom: 0.8rem;
  }

  p {
    font-size: 1.9rem;
    line-height: 2.47rem;
  }
`;

const Bold = styled.span`
  font-size: 4.8rem;
  font-weight: bold;
  letter-spacing: 0.1rem;

  @media (max-width: 768px) {
    font-size: 3.6rem;
  }
`;

const Regular = styled.span`
  font-size: 4.8rem;
  font-weight: 300;
  letter-spacing: 0.1rem;

  @media (max-width: 768px) {
    font-size: 3.6rem;
  }
`;

const Light = styled.span`
  font-size: 1.7rem;
  font-weight: 100;
  letter-spacing: 0.1rem;
  margin-left: 1rem;
`;

const PcImage = styled.img`
  width: 54vw;
  height: auto;
  margin-top: 13rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const PhoneContainer = styled.div`
  display: none;
  overflow: hidden;
  margin-top: 3rem;

  @media (max-width: 768px) {
    display: block;
  }

  @media (max-width: 320px) {
    display: none;
  }
`;

const PhoneImage = styled.img`
  width: 30rem;
  height: auto;
`;

const WebSection = () => {
  return (
    <Section>
      <Content>
        <h2>
          <Bold>Improve</Bold>
          <Regular>your</Regular>
          <Regular>brand</Regular>
          <Bold>with an awesome site.</Bold>
        </h2>
        <h4>Comprehensive <Light>brand</Light></h4>
        <p className="regular9">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.
        </p>
        <h4>Web <Light>Presence</Light></h4>
        <p className="regular9">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.
        </p>
      </Content>
      <PcImage src={websiteImage} alt="Website" />
      <PhoneContainer>
        <PhoneImage src={phoneImage} alt="Phone" />
      </PhoneContainer>
    </Section>
  );
};

export default WebSection;