import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import teamImage from '../../../images/team.png';
import skillsData from '../../../data/skills.json';

const Section = styled.section`
  display: flex;
  margin-top: 10.5rem;
  max-width: 100vw;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SkillsBlock = styled.div`
  width: 50vw;
  background-color: #020a0c;
  text-align: center;
  padding-bottom: 10rem;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const TeamImg = styled.img`
  width: 50vw;
  height: 60rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Graphic = styled.div`
  width: 42.3rem;
  margin: 0 auto;

  @media (max-width: 768px) {
    width: 80vw;
  }
`;

const SkillItem = styled.div``;

const SkillText = styled.div`
  display: flex;
  justify-content: space-between;
  text-transform: uppercase;
  color: white;
  font-size: 1.5rem;
`;

const Bar = styled.hr`
  height: 1px;
  border: none;
  background-color: white;
  width: ${props => props.width};
  margin: 1rem 0 3rem;
`;

const SkillsSection = () => {
  const [skills, setSkills] = useState([]);
  useEffect(() => setSkills(skillsData), []);

  return (
    <Section>
      <SkillsBlock>
        <h2 style={{color: 'white', fontSize: '6rem', marginTop: '9rem'}}>
          our <span style={{fontSize: '4.2rem', fontWeight: 'normal'}}>team</span> skills
        </h2>
        <Graphic>
          {skills.map(skill => (
            <SkillItem key={skill.id}>
              <SkillText>
                <span>{skill.name}</span>
                <span>{skill.percentage}%</span>
              </SkillText>
              <Bar width={`${skill.percentage}%`} className={skill.className} />
            </SkillItem>
          ))}
          <p style={{color: 'white', marginTop: '2rem'}}>* Over 8 years creating templates on Marketplace.</p>
        </Graphic>
      </SkillsBlock>
      <TeamImg src={teamImage} alt="team" />
    </Section>
  );
};

export default SkillsSection;