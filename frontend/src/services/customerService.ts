import api from './api';
import { Customer, CustomerRequest } from '../types';

const PHONE_PATTERNS = [
    /^\+375\s?\(?(29|33|44|25)\)?\s?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/,
    /^375\s?\(?(29|33|44|25)\)?\s?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/,
    /^8\(0(29|33|44|25)\)\s?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/,
    /^8\s?0(29|33|44|25)\s?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/,
];

export const validateBelarusPhone = (phone: string): boolean => {
    return PHONE_PATTERNS.some(pattern => pattern.test(phone));
};

export const formatBelarusPhone = (phone: string): string => {
    const cleaned = phone.replaceAll(/\D/g, '');

    if (cleaned.length === 12 && cleaned.startsWith('375')) {
        const code = cleaned.slice(3, 5);
        const first = cleaned.slice(5, 8);
        const second = cleaned.slice(8, 10);
        const third = cleaned.slice(10, 12);
        return `+375 (${code}) ${first}-${second}-${third}`;
    }

    if (cleaned.length === 11 && cleaned.startsWith('8')) {
        const code = cleaned.slice(1, 4);
        const first = cleaned.slice(4, 7);
        const second = cleaned.slice(7, 9);
        const third = cleaned.slice(9, 11);
        return `8 (0${code}) ${first}-${second}-${third}`;
    }

    return phone;
};

const validateAndFormatPhone = (phone: string): string => {
    if (!validateBelarusPhone(phone)) {
        throw new Error('Неверный формат белорусского номера телефона');
    }
    return formatBelarusPhone(phone);
};

export const customerService = {
    getAll: async (): Promise<Customer[]> => {
        try {
            const response = await api.get('/admin/customers');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch customers:', error);
            throw new Error('Ошибка при получении списка клиентов');
        }
    },

    create: async (request: CustomerRequest): Promise<Customer> => {
        try {
            const formattedPhone = validateAndFormatPhone(request.phone);
            const response = await api.post('/admin/customers', {
                ...request,
                phone: formattedPhone
            });
            return response.data;
        } catch (error) {
            console.error('Failed to create customer:', error);
            throw error;
        }
    },

    update: async (id: number, request: CustomerRequest): Promise<Customer> => {
        try {
            const formattedPhone = validateAndFormatPhone(request.phone);
            const response = await api.put(`/admin/customers/${id}`, {
                ...request,
                phone: formattedPhone
            });
            return response.data;
        } catch (error) {
            console.error(`Failed to update customer ${id}:`, error);
            throw error;
        }
    },

    delete: async (id: number): Promise<void> => {
        try {
            await api.delete(`/admin/customers/${id}`);
        } catch (error) {
            console.error(`Failed to delete customer ${id}:`, error);
            throw new Error('Ошибка при удалении клиента');
        }
    },
};
