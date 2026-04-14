import toast from 'react-hot-toast';

export const useToast = () => {
    const showSuccess = (message: string) => {
        toast.success(message, {
            duration: 3000,
            position: 'top-right',
            style: {
                background: '#10b981',
                color: '#fff',
                borderRadius: '12px',
                padding: '12px 20px',
            },
        });
    };

    const showError = (message: string) => {
        toast.error(message, {
            duration: 4000,
            position: 'top-right',
            style: {
                background: '#ef4444',
                color: '#fff',
                borderRadius: '12px',
                padding: '12px 20px',
            },
        });
    };

    return { showSuccess, showError };
};