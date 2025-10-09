import React, { useState, useEffect } from 'react';
import './WorkSection.css';
import Modal from './Modal';
import worksData from '../data/works.json';

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
        { id: prev.length + 1, ...newWork, img: 'placeholder.png' },
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
              <img src={require(`../images/${work.img}`)} alt={work.title} />
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
              <img src={require(`../images/${work.img}`)} alt={work.title} />
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

export default WorkSection;