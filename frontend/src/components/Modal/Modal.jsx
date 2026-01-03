const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        {children}
        <button onClick={onClose} style={{ marginTop: '20px', background: '#95a5a6' }}>
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default Modal;