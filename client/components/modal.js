import React from 'react';
import '../styles.css'

const Modal = ({ isOpen, onClose, children }) => {
  return (
    <>
      {isOpen && (
        <div onClick={onClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {children}
            <button className="modal-close-button w-full" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
