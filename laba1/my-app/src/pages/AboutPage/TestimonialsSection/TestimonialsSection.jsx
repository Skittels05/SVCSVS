import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import testimonialsData from '../../../data/testimonials.json';

const fadeIn = keyframes`
  from { opacity: 0.5; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
`;

const Section = styled.section`
  padding: 2rem 0;
  overflow: hidden;
`;

const Title = styled.h2`
  text-align: center;
  margin-top: 3rem;
  font-size: 6rem;
  text-transform: uppercase;
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
`;

const ControlBtn = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.background};
  border: none;
  border-radius: 5px;
  text-transform: uppercase;
  cursor: pointer;
  &:hover { opacity: 0.7; }
`;

const Cards = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  margin-top: 10.6rem;
`;

const Card = styled.div`
  width: 46rem;
  height: 34.8rem;
  border: 0.1rem solid ${props => props.theme.colors.primary};
  border-radius: 0.5rem;
  text-align: center;
  padding: 3rem;
  opacity: ${props => props.active ? 1 : 0.5};
  animation: ${props => props.active ? fadeIn : 'none'} 0.5s ease;
  transition: opacity 0.3s;

  @media (max-width: 768px) {
    width: 90%;
    max-width: 40rem;
    height: auto;
  }
`;

const Quote = styled.p`
  font-size: ${props => props.wide ? '2.2rem' : '2rem'};
  line-height: 2.64rem;
  margin: 3.5rem auto;
  width: ${props => props.wide ? '34.4rem' : '36.2rem'};
`;

const Dots = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.6rem;
  margin-top: 3rem;
`;

const Dot = styled.div`
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: ${props => props.active ? props.theme.colors.primary : 'rgba(34,34,34,0.4)'};
  cursor: pointer;
`;

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => setTestimonials(testimonialsData), []);

  return (
    <Section>
      <Title>
        <span style={{fontWeight: 'bold'}}>what</span>{' '}
        <span style={{fontSize: '4.2rem', fontWeight: 300}}>they</span>{' '}
        <span style={{fontWeight: 'bold'}}>think</span>
      </Title>
      <Controls>
        <ControlBtn onClick={() => setActiveIndex(i => (i - 1 + testimonials.length) % testimonials.length)}>
          Previous
        </ControlBtn>
        <ControlBtn onClick={() => setActiveIndex(i => (i + 1) % testimonials.length)}>
          Next
        </ControlBtn>
      </Controls>
      <Cards>
        {testimonials.map((t, i) => (
          <Card key={t.id} active={i === activeIndex}>
            <Quote wide={t.name === 'Matthew Webster'}>{t.quote}</Quote>
            <img src={require(`../../../images/${t.img}`)} alt={t.name} style={{width: '8rem'}} />
            <p style={{textTransform: 'uppercase', marginTop: '1.2rem'}}>{t.name}</p>
            <p>{t.status}</p>
          </Card>
        ))}
      </Cards>
      <Dots>
        {testimonials.map((_, i) => (
          <Dot key={i} active={i === activeIndex} onClick={() => setActiveIndex(i)} />
        ))}
      </Dots>
    </Section>
  );
};

export default TestimonialsSection;