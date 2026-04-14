import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000,
        },
    },
});

const initAdmin = (): void => {
    const users = JSON.parse(localStorage.getItem('restaurant_users') || '[]');
    const adminExists = users.some((u: any) => u.email === 'admin@restaurant.com');

    if (!adminExists) {
        const adminUser = {
            id: 0,
            name: 'Администратор',
            email: 'admin@restaurant.com',
            phone: '+375 (29) 000-00-00',
            role: 'admin',
            createdAt: new Date().toISOString(),
        };
        users.push(adminUser);
        localStorage.setItem('restaurant_users', JSON.stringify(users));
        console.log('Администратор создан: admin@restaurant.com (любой пароль)');
    }
};

const initTestData = (): void => {
    const menuItems = JSON.parse(localStorage.getItem('menu_items') || '[]');

    if (menuItems.length === 0) {
        const testMenu = [
            { id: 1, name: 'Драники со сметаной', price: 12.5, tags: [], description: 'Хрустящие картофельные драники' },
            { id: 2, name: 'Грибной суп', price: 8.9, tags: [], description: 'Ароматный суп из лесных грибов' },
            { id: 3, name: 'Бефстроганов', price: 24.9, tags: [], description: 'Нежная говядина в сметанном соусе' },
            { id: 4, name: 'Борщ с пампушкой', price: 9.9, tags: [], description: 'Наваристый красный борщ' },
            { id: 5, name: 'Вареники с картошкой', price: 10.5, tags: [], description: 'Домашние вареники' },
        ];
        localStorage.setItem('menu_items', JSON.stringify(testMenu));
        console.log('Тестовые блюда добавлены');
    }
};

initAdmin();
initTestData();

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error('Root element with id "root" not found');
}

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                        borderRadius: '12px',
                        padding: '12px 20px',
                        fontSize: '14px',
                    },
                    success: {
                        style: {
                            background: '#10b981',
                        },
                        iconTheme: {
                            primary: '#fff',
                            secondary: '#10b981',
                        },
                    },
                    error: {
                        style: {
                            background: '#ef4444',
                        },
                    },
                    loading: {
                        style: {
                            background: '#3b82f6',
                        },
                    },
                }}
            />
            <App />
        </QueryClientProvider>
    </React.StrictMode>,
);