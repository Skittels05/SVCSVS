import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Container, Title, Card, Button } from '../../../components/ui';
import testimonialsData from '../../../data/testimonials.json';

const Section = styled.section`
  padding: 4rem 0;
  overflow: hidden;
  text-align: center;
`;

const Header = styled.div`
  margin-bottom: 4rem;
`;

const WhatBold = styled.span`
  font-weight: bold;
`;

const TheyRegular = styled.span`
  font-size: 4.2rem;
  font-weight: 300;
`;

const ThinkBold = styled.span`
  font-weight: bold;
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 4rem 0;
`;

const CardsWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  margin-top: 6rem;
`;

const Quote = styled.p`
  font-size: ${props => props.wide ? '2.2rem' : '2rem'};
  line-height: 2.64rem;
  margin: 3.5rem auto;
  width: ${props => props.wide ? '34.4rem' : '36.2rem'};
  max-width: 90%;

  @media (max-width: 768px) {
    font-size: ${props => props.wide ? '2rem' : '1.8rem'};
    width: 100%;
  }
`;

const PersonInfo = styled.div`
  margin-top: 2rem;

  p:first-child {
    text-transform: uppercase;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  img {
    width: 8rem;
    height: 8rem;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 1rem;
  }
`;

const Dots = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.8rem;
  margin-top: 4rem;
`;

const Dot = styled.div`
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background-color: ${props => props.active ? props.theme.colors.primary : 'rgba(34, 34, 34, 0.4)'};
  cursor: pointer;
  transition: background-color 0.3s;
`;

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setTestimonials(testimonialsData);
  }, []);

  const next = () => setActiveIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <Section>
      <Container>
        <Header>
          <Title>
            <WhatBold>what</WhatBold>{' '}
            <TheyRegular>they</TheyRegular>{' '}
            <ThinkBold>think</ThinkBold>
          </Title>
        </Header>

        <Controls>
          <Button onClick={prev}>Previous</Button>
          <Button onClick={next}>Next</Button>
        </Controls>

        <CardsWrapper>
          {testimonials.map((t, i) => (
            <Card key={t.id} $active={i === activeIndex}>
              <Quote wide={t.name === 'Matthew Webster'}>{t.quote}</Quote>
              <PersonInfo>
                <img
                  src={require(`../../../images/${t.img}`)}
                  alt={t.name}
                  onError={(e) => (e.target.src = require('../../../images/placeholder.png'))}
                />
                <p>{t.name}</p>
                <p>{t.status}</p>
              </PersonInfo>
            </Card>
          ))}
        </CardsWrapper>

        <Dots>
          {testimonials.map((_, i) => (
            <Dot key={i} active={i === activeIndex} onClick={() => setActiveIndex(i)} />
          ))}
        </Dots>
      </Container>
    </Section>
  );
};

export default TestimonialsSection;