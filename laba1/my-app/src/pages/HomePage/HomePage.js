import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import worksData from '../../data/works.json';
import roby from '../../images/roby.png';
import man from '../../images/man.png';
import partnersImage from '../../images/partners.png';
import websiteImage from '../../images/website.png';
import phoneImage from '../../images/phone.png';
import './HomePage.css';

const HomePage = () => {
  // Hero Component
  const Hero = () => (
    <div className="hero">
      <div className="roby">
        <img src={roby} alt="roby" className="name" />
      </div>
      <div className="moto">
        <img src={man} alt="Мужик" className="man" />
        <div>
          <h1>
            <span className="x1">“</span>
            <span className="bold">WE BELIEVE THAT<br /></span>
            <span className="regular">THE POWER OF DESIGN<br /></span>
            <span className="bold">HELPS <br />BUSINESSES</span>
            <span className="x2">.”</span>
          </h1>
          <div className="circle-container">
            <button className="circle">
              WORK<br />WITH US
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Partners Component
  const Partners = () => (
    <div className="partners">
      <p>
        <span>We partner with</span>
        <span className="style1">forward-thinking</span>
        <span>startups.</span>
      </p>
      <div className="icons">
        <img src={partnersImage} alt="partners" className="partners-icons" />
      </div>
    </div>
  );

  // WorkSection Component
  const WorkSection = () => {
    const [works, setWorks] = useState([]);
    const [selectedWork, setSelectedWork] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [newWork, setNewWork] = useState({ title: '', desc: '' });

    useEffect(() => {
      setWorks(worksData);
    }, []);

    const handleSelect = (id) => {
      setSelectedItems((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    };

    const handleAdd = () => {
      if (newWork.title && newWork.desc) {
        setWorks((prev) => [
          ...prev,
          { id: prev.length + 1, img: 'placeholder.png', ...newWork },
        ]);
        setNewWork({ title: '', desc: '' });
      }
    };

    const handleDelete = (id) => {
      setWorks((prev) => prev.filter((work) => work.id !== id));
    };

    const handleEdit = (id, updatedWork) => {
      setWorks((prev) =>
        prev.map((work) => (work.id === id ? { ...work, ...updatedWork } : work))
      );
    };

    return (
      <section className="work">
        <h2>
          <span className="bold">selected</span>
          <span className="regular3">work</span>
        </h2>
        <div className="work-images">
          <div className="left-part">
            {works.slice(0, Math.ceil(works.length / 2)).map((work) => (
              <div
                key={work.id}
                className={selectedItems.includes(work.id) ? 'selected' : ''}
                onClick={() => handleSelect(work.id)}
              >
                <img
                  src={require(`../../images/${work.img}`)}
                  alt={work.title}
                  onError={(e) => (e.target.src = require('../../images/placeholder.png'))}
                />
                <h4>{work.title}</h4>
                <p>{work.desc}</p>
                <button onClick={() => setSelectedWork(work)}>View Details</button>
                <button onClick={() => handleDelete(work.id)}>Delete</button>
              </div>
            ))}
          </div>
          <div className="right-part">
            {works.slice(Math.ceil(works.length / 2)).map((work) => (
              <div
                key={work.id}
                className={selectedItems.includes(work.id) ? 'selected' : ''}
                onClick={() => handleSelect(work.id)}
              >
                <img
                  src={require(`../../images/${work.img}`)}
                  alt={work.title}
                  onError={(e) => (e.target.src = require('../../images/placeholder.png'))}
                />
                <h4>{work.title}</h4>
                <p>{work.desc}</p>
                <button onClick={() => setSelectedWork(work)}>View Details</button>
                <button onClick={() => handleDelete(work.id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
        <div className="add-work">
          <input
            type="text"
            placeholder="Title"
            value={newWork.title}
            onChange={(e) => setNewWork({ ...newWork, title: e.target.value })}
          />
          <input
            type="text"
            placeholder="Description"
            value={newWork.desc}
            onChange={(e) => setNewWork({ ...newWork, desc: e.target.value })}
          />
          <button onClick={handleAdd}>Add Work</button>
        </div>
        {selectedWork && (
          <Modal
            content={selectedWork}
            onClose={() => setSelectedWork(null)}
            onEdit={handleEdit}
          />
        )}
      </section>
    );
  };

  // WebSection Component
  const WebSection = () => (
    <section className="web">
      <div className="web-content">
        <h2>
          <span className="bold2">Improve</span>
          <span className="regular4">your</span>
          <span className="regular4">brand</span>
          <span className="bold2">with an awesome site.</span>
        </h2>
        <h4>
          <span>Comprehensive</span>
          <span className="regular5">brand</span>
        </h4>
        <p className="regular9">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          varius enim in eros.
        </p>
        <h4>
          <span>Web</span>
          <span className="regular5">Presence</span>
        </h4>
        <p className="regular9">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          varius enim in eros.
        </p>
      </div>
      <img src={websiteImage} alt="Website" className="pc" />
      <div className="phone-div">
        <img src={phoneImage} alt="Phone" className="phone" />
      </div>
    </section>
  );

  return (
    <div>
      <Hero />
      <Partners />
      <WorkSection />
      <WebSection />
    </div>
  );
};

export default HomePage;