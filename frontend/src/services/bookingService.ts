import api from './api';
import { Booking, CompleteBookingRequest } from '../types';
import { tableService } from './tableService';

export const bookingService = {
    getAll: async (): Promise<Booking[]> => {
        const response = await api.get('/bookings');
        return response.data;
    },

    getById: async (id: number): Promise<Booking> => {
        const response = await api.get(`/bookings/${id}`);
        return response.data;
    },

    checkTableAvailability: async (tableId: number, startTime: string, endTime: string): Promise<boolean> => {
        const allBookings = await bookingService.getAll();

        const conflictingBooking = allBookings.find(booking =>
            booking.table.id === tableId &&
            ((new Date(booking.startTime) <= new Date(startTime) && new Date(booking.endTime) > new Date(startTime)) ||
                (new Date(booking.startTime) < new Date(endTime) && new Date(booking.endTime) >= new Date(endTime)) ||
                (new Date(booking.startTime) >= new Date(startTime) && new Date(booking.endTime) <= new Date(endTime)))
        );

        return !conflictingBooking;
    },

    create: async (request: CompleteBookingRequest): Promise<string> => {
        const isAvailable = await bookingService.checkTableAvailability(
            request.tableId,
            request.startTime,
            request.endTime
        );

        if (!isAvailable) {
            throw new Error('Столик на выбранное время уже забронирован. Пожалуйста, выберите другое время или другой столик.');
        }

        const response = await api.post('/bookings', request);

        if (request.tableId) {
            try {
                const table = await tableService.getById(request.tableId);
                if (table.available) {
                    await tableService.update(request.tableId, { ...table, available: false });
                }
            } catch (error) {
                console.error('Ошибка обновления статуса столика:', error);
            }
        }

        return response.data;
    },

    update: async (id: number, request: CompleteBookingRequest): Promise<Booking> => {
        const allBookings = await bookingService.getAll();
        const conflictingBooking = allBookings.find(booking =>
            booking.id !== id &&
            booking.table.id === request.tableId &&
            ((new Date(booking.startTime) <= new Date(request.startTime) && new Date(booking.endTime) > new Date(request.startTime)) ||
                (new Date(booking.startTime) < new Date(request.endTime) && new Date(booking.endTime) >= new Date(request.endTime)) ||
                (new Date(booking.startTime) >= new Date(request.startTime) && new Date(booking.endTime) <= new Date(request.endTime)))
        );

        if (conflictingBooking) {
            throw new Error('Столик на выбранное время уже забронирован. Пожалуйста, выберите другое время или другой столик.');
        }

        const response = await api.put(`/bookings/${id}`, request);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        let tableId: number | null = null;
        try {
            const booking = await bookingService.getById(id);
            tableId = booking.table?.id;
        } catch (error) {
            console.error('Ошибка получения информации о бронировании:', error);
        }

        await api.delete(`/bookings/${id}`);

        if (tableId) {
            try {
                const table = await tableService.getById(tableId);
                if (!table.available) {
                    await tableService.update(tableId, { ...table, available: true });
                }
            } catch (error) {
                console.error('Ошибка обновления статуса столика:', error);
            }
        }
    },

    cancel: async (id: number): Promise<void> => {
        let tableId: number | null = null;
        try {
            const booking = await bookingService.getById(id);
            tableId = booking.table?.id;
        } catch (error) {
            console.error('Ошибка получения информации о бронировании:', error);
        }

        await api.post(`/admin/bookings/${id}/cancel`);

        if (tableId) {
            try {
                const table = await tableService.getById(tableId);
                if (!table.available) {
                    await tableService.update(tableId, { ...table, available: true });
                }
            } catch (error) {
                console.error('Ошибка обновления статуса столика:', error);
            }
        }
    },
};
