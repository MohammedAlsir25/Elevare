import { useEffect, useRef } from 'react';

export const useModal = (isOpen: boolean, onClose: () => void) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const modalNode = modalRef.current;
        if (!modalNode) return;
        
        const previousActiveElement = document.activeElement as HTMLElement;

        const focusableElements = modalNode.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }

            if (e.key === 'Tab') {
                if (e.shiftKey) { // Shift+Tab
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else { // Tab
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        // Focus the first element when the modal opens
        firstElement?.focus();

        modalNode.addEventListener('keydown', handleKeyDown);

        // Cleanup
        return () => {
            modalNode.removeEventListener('keydown', handleKeyDown);
            // Return focus to the element that opened the modal
            previousActiveElement?.focus();
        };
    }, [isOpen, onClose]);

    return modalRef;
};
