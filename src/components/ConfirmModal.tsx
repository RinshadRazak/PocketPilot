import React from 'react';
import { Modal } from './Modal';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  dangerous?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  confirmLabel,
  onConfirm,
  onClose,
  dangerous = false,
}) => {
  return (
    <Modal title={title} onClose={onClose} narrow>
      <div className="confirm-body">
        <p>{message}</p>
        <div className="modal-actions">
          <button className="button button-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className={`button ${dangerous ? 'button-danger' : 'button-primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};
