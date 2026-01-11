// src/components/Modal/Modal.tsx
import React, { useState } from 'react';
import './Modal.css';

// Базовый минимальный интерфейс, который должен быть у любого контента
interface BaseContent {
  id: number;
  title: string;
}

// Полный тип пропсов с generic
interface ModalProps<T extends BaseContent> {
  content: T;
  onClose: () => void;
  onEdit: (id: number, updated: Partial<T>) => void;
}

const Modal = <T extends BaseContent>({
  content,
  onClose,
  onEdit,
}: ModalProps<T>) => {
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState<T>({ ...content });

  const handleSave = () => {
    onEdit(content.id, editedContent);
    setEditMode(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        {editMode ? (
          <div className="edit-form">
            <label>
              Заголовок:
              <input
                type="text"
                value={editedContent.title}
                onChange={(e) =>
                  setEditedContent({
                    ...editedContent,
                    title: e.target.value,
                  } as T)
                }
              />
            </label>

            {/* Поле description (для Post) */}
            {'description' in editedContent && (
              <label>
                Описание:
                <input
                  type="text"
                  value={(editedContent as any).description || ''}
                  onChange={(e) =>
                    setEditedContent({
                      ...editedContent,
                      description: e.target.value,
                    } as T)
                  }
                />
              </label>
            )}

            {/* Поле desc (для Work) */}
            {'desc' in editedContent && (
              <label>
                Описание:
                <input
                  type="text"
                  value={(editedContent as any).desc || ''}
                  onChange={(e) =>
                    setEditedContent({
                      ...editedContent,
                      desc: e.target.value,
                    } as T)
                  }
                />
              </label>
            )}

            {/* Дополнительные поля, если они есть (например category/date) */}
            {'category' in editedContent && (
              <label>
                Категория:
                <input
                  type="text"
                  value={(editedContent as any).category || ''}
                  onChange={(e) =>
                    setEditedContent({
                      ...editedContent,
                      category: e.target.value,
                    } as T)
                  }
                />
              </label>
            )}

            {'date' in editedContent && (
              <label>
                Дата:
                <input
                  type="text"
                  value={(editedContent as any).date || ''}
                  onChange={(e) =>
                    setEditedContent({
                      ...editedContent,
                      date: e.target.value,
                    } as T)
                  }
                />
              </label>
            )}

            <div className="modal-buttons">
              <button onClick={handleSave}>Сохранить</button>
              <button onClick={() => setEditMode(false)}>Отмена</button>
            </div>
          </div>
        ) : (
          <div className="view-content">
            <h3>{content.title}</h3>

            {/* Отображение описания */}
            {'description' in content && <p>{(content as any).description}</p>}
            {'desc' in content && <p>{(content as any).desc}</p>}

            {/* Дополнительные поля */}
            {'category' in content && (
              <p>
                <strong>Категория:</strong> {(content as any).category}
              </p>
            )}
            {'date' in content && (
              <p>
                <strong>Дата:</strong> {(content as any).date}
              </p>
            )}

            <div className="modal-buttons">
              <button onClick={() => setEditMode(true)}>Редактировать</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;