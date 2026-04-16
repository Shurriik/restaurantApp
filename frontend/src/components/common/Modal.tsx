import React, { useEffect, useRef, useCallback } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'lg' }) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    useEffect(() => {
        const dialog = dialogRef.current;

        if (!dialog) {
            return;
        }

        if (isOpen && !dialog.open) {
            dialog.showModal();
            closeButtonRef.current?.focus();
        } else if (!isOpen && dialog.open) {
            dialog.close();
        }
    }, [isOpen]);

    useEffect(() => {
        const dialog = dialogRef.current;

        if (!dialog) {
            return;
        }

        dialog.addEventListener('close', handleClose);

        return () => {
            dialog.removeEventListener('close', handleClose);
        };
    }, [handleClose]);

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-6xl',
    };

    return (
        <dialog
            ref={dialogRef}
            className="modal-centered"
            aria-labelledby="modal-title"
            style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                margin: 0,
                padding: 0,
                backgroundColor: 'transparent',
                border: 'none',
                width: 'auto',
                maxWidth: '95vw',
                zIndex: 50
            }}
        >
            <div className={`${sizes[size]} w-full bg-white rounded-2xl shadow-2xl overflow-visible`}>
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <h2 id="modal-title" className="text-2xl font-bold text-gray-800">
                        {title}
                    </h2>
                    <button
                        ref={closeButtonRef}
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:rotate-90 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        aria-label="Close modal"
                        type="button"
                    >
                        <XMarkIcon className="w-6 h-6 text-gray-500" />
                    </button>
                </div>
                <div className="p-8 overflow-visible">
                    {children}
                </div>
            </div>
        </dialog>
    );
};

export default Modal;
