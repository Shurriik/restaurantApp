import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
    TableCellsIcon,
    CalendarIcon,
    ClipboardDocumentListIcon,
    ShoppingCartIcon,
    ArrowTrendingUpIcon,
    SparklesIcon,
    FireIcon,
    TrophyIcon
} from '@heroicons/react/24/outline';
import { tableService } from '../../services/tableService';
import { bookingService } from '../../services/bookingService';
import { menuService } from '../../services/menuService';
import { Booking, MenuItem, RestaurantTable } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';

const UserDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const { data: tables, isLoading: tablesLoading } = useQuery<RestaurantTable[]>({
        queryKey: ['tables'],
        queryFn: tableService.getAll,
    });

    const { data: allBookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
        queryKey: ['bookings'],
        queryFn: bookingService.getAll,
    });

    const { data: menu, isLoading: menuLoading } = useQuery<MenuItem[]>({
        queryKey: ['menu'],
        queryFn: menuService.getAllMenuItems,
    });

    if (tablesLoading || bookingsLoading || menuLoading) {
        return <LoadingSpinner />;
    }

    const userBookings = allBookings?.filter(booking =>
        booking.customer.phone === user?.phone ||
        booking.customer.email === user?.email
    ) || [];

    const availableTables = tables?.filter((t: RestaurantTable) => t.available).length || 0;
    const myBookingsCount = userBookings.length;
    const popularItems = menu?.slice(0, 4) || [];

    const stats = [
        {
            label: 'Свободных столиков',
            value: availableTables,
            icon: TableCellsIcon,
            color: 'from-green-400 to-green-600',
            iconColor: 'text-green-600',
            onClick: () => navigate('/user/tables'),
            delay: 0.1
        },
        {
            label: 'Мои бронирования',
            value: myBookingsCount,
            icon: CalendarIcon,
            color: 'from-blue-400 to-blue-600',
            iconColor: 'text-blue-600',
            onClick: () => navigate('/user/bookings'),
            delay: 0.2
        },
        {
            label: 'Блюд в меню',
            value: menu?.length || 0,
            icon: ClipboardDocumentListIcon,
            color: 'from-purple-400 to-purple-600',
            iconColor: 'text-purple-600',
            onClick: () => navigate('/user/menu'),
            delay: 0.3
        },
        {
            label: 'Заказов',
            value: 0,
            icon: ShoppingCartIcon,
            color: 'from-orange-400 to-orange-600',
            iconColor: 'text-orange-600',
            onClick: () => navigate('/user/orders'),
            delay: 0.4
        },
    ];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Доброе утро';
        if (hour < 18) return 'Добрый день';
        return 'Добрый вечер';
    };

    return (
        <div className="space-y-6">
            {}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 rounded-2xl p-8 text-white shadow-2xl"
            >
                {}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse-slow" />
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse-slow delay-1000" />
                </div>

                <div className="relative z-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="inline-block"
                    >
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm animate-float">
                            <span className="text-3xl">🍽️</span>
                        </div>
                    </motion.div>
                    <motion.h1
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-bold mt-4"
                    >
                        {getGreeting()}, {user?.name || 'Гость'}!
                    </motion.h1>
                    <motion.p
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-primary-100 mt-2"
                    >
                        Рады видеть вас в нашем ресторане. Выберите свободный столик и забронируйте его прямо сейчас.
                    </motion.p>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-4 flex gap-3"
                    >
                        <button
                            onClick={() => navigate('/user/tables')}
                            className="bg-white text-primary-600 px-6 py-2 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
                        >
                            Забронировать столик
                        </button>
                        <button
                            onClick={() => navigate('/user/menu')}
                            className="bg-primary-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-primary-700 transition-all transform hover:scale-105"
                        >
                            Смотреть меню
                        </button>
                    </motion.div>
                </div>
            </motion.div>

            {}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: stat.delay }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        onClick={stat.onClick}
                        className="relative overflow-hidden bg-white rounded-2xl shadow-lg p-6 cursor-pointer group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full -mr-16 -mt-16 opacity-50" />
                        <div className="relative">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">{stat.label}</p>
                                    <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                                </div>
                                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <motion.div
                                className="mt-3 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ delay: stat.delay + 0.5, duration: 0.8 }}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 cursor-pointer shadow-lg"
                    onClick={() => navigate('/user/tables')}
                >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 animate-pulse-slow" />
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center animate-float">
                                <SparklesIcon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Быстрое бронирование</h3>
                        </div>
                        <p className="text-blue-100 mb-4">Забронируйте столик за 30 секунд</p>
                        <motion.button
                            whileHover={{ x: 5 }}
                            className="text-white font-semibold text-sm flex items-center gap-1"
                        >
                            Забронировать →
                        </motion.button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.02 }}
                    className="relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 cursor-pointer shadow-lg"
                    onClick={() => navigate('/user/bookings')}
                >
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-20 -mb-20 animate-pulse-slow" />
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center animate-bounce">
                                <FireIcon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Мои бронирования</h3>
                        </div>
                        <p className="text-purple-100 mb-4">Управление и отслеживание</p>
                        <motion.button
                            whileHover={{ x: 5 }}
                            className="text-white font-semibold text-sm flex items-center gap-1"
                        >
                            Перейти →
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            {}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="bg-white rounded-2xl shadow-lg p-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <TrophyIcon className="w-6 h-6 text-yellow-500" />
                            Популярные блюда
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">Самое популярное в этом месяце</p>
                    </div>
                    <button
                        onClick={() => navigate('/user/menu')}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1 group"
                    >
                        Смотреть все
                        <ArrowTrendingUpIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {popularItems.map((item: MenuItem, idx: number) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8 + idx * 0.1 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 cursor-pointer transition-all"
                            onClick={() => navigate('/user/menu')}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                <span className="text-primary-600 font-bold">{item.price} ₽</span>
                            </div>
                            {item.tags && item.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {item.tags.slice(0, 3).map((tag) => (
                                        <span key={tag.id} className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                      {tag.name}
                    </span>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default UserDashboard;