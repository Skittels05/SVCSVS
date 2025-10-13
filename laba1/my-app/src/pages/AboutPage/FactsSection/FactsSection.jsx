import React, { useState, useEffect } from 'react';
import './FactsSection.css';
import factsData from '../../../data/facts.json';

const FactsSection = () => {
  const [facts, setFacts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    setFacts(factsData);
  }, []);

  const handleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section className="facts-section">
      <h2>
        <span className="bold3">fun</span>
        <span className="regular8">facts</span>
      </h2>
      <div className="facts">
        {facts.map((fact) => (
          <div
            key={fact.id}
            className={selectedItems.includes(fact.id) ? 'selected' : ''}
            onClick={() => handleSelect(fact.id)}
          >
            {fact.img && <img src={require(`../../../images/${fact.img}`)} alt="icon" />}
            <p className={fact.className || ''}>
              <span className={fact.digit.length > 2 ? 'digit2' : 'digit'}>
                {fact.digit}
              </span>
              <span className="regular9">{fact.text}</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FactsSection;