import api from './api';
import { Order, OrderStatus } from '../types';

const ORDERS_KEY = 'restaurant_orders';

const getLocalOrders = (): Order[] => {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
};

const saveLocalOrders = (orders: Order[]): void => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

export const orderService = {
    getAll: async (): Promise<Order[]> => {
        try {
            const response = await api.get('/orders');
            return response.data;
        } catch {
            return getLocalOrders();
        }
    },

    create: async (orderData: Partial<Order>): Promise<Order> => {
        if (!orderData.booking) {
            throw new Error('Booking information is required to create an order');
        }

        const newOrder: Order = {
            id: Date.now(),
            booking: orderData.booking,
            orderTime: new Date().toISOString(),
            status: OrderStatus.PENDING,
            totalAmount: orderData.totalAmount || 0,
            orderItems: orderData.orderItems || [],
            specialInstructions: orderData.specialInstructions,
            userId: orderData.userId,
        };

        try {
            const response = await api.post('/orders', newOrder);
            return response.data;
        } catch {
            const orders = getLocalOrders();
            orders.push(newOrder);
            saveLocalOrders(orders);
            return newOrder;
        }
    },
};