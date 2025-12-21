import React from 'react';
import styled from 'styled-components';

const Section = styled.section`
  margin-top: 13rem;
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.background};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 11.5rem 12rem 0;

  @media (max-width: 560px) {
    flex-wrap: wrap;
    justify-content: center;
    padding: 8rem 3rem 5rem;
    text-align: center;
  }
`;

const TextBlock = styled.div`
  max-width: 60rem;

  h2 {
    text-transform: uppercase;
  }

  p {
    margin-top: 2.6rem;
    font-size: 2.1rem;
    line-height: 2.52rem;
    margin-bottom: 9.3rem;
  }
`;

const Bold = styled.span`
  font-weight: bold;
  font-size: 9.4rem;
`;

const Regular = styled.span`
  font-weight: normal;
  font-size: 6.6rem;
  letter-spacing: 1px;
  margin-left: 2.6rem;
  position: relative;
  top: -0.5rem;
`;

const DesignerButton = styled.button`
  width: 14rem;
  height: 14rem;
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.primary};
  border: none;
  border-radius: 50%;
  font-size: 1.4rem;
  text-transform: uppercase;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  line-height: 2rem;
  letter-spacing: 0.1rem;
  cursor: pointer;
  margin-right: -0.7rem;
  margin-top: -0.5rem;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.5;
  }
`;

const ContactSection = () => {
  return (
    <Section>
      <TextBlock>
        <h2>
          <Bold>let's</Bold> <Regular>talk</Regular>
        </h2>
        <p>Feel free to contact us</p>
      </TextBlock>
      <DesignerButton>
        view on <br />designer
      </DesignerButton>
    </Section>
  );
};

export default ContactSection;