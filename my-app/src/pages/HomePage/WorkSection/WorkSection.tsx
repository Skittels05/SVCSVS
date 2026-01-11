import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal/Modal';
import worksData from '../../../data/works.json';
import './WorkSection.css';
import {Work} from '../../../types/work'

const WorkSection: React.FC = () => {
  const [works, setWorks] = useState<Work[]>([]);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [newWork, setNewWork] = useState<{
    title: string;
    desc: string;
  }>({
    title: '',
    desc: '',
  });

  useEffect(() => {
    setWorks(worksData as Work[]);
  }, []);

  const handleSelect = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    if (newWork.title && newWork.desc) {
      const newId = works.length > 0
        ? Math.max(...works.map(w => w.id)) + 1
        : 1;

      setWorks((prev) => [
        ...prev,
        {
          id: newId,
          ...newWork,
          img: 'placeholder.png',
        },
      ]);

      setNewWork({ title: '', desc: '' });
    }
  };

  const handleDelete = (id: number) => {
    setWorks((prev) => prev.filter((work) => work.id !== id));
  };

  const handleEdit = (id: number, updatedWork: Partial<Work>) => {
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
                src={require(`../../../images/${work.img}`)}
                alt={work.title}
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
                src={require(`../../../images/${work.img}`)}
                alt={work.title}
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

export default WorkSection;