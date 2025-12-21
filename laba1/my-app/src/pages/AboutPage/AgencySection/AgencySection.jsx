import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 140rem;
  margin: 0 auto;
  padding: 0 3rem;

  @media (max-width: 768px) {
    padding: 0 2rem;
  }
`;

const Section = styled.section`
  margin-top: 12.4rem;
  display: flex;
  justify-content: space-between;
  gap: 6rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 4rem;
  }
`;

const AgencyText = styled.div`
  flex: 1;
  min-width: 300px;
  max-width: 60rem;

  @media (max-width: 1024px) {
    margin-left: 0;
  }

  @media (max-width: 768px) {
    margin: 0;
  }

  h2 {
    line-height: 1.1;
    margin-bottom: 3rem;
  }

  p {
    font-size: 1.9rem;
    line-height: 2.4rem;
    margin-top: 2.9rem;

    &:first-of-type {
      margin-top: 0;
    }
  }
`;

const Bold = styled.span`
  display: block;
  font-size: 6rem;
  font-weight: bold;
  text-transform: uppercase;
`;

const Light = styled.span`
  display: block;
  font-size: 5.4rem;
  font-weight: 200;
  text-transform: uppercase;
`;

const Awards = styled.div`
  flex: 1;
  min-width: 300px;
  max-width: 50rem;

  @media (max-width: 1024px) {
    margin: 0;
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: none;
  }
`;

const AwardBlock = styled.div`
  margin-bottom: 6rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const AwardTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 2rem;
  text-transform: uppercase;
  margin-bottom: 1.9rem;
  font-weight: bold;
`;

const AwardList = styled.ul`
  list-style: none;
  font-size: 1.9rem;
`;

const AwardItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 0.8rem 0;

  &:not(:last-child) {
    border-bottom: 1px solid ${props => props.theme.colors.primary}20; /* лёгкая линия для разделения */
  }
`;

const AgencySection = () => {
  const awards = [
    {
      title: 'Awwards',
      items: [
        { text: 'Site of the Day', count: 3 },
        { text: 'Developer Award', count: 1 },
        { text: 'Honorable Mention', count: 7 },
        { text: 'Mobile Excellence', count: 3 },
      ],
    },
    {
      title: 'CSS Design Awards',
      items: [
        { text: 'UX Design Award', count: 10 },
        { text: 'UI Design Award', count: 4 },
        { text: 'Innovation Design Award', count: 7 },
        { text: 'Website of the Day', count: 13 },
      ],
    },
  ];

  return (
    <Container>
      <Section>
        <AgencyText>
          <h2>
            <Bold>THE PERFECT</Bold>
            <Light>AGENCY FOR YOUR BRAND</Light>
          </h2>
          <p>
            We love what we do and create partnerships with our clients to ensure
            their digital transformation is positioned for long-term success.
          </p>
          <p>
            We believe that the human dimensions essential to start any successful
            project and that this is where splendid emotional relationships between
            the company and people are born.
          </p>
        </AgencyText>

        <Awards>
          {awards.map((award, i) => (
            <AwardBlock key={i}>
              <AwardTitle>
                <h4>{award.title}</h4>
                <h4>{award.items.reduce((a, b) => a + b.count, 0)}</h4>
              </AwardTitle>
              <hr />
              <AwardList>
                {award.items.map((item, j) => (
                  <AwardItem key={j}>
                    <span>{item.text}</span>
                    <span>{item.count}</span>
                  </AwardItem>
                ))}
              </AwardList>
            </AwardBlock>
          ))}
        </Awards>
      </Section>
    </Container>
  );
};

export default AgencySection;