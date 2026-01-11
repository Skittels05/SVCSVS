import React, { useState, useEffect } from 'react';
import teamImage from '../../../images/team.png';
import skillsData from '../../../data/skills.json';
import './SkillsSection.css';

interface Skill {
  id: number | string;
  name: string;
  percentage: number;
  className?: string;
}

const SkillsSection: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedItems, setSelectedItems] = useState<Array<number | string>>([]);

  useEffect(() => {
    // предполагаем, что skillsData имеет правильную структуру
    setSkills(skillsData as Skill[]);
  }, []);

  const handleSelect = (id: number | string) => {
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

      <img src={teamImage} alt="Команда" />
    </section>
  );
};

export default SkillsSection;