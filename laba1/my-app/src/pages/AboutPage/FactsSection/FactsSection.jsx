import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Container, Card } from '../../../components/ui';
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

const Digit = styled.span`
  font-size: ${props => props.$large ? '5.3rem' : '4.3rem'};
  font-weight: bold;
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
        <h2>
          <span style={{fontSize: '4.8rem', fontWeight: 'bold'}}>fun</span>{' '}
          <span style={{fontSize: '3.7rem'}}>facts</span>
        </h2>
        <FactsGrid>
          {facts.map(fact => (
            <FactCard
              key={fact.id}
              $selected={selected.includes(fact.id)}
              onClick={() => toggle(fact.id)}
            >
              {fact.img && <img src={require(`../../../images/${fact.img}`)} alt="" style={{width: '6rem'}} />}
              <p>
                <Digit $large={fact.digit.length <= 2}>{fact.digit}</Digit>
                <span style={{fontSize: '1.9rem', display: 'block'}}>{fact.text}</span>
              </p>
            </FactCard>
          ))}
        </FactsGrid>
      </FactsWrapper>
    </Container>
  );
};

export default FactsSection;