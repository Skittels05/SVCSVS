import React, { useState, useEffect } from 'react';
import './SkillsSection.css';
import teamImage from '../images/team.png';
import skillsData from '../data/skills.json';

const SkillsSection = () => {
  const [skills, setSkills] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    setSkills(skillsData);
  }, []);

  const handleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section className="team_skills">
      <div className="skills-block">
        <h2>
          <span>our</span>
          <span className="regular7">team</span>
          <span>skills</span>
        </h2>
        <div className="graphic">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className={`skill-item ${selectedItems.includes(skill.id) ? 'selected' : ''}`}
              onClick={() => handleSelect(skill.id)}
            >
              <div className="skill-text">
                <span>{skill.name}</span>
                <span>{skill.percentage}%</span>
              </div>
              <hr className={skill.className} />
            </div>
          ))}
          <p>* Over 8 years creating templates on Marketplace.</p>
        </div>
      </div>
      <img src={teamImage} alt="team" />
    </section>
  );
};

export default SkillsSection;