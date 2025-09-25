import React from 'react';
import './WorkSection.css';
import bikeImage from '../images/bike.png';
import ivorImage from '../images/ivor.png';
import moonImage from '../images/moon.png';
import bottleImage from '../images/bottle.png';
import whiteImage from '../images/white.png';
import blackImage from '../images/black.png';

class WorkSection extends React.Component {
  render() {
    const works = [
      { img: bikeImage, title: 'Conference', desc: 'Art Direction, Design' },
      { img: ivorImage, title: 'Ivor Application', desc: 'User Interface' },
      { img: moonImage, title: 'Flying to the moon', desc: 'User Experiences' },
      { img: bottleImage, title: 'Magazine', desc: 'Logo, User Interface' },
      { img: whiteImage, title: 'Black Apple Watch', desc: 'Logo, User Interface' },
      { img: blackImage, title: 'Dharma Webfont', desc: 'Branding, Web Design' },
    ];

    return (
      <section className="work">
        <h2>
          <span className="bold">selected</span>
          <span className="regular3">work</span>
        </h2>
        <div className="work-images">
          <div className="left-part">
            {works.slice(0, 3).map((work, index) => (
              <div key={index}>
                <img src={work.img} alt={work.title} />
                <h4>{work.title}</h4>
                <p>{work.desc}</p>
              </div>
            ))}
          </div>
          <div className="right-part">
            {works.slice(3).map((work, index) => (
              <div key={index}>
                <img src={work.img} alt={work.title} />
                <h4>{work.title}</h4>
                <p>{work.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
}

export default WorkSection;