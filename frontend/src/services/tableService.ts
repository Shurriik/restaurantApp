import api from './api.ts';
import { RestaurantTable, TableRequest, TableLocation } from '../types';

export const tableService = {
    getAll: async (): Promise<RestaurantTable[]> => {
        const response = await api.get('/user/tables');
        return response.data;
    },

    getById: async (id: number): Promise<RestaurantTable> => {
        const response = await api.get(`/user/tables/${id}`);
        return response.data;
    },

    create: async (request: TableRequest): Promise<RestaurantTable> => {
        const response = await api.post('/admin/tables', request);
        return response.data;
    },

    update: async (id: number, request: TableRequest): Promise<RestaurantTable> => {
        const response = await api.put(`/admin/tables/${id}`, request);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/tables/${id}`);
    },

    filter: async (params: {
        minCapacity?: number;
        location?: TableLocation;
        available?: boolean;
    }): Promise<RestaurantTable[]> => {
        const response = await api.get('/user/tables/filter', { params });
        return response.data;
    },
};