import React, { useState } from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Content = styled.div`
  background: ${props => props.theme.colors.background};
  padding: 2rem;
  border-radius: 5px;
  width: 90%;
  max-width: 500px;
  position: relative;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
  color: ${props => props.theme.colors.primary};
`;

const Input = styled.input`
  display: block;
  width: 100%;
  margin: 0.5rem 0;
  padding: 0.5rem;
  font-size: 1.6rem;
`;

const ActionBtn = styled.button`
  margin: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 1.6rem;
  text-transform: uppercase;
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.background};
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.7;
  }
`;

const Modal = ({ content, onClose, onEdit }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState({ ...content });

  const handleSave = () => {
    onEdit(content.id, editedContent);
    setEditMode(false);
  };

  return (
    <Overlay onClick={onClose}>
      <Content onClick={e => e.stopPropagation()}>
        <CloseBtn onClick={onClose}>X</CloseBtn>

        {editMode ? (
          <>
            <Input
              type="text"
              value={editedContent.title}
              onChange={e => setEditedContent({ ...editedContent, title: e.target.value })}
            />
            <Input
              type="text"
              value={editedContent.desc || editedContent.description}
              onChange={e => setEditedContent({
                ...editedContent,
                [content.desc ? 'desc' : 'description']: e.target.value
              })}
            />
            {/* остальные поля аналогично */}
            <ActionBtn onClick={handleSave}>Save</ActionBtn>
          </>
        ) : (
          <>
            <h3>{content.title}</h3>
            <p>{content.desc || content.description}</p>
            {content.category && <p>Category: {content.category}</p>}
            {content.date && <p>Date: {content.date}</p>}
            <ActionBtn onClick={() => setEditMode(true)}>Edit</ActionBtn>
          </>
        )}
      </Content>
    </Overlay>
  );
};

export default Modal;