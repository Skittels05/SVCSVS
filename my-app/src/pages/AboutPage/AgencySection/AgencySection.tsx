import React from 'react';
import './AgencySection.css';

interface AwardItem {
  text: string;
  count: number;
}

interface Award {
  title: string;
  items: AwardItem[];
}

const awards: Award[] = [
  {
    title: 'Awwwards',
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

const AgencySection: React.FC = () => {
  return (
    <section className="section1">
      <div className="agency">
        <h2>
          <span className="bold">THE PERFECT<br /></span>
          <span className="regular2">AGENCY FOR YOUR BRAND</span>
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
      </div>

      <div className="awwards">
        {awards.map((award, index) => (
          <div key={index}>
            <div className="awwards-title">
              <h4>{award.title}</h4>
              <h4>{award.items.reduce((sum, item) => sum + item.count, 0)}</h4>
            </div>
            <hr />
            <ul>
              {award.items.map((item, i) => (
                <li key={i}>
                  <span>{item.text}</span>
                  <span>{item.count}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AgencySection;