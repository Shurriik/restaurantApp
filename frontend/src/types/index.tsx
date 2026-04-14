export interface Customer {
    id: number;
    name: string;
    phone: string;
    email: string;
    bookings?: Booking[];
}

export interface RestaurantTable {
    id: number;
    number: number;
    capacity: number;
    location: TableLocation;
    available: boolean;
    bookings?: Booking[];
}

export interface Booking {
    id: number;
    startTime: string;
    endTime: string;
    numberOfGuests: number;
    status: BookingStatus;
    customer: Customer;
    table: RestaurantTable;
    orders?: Order[];
    userId?: number;
}

export interface Tag {
    id: number;
    name: string;
    menuItems?: MenuItem[];
}

export interface MenuItem {
    id: number;
    name: string;
    price: number;
    tags: Tag[];
    image?: string;
    description?: string;
}

export interface OrderItem {
    id: number;
    menuItem: MenuItem;
    quantity: number;
    totalPrice: number;
}

export interface Order {
    id: number;
    booking: Booking;
    orderTime: string;
    status: OrderStatus;
    totalAmount: number;
    orderItems: OrderItem[];
    specialInstructions?: string;
    userId?: number;
}

export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED',
    NO_SHOW = 'NO_SHOW'
}

export enum OrderStatus {
    PENDING = 'PENDING',
}

export enum TableLocation {
    MAIN_HALL = 'MAIN_HALL',
    TERRACE = 'TERRACE',
    VIP_ROOM = 'VIP_ROOM',
    PRIVATE_ROOM = 'PRIVATE_ROOM',
    WINDOW_SIDE = 'WINDOW_SIDE',
    BAR_COUNTER = 'BAR_COUNTER'
}

export interface CompleteBookingRequest {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    tableId: number;
    startTime: string;
    endTime: string;
    numberOfGuests: number;
    userId?: number;
}

export interface CustomerRequest {
    name: string;
    phone: string;
    email?: string;
}

export interface TableRequest {
    number: number;
    capacity: number;
    location: TableLocation;
    available: boolean;
}

export interface MenuItemRequest {
    name: string;
    price: number;
    tagIds?: number[];
    image?: string;
    description?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    phone: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: 'user' | 'admin';
    createdAt: string;
}
