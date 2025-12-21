import React from 'react';
import styled from 'styled-components';
import { Button } from '../../../components/ui';
import man from '../../../images/man.png';
import man2 from '../../../images/man2.png';

const HeroWrapper = styled.div`
  margin-top: 11.5rem;
  position: relative;
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  position: relative;
  height: 0;
`;

const LogoImage = styled.img`
  max-width: 28.6%;
  height: auto;
  position: absolute;
  top: -12rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Moto = styled.div`
  display: flex;
  position: relative;

  @media (max-width: 768px) {
    justify-content: center;
    text-align: center;
    background-image: url(${man2});
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center top;
    margin-top: -8rem;
    min-height: 75rem;

    @media (max-width: 560px) {
      min-height: 60rem;
    }
  }
`;

const ManImage = styled.img`
  width: 51.4%;
  height: 60rem;
  object-fit: cover;
  margin-left: 0.3rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const TextBlock = styled.div`
  h1 {
    color: ${props => props.theme.colors.primary};
    margin-top: 10.6rem;
    margin-left: 5.9rem;
    line-height: 5.6rem;
    font-size: 6rem;

    @media (max-width: 768px) {
      color: aliceblue;
      margin-top: 58.5rem;
      margin-left: 0;
      padding: 0 2rem;

      @media (max-width: 560px) {
        margin-top: 40rem;
      }
    }
  }
`;

const QuoteOpen = styled.span`
  font-size: 6rem;
`;

const Bold = styled.span`
  font-size: 6rem;
  font-weight: bold;
  text-transform: uppercase;
  display: block;
`;

const Regular = styled.span`
  font-size: 4.9rem;
  font-weight: 200;
  letter-spacing: 0.1rem;
  text-transform: uppercase;
  display: block;
`;

const QuoteClose = styled.span`
  font-size: 4.4rem;
  font-weight: 200;
  display: block;
`;

const WorkButton = styled(Button)`
  width: 14rem;
  height: 14rem;
  border-radius: 50%;
  font-size: 1.4rem;
  line-height: 2rem;
  letter-spacing: 0.1rem;
  margin-top: 8rem;
  margin-left: 6rem;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;

  @media (max-width: 768px) {
    background-color: aliceblue;
    color: black;
    margin: 4rem auto 6rem;
  }
`;

const Hero = ({ logo }) => {
  return (
    <HeroWrapper>
      <LogoContainer>
        <LogoImage src={logo} alt="Roby" />
      </LogoContainer>

      <Moto>
        <ManImage src={man} alt="Man" />

        <TextBlock>
          <h1>
            <QuoteOpen>“</QuoteOpen>
            <Bold>WE BELIEVE THAT</Bold>
            <Regular>THE POWER OF DESIGN</Regular>
            <Bold>HELPS BUSINESSES</Bold>
            <QuoteClose>.”</QuoteClose>
          </h1>

          <WorkButton $round>
            WORK<br />WITH US
          </WorkButton>
        </TextBlock>
      </Moto>
    </HeroWrapper>
  );
};

export default Hero;