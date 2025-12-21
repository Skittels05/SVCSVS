// src/pages/NotFoundPage/NotFoundPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import placeholder from '../../images/placeholder.png';

const Section = styled.section`
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  overflow: hidden;
`;

const Title = styled.h1`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const Bold = styled.span`
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

const Regular = styled.span`
  font-size: 4.2rem;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${props => props.theme.colors.primary};
  position: relative;
  top: -0.5rem;

  @media (max-width: 768px) {
    font-size: 3rem;
    line-height: 4rem;
  }

  @media (max-width: 480px) {
    font-size: 2.2rem;
    line-height: 3rem;
  }
`;

const Message = styled.p`
  font-size: 2rem;
  line-height: 2.64rem;
  color: #333;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    font-size: 1.8rem;
    line-height: 2.2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.6rem;
    line-height: 2rem;
  }
`;

const Image = styled.img`
  width: 20rem;
  max-width: 80%;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    width: 15rem;
  }

  @media (max-width: 480px) {
    width: 12rem;
  }
`;

const HomeButton = styled(Link)`
  padding: 0.5rem 1rem;
  font-size: 1.4rem;
  text-transform: uppercase;
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.background};
  border: none;
  border-radius: 5px;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.3s ease, transform 0.3s ease;
  display: inline-block;

  &:hover {
    opacity: 0.7;
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    font-size: 1.2rem;
    padding: 0.4rem 0.8rem;
  }

  @media (max-width: 480px) {
    font-size: 1.1rem;
    padding: 0.3rem 0.7rem;
  }
`;

const NotFoundPage = () => {
  return (
    <Section>
      <Title>
        <Bold>404</Bold>
        <Regular>Not Found</Regular>
      </Title>
      <Message>
        Oops! The page you're looking for doesn't exist.
      </Message>
      <Image
        src={placeholder}
        alt="404"
        onError={(e) => (e.target.src = placeholder)}
      />
      <HomeButton to="/">
        Back to Home
      </HomeButton>
    </Section>
  );
};

export default NotFoundPage;