import './SkillsSection.css';
import teamImage from '../images/team.png';

function SkillsSection() {
  const skills = [
    { name: 'graphic design', percentage: 80, className: 'design' },
    { name: 'lead generation', percentage: 41, className: 'lead' },
    { name: 'photoshop', percentage: 70, className: 'photoshop' },
    { name: 'illustration', percentage: 100, className: 'illustration' },
  ];

  return (
    <section className="team_skills">
      <div className="skills-block">
        <h2>
          <span>our</span>
          <span className="regular7">team</span>
          <span>skills</span>
        </h2>
        <div className="graphic">
          {skills.map((skill, index) => (
            <div key={index} className="skill-item">
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
}

export default SkillsSection;