import React, { useState } from 'react';
import './Modal.css';

// Определяем общий тип для содержимого (можно вынести в отдельный файл types.ts)
interface ContentItem {
  id: number;
  title: string;
  desc?: string;
  description?: string;
  category?: string;
  date?: string;
  [key: string]: any; // временно, потом лучше убрать
}

interface ModalProps {
  content: ContentItem;
  onClose: () => void;
  onEdit: (id: number, updated: Partial<ContentItem>) => void;
}

const Modal: React.FC<ModalProps> = ({ content, onClose, onEdit }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState<ContentItem>({ ...content });

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
              value={editedContent.desc ?? editedContent.description ?? ''}
              onChange={(e) =>
                setEditedContent({
                  ...editedContent,
                  desc: e.target.value,
                  description: e.target.value,
                })
              }
            />
            {content.category !== undefined && (
              <input
                type="text"
                value={editedContent.category ?? ''}
                onChange={(e) => setEditedContent({ ...editedContent, category: e.target.value })}
              />
            )}
            {content.date !== undefined && (
              <input
                type="text"
                value={editedContent.date ?? ''}
                onChange={(e) => setEditedContent({ ...editedContent, date: e.target.value })}
              />
            )}
            <button onClick={handleSave}>Save</button>
          </div>
        ) : (
          <div>
            <h3>{content.title}</h3>
            <p>{content.desc ?? content.description ?? ''}</p>
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