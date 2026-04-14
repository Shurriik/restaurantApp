import api from './api';
import { RestaurantTable } from '../types';

export const adminTablesService = {
    getAllTables: async (): Promise<RestaurantTable[]> => {
        const response = await api.get('/admin/tables');
        return response.data;
    }
};

export const adminService = {
    getAllTables: adminTablesService.getAllTables,
};