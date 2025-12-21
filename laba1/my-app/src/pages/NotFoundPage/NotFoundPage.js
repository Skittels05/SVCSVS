import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Container, Button } from '../../components/ui';
import placeholder from '../../images/placeholder.png';

const Section = styled.section`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  gap: 4rem;
  overflow: hidden;
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Number404 = styled.div`
  font-size: 6rem;
  font-weight: bold;
  text-transform: uppercase;
  color: ${props => props.theme.colors.primary};

  @media (max-width: 768px) {
    font-size: 4rem;
  }

  @media (max-width: 480px) {
    font-size: 3rem;
  }
`;

const NotFoundText = styled.div`
  font-size: 4.2rem;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${props => props.theme.colors.primary};

  @media (max-width: 768px) {
    font-size: 3rem;
  }

  @media (max-width: 480px) {
    font-size: 2.2rem;
  }
`;

const Message = styled.p`
  font-size: 2rem;
  line-height: 2.64rem;
  color: #333;
  max-width: 60rem;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }

  @media (max-width: 480px) {
    font-size: 1.6rem;
  }
`;

const Image = styled.img`
  width: 20rem;
  max-width: 80%;

  @media (max-width: 768px) {
    width: 15rem;
  }

  @media (max-width: 480px) {
    width: 12rem;
  }
`;

const NotFoundPage = () => {
  return (
    <Container>
      <Section>
        <TitleWrapper>
          <Number404>404</Number404>
          <NotFoundText>Not Found</NotFoundText>
        </TitleWrapper>

        <Message>
          Oops! The page you're looking for doesn't exist.
        </Message>

        <Image src={placeholder} alt="404" onError={(e) => (e.target.src = placeholder)} />

        <Button as={Link} to="/" $large>
          Back to Home
        </Button>
      </Section>
    </Container>
  );
};

export default NotFoundPage;