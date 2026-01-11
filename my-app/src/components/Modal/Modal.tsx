import React, { useState } from 'react';
import './Modal.css';
import { Post } from '../../types/post';

interface ModalProps {
  content: Post;
  onClose: () => void;
  onEdit: (id: number, updated: Partial<Post>) => void;
}

const Modal: React.FC<ModalProps> = ({ content, onClose, onEdit }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState<Post>({ ...content });

  const handleSave = () => {
    onEdit(content.id, editedContent);
    setEditMode(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          X
        </button>

        {editMode ? (
          <div>
            <input
              type="text"
              value={editedContent.title}
              onChange={(e) =>
                setEditedContent({ ...editedContent, title: e.target.value })
              }
            />

            <input
              type="text"
              value={editedContent.description}
              onChange={(e) =>
                setEditedContent({
                  ...editedContent,
                  description: e.target.value,
                })
              }
            />

            {editedContent.category !== undefined && (
              <input
                type="text"
                value={editedContent.category}
                onChange={(e) =>
                  setEditedContent({
                    ...editedContent,
                    category: e.target.value,
                  })
                }
              />
            )}

            {editedContent.date !== undefined && (
              <input
                type="text"
                value={editedContent.date}
                onChange={(e) =>
                  setEditedContent({
                    ...editedContent,
                    date: e.target.value,
                  })
                }
              />
            )}

            <button onClick={handleSave}>Сохранить</button>
          </div>
        ) : (
          <div>
            <h3>{content.title}</h3>
            <p>{content.description}</p>
            {content.category && <p>Категория: {content.category}</p>}
            {content.date && <p>Дата: {content.date}</p>}
            <button onClick={() => setEditMode(true)}>Редактировать</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;