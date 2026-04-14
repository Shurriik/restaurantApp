import api from './api.ts';
import { MenuItem, MenuItemRequest, Tag } from '../types';

export const menuService = {
    getAllMenuItems: async (): Promise<MenuItem[]> => {
        const response = await api.get('/menu');
        return response.data;
    },

    createMenuItem: async (request: MenuItemRequest): Promise<MenuItem> => {
        const response = await api.post('/menu', request);
        return response.data;
    },

    updateMenuItem: async (id: number, request: MenuItemRequest): Promise<MenuItem> => {
        const response = await api.put(`/menu/${id}`, request);
        return response.data;
    },

    deleteMenuItem: async (id: number): Promise<void> => {
        await api.delete(`/menu/${id}`);
    },

    getAllTags: async (): Promise<Tag[]> => {
        const response = await api.get('/tags');
        return response.data;
    },

    uploadImage: async (file: File): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};