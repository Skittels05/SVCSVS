import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Container, Card, Title } from '../../../components/ui';
import factsData from '../../../data/facts.json';

const FactsWrapper = styled.section`
  margin-top: 11.5rem;
  text-align: center;
`;

const FactsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(25rem, 1fr));
  gap: 3rem;
  margin: 6rem 20% 0;

  @media (max-width: 768px) {
    margin: 4rem 5%;
  }
`;

const FactCard = styled(Card)`
  padding: 2rem;
  background-color: ${props => props.$selected ? props.theme.colors.factSelected : 'transparent'};
  cursor: pointer;
`;

const FactIcon = styled.img`
  width: 6rem;
  margin-bottom: 1rem;
`;

const Digit = styled.span`
  display: block;
  font-size: ${props => props.$large ? '5.3rem' : '4.3rem'};
  font-weight: bold;
`;

const FactText = styled.span`
  display: block;
  font-size: 1.9rem;
`;

const FunBold = styled.span`
  font-size: 4.8rem;
  font-weight: bold;
`;

const FactsRegular = styled.span`
  font-size: 3.7rem;
`;

const FactsSection = () => {
  const [facts, setFacts] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => setFacts(factsData), []);

  const toggle = (id) => setSelected(prev => 
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  return (
    <Container>
      <FactsWrapper>
        <Title>
          <FunBold>fun</FunBold>{' '}
          <FactsRegular>facts</FactsRegular>
        </Title>
        <FactsGrid>
          {facts.map(fact => (
            <FactCard
              key={fact.id}
              $selected={selected.includes(fact.id)}
              onClick={() => toggle(fact.id)}
            >
              {fact.img && <FactIcon src={require(`../../../images/${fact.img}`)} alt="" />}
              <p>
                <Digit $large={fact.digit.length <= 2}>{fact.digit}</Digit>
                <FactText>{fact.text}</FactText>
              </p>
            </FactCard>
          ))}
        </FactsGrid>
      </FactsWrapper>
    </Container>
  );
};

export default FactsSection;