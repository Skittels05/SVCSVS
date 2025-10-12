import React, { useState } from 'react';
import './Modal.css';

const Modal = ({ content, onClose, onEdit }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState({ ...content });

  const handleSave = () => {
    onEdit(content.id, editedContent);
    setEditMode(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>X</button>
        {editMode ? (
          <div>
            <input
              type="text"
              value={editedContent.title}
              onChange={(e) => setEditedContent({ ...editedContent, title: e.target.value })}
            />
            <input
              type="text"
              value={editedContent.desc || editedContent.description}
              onChange={(e) =>
                setEditedContent({
                  ...editedContent,
                  [content.desc ? 'desc' : 'description']: e.target.value,
                })
              }
            />
            {content.category && (
              <input
                type="text"
                value={editedContent.category}
                onChange={(e) => setEditedContent({ ...editedContent, category: e.target.value })}
              />
            )}
            {content.date && (
              <input
                type="text"
                value={editedContent.date}
                onChange={(e) => setEditedContent({ ...editedContent, date: e.target.value })}
              />
            )}
            <button onClick={handleSave}>Save</button>
          </div>
        ) : (
          <div>
            <h3>{content.title}</h3>
            <p>{content.desc || content.description}</p>
            {content.category && <p>Category: {content.category}</p>}
            {content.date && <p>Date: {content.date}</p>}
            <button onClick={() => setEditMode(true)}>Edit</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;