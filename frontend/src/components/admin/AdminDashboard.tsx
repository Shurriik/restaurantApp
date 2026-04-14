import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    TableCellsIcon,
    CalendarIcon,
    UsersIcon,
    ClipboardDocumentListIcon,
    CheckCircleIcon,
    XCircleIcon,
    PlusCircleIcon,
    ShoppingBagIcon,
    UserGroupIcon,
    ChartBarIcon,
    SparklesIcon,
    FireIcon,
    CurrencyDollarIcon,
    GiftIcon,
    RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import { adminService } from '../../services/adminService';
import { bookingService } from '../../services/bookingService';
import { customerService } from '../../services/customerService';
import { menuService } from '../../services/menuService';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();

    const { data: tables, isLoading: tablesLoading } = useQuery({
        queryKey: ['adminTables'],
        queryFn: adminService.getAllTables,
    });

    const { data: allBookings, isLoading: bookingsLoading } = useQuery({
        queryKey: ['adminBookings'],
        queryFn: bookingService.getAll,
    });

    const { data: customers, isLoading: customersLoading } = useQuery({
        queryKey: ['adminCustomers'],
        queryFn: customerService.getAll,
    });

    const { data: menu, isLoading: menuLoading } = useQuery({
        queryKey: ['adminMenu'],
        queryFn: menuService.getAllMenuItems,
    });

    if (tablesLoading || bookingsLoading || customersLoading || menuLoading) {
        return <LoadingSpinner />;
    }

    const bookings = allBookings || [];

    const availableTables = tables?.filter((t: any) => t.available).length || 0;
    const occupiedTables = (tables?.length || 0) - availableTables;
    const occupancyRate = tables?.length ? Math.round((occupiedTables / tables.length) * 100) : 0;

    const todayBookings = bookings.filter((b: any) =>
        new Date(b.startTime).toDateString() === new Date().toDateString()
    ).length || 0;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowBookings = bookings.filter((b: any) =>
        new Date(b.startTime).toDateString() === tomorrow.toDateString()
    ).length || 0;

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekBookings = bookings.filter((b: any) =>
        new Date(b.startTime) >= weekStart
    ).length || 0;

    const totalRevenue = bookings.reduce((sum: number, b: any) => sum + (b.numberOfGuests * 45), 0);
    const averageCheck = bookings.length ? Math.round(totalRevenue / bookings.length) : 0;

    const stats = [
        {
            label: 'Всего столиков',
            value: tables?.length || 0,
            icon: TableCellsIcon,
            color: 'from-blue-500 to-cyan-500',
            gradient: 'from-blue-600 to-cyan-600',
            subValue: `${availableTables} свободно, ${occupiedTables} занято`,
            path: '/admin/tables',
            delay: 0.1
        },
        {
            label: 'Всего бронирований',
            value: bookings.length,
            icon: CalendarIcon,
            color: 'from-emerald-500 to-teal-500',
            gradient: 'from-emerald-600 to-teal-600',
            subValue: `${todayBookings} бронирований сегодня`,
            path: '/admin/bookings',
            delay: 0.2
        },
        {
            label: 'Всего клиентов',
            value: customers?.length || 0,
            icon: UsersIcon,
            color: 'from-purple-500 to-pink-500',
            gradient: 'from-purple-600 to-pink-600',
            subValue: 'зарегистрировано',
            path: '/admin/customers',
            delay: 0.3
        },
        {
            label: 'Блюд в меню',
            value: menu?.length || 0,
            icon: ClipboardDocumentListIcon,
            color: 'from-orange-500 to-red-500',
            gradient: 'from-orange-600 to-red-600',
            subValue: 'в ассортименте',
            path: '/admin/menu',
            delay: 0.4
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
    };

    const statCardVariants = {
        hidden: { opacity: 0, y: 50, rotateX: -15 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            rotateX: 0,
            transition: { delay: i * 0.1, type: 'spring', stiffness: 100, damping: 15 }
        }),
        hover: { y: -10, scale: 1.02, transition: { duration: 0.2, type: 'spring', stiffness: 300 } }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8 relative"
        >
            {}
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
                className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl"
            >
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        animate={{ scale: [1, 1.5, 1], rotate: [0, 180, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{ scale: [1.5, 1, 1.5], rotate: [360, 180, 0] }}
                        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                        className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    />
                </div>

                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="inline-block"
                        >
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm animate-float">
                                <RocketLaunchIcon className="w-8 h-8 text-yellow-300" />
                            </div>
                        </motion.div>
                        <motion.h1
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl md:text-4xl font-bold mt-4"
                        >
                            Центр управления рестораном
                        </motion.h1>
                        <motion.p
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-purple-100 mt-2 text-lg"
                        >
                            Полный контроль над бизнесом в реальном времени
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="flex gap-3 mt-4 flex-wrap"
                        >
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1.5 rounded-full">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-sm">Система онлайн</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1.5 rounded-full">
                                <SparklesIcon className="w-4 h-4 text-yellow-300 animate-spin-slow" />
                                <span className="text-sm">AI аналитика</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1.5 rounded-full">
                                <GiftIcon className="w-4 h-4 text-pink-300" />
                                <span className="text-sm">Бонусная система</span>
                            </div>
                        </motion.div>
                    </div>
                    <motion.div
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                        className="hidden lg:block"
                    >
                        <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm animate-float">
                            <span className="text-6xl animate-pulse">👑</span>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {stats.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        custom={idx}
                        variants={statCardVariants}
                        whileHover="hover"
                        onClick={() => navigate(stat.path)}
                        className="relative cursor-pointer group"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />
                        <div className="relative bg-white rounded-2xl shadow-lg p-6 overflow-hidden group-hover:shadow-2xl transition-all duration-300">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full -mr-16 -mt-16 opacity-50" />
                            <div className="relative">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                                        <motion.p
                                            initial={{ scale: 0.5 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: idx * 0.1 + 0.3, type: 'spring' }}
                                            className="text-3xl font-bold text-gray-800 mt-2"
                                        >
                                            {stat.value}
                                        </motion.p>
                                        <p className="text-primary-600 text-xs mt-1">{stat.subValue}</p>
                                    </div>
                                    <motion.div
                                        whileHover={{ rotate: 360, scale: 1.1 }}
                                        transition={{ duration: 0.5 }}
                                        className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}
                                    >
                                        <stat.icon className="w-6 h-6 text-white" />
                                    </motion.div>
                                </div>
                                <motion.div
                                    className="mt-3 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ delay: idx * 0.1 + 0.5, duration: 0.8 }}
                                />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-100"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                            <ChartBarIcon className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Статус столиков</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircleIcon className="w-4 h-4 text-green-600" />
                                    </div>
                                    <span className="text-gray-700 font-medium">Свободные столики</span>
                                </div>
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.6, type: 'spring' }}
                                    className="text-2xl font-bold text-green-600"
                                >
                                    {availableTables}
                                </motion.span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <motion.div
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full h-3"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(availableTables / (tables?.length || 1)) * 100}%` }}
                                    transition={{ duration: 1, delay: 0.7 }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                        <XCircleIcon className="w-4 h-4 text-red-600" />
                                    </div>
                                    <span className="text-gray-700 font-medium">Занятые столики</span>
                                </div>
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.8, type: 'spring' }}
                                    className="text-2xl font-bold text-red-600"
                                >
                                    {occupiedTables}
                                </motion.span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <motion.div
                                    className="bg-gradient-to-r from-red-500 to-rose-500 rounded-full h-3"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(occupiedTables / (tables?.length || 1)) * 100}%` }}
                                    transition={{ duration: 1, delay: 0.9 }}
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-700 font-medium">Загрузка зала</span>
                                <motion.span
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="text-xl font-bold text-primary-600"
                                >
                                    {occupancyRate}%
                                </motion.span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <motion.div
                                    className="bg-gradient-to-r from-primary-500 to-purple-500 rounded-full h-3"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${occupancyRate}%` }}
                                    transition={{ duration: 1, delay: 1 }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-100"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                            <CalendarIcon className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Бронирования</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
                            <p className="text-sm text-gray-500">Сегодня</p>
                            <motion.p
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.6, type: 'spring' }}
                                className="text-3xl font-bold text-emerald-600 my-2"
                            >
                                {todayBookings}
                            </motion.p>
                            <p className="text-xs text-gray-400">бронирований</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                            <p className="text-sm text-gray-500">Завтра</p>
                            <motion.p
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.7, type: 'spring' }}
                                className="text-3xl font-bold text-blue-600 my-2"
                            >
                                {tomorrowBookings}
                            </motion.p>
                            <p className="text-xs text-gray-400">бронирований</p>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">На этой неделе</span>
                            <span className="text-xl font-bold text-primary-600">{weekBookings}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-gray-600">Общая выручка</span>
                            <span className="text-xl font-bold text-primary-600">{totalRevenue.toLocaleString()} BYN</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-gray-600">Средний чек</span>
                            <span className="text-lg font-semibold text-emerald-600">{averageCheck} BYN</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 text-center shadow-lg border border-orange-100"
                >
                    <div className="inline-block p-3 bg-orange-100 rounded-full mb-3">
                        <FireIcon className="w-8 h-8 text-orange-500" />
                    </div>
                    <p className="text-3xl font-bold text-orange-600">{todayBookings}</p>
                    <p className="text-sm text-gray-600">бронирований на сегодня</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 text-center shadow-lg border border-emerald-100"
                >
                    <div className="inline-block p-3 bg-emerald-100 rounded-full mb-3">
                        <CurrencyDollarIcon className="w-8 h-8 text-emerald-500" />
                    </div>
                    <p className="text-3xl font-bold text-emerald-600">{totalRevenue.toLocaleString()} BYN</p>
                    <p className="text-sm text-gray-600">общая выручка</p>
                    <div className="mt-1 text-xs text-emerald-500">средний чек: {averageCheck} BYN</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 text-center shadow-lg border border-purple-100"
                >
                    <div className="inline-block p-3 bg-purple-100 rounded-full mb-3">
                        <UsersIcon className="w-8 h-8 text-purple-500" />
                    </div>
                    <p className="text-3xl font-bold text-purple-600">{customers?.length || 0}</p>
                    <p className="text-sm text-gray-600">всего клиентов</p>
                    <div className="mt-1 text-xs text-purple-500">в базе данных</div>
                </motion.div>
            </div>

            {/* Быстрые действия */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                <motion.div
                    variants={statCardVariants}
                    custom={0}
                    whileHover={{ scale: 1.02, y: -5 }}
                    onClick={() => navigate('/admin/tables')}
                    className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 cursor-pointer shadow-lg group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                    <div className="relative flex items-center gap-4">
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"
                        >
                            <PlusCircleIcon className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Добавить столик</h3>
                            <p className="text-blue-100 text-sm">Расширьте зону обслуживания</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    variants={statCardVariants}
                    custom={1}
                    whileHover={{ scale: 1.02, y: -5 }}
                    onClick={() => navigate('/admin/menu')}
                    className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 cursor-pointer shadow-lg group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                    <div className="relative flex items-center gap-4">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"
                        >
                            <ShoppingBagIcon className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Добавить блюдо</h3>
                            <p className="text-orange-100 text-sm">Обновите меню ресторана</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    variants={statCardVariants}
                    custom={2}
                    whileHover={{ scale: 1.02, y: -5 }}
                    onClick={() => navigate('/admin/customers')}
                    className="relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 cursor-pointer shadow-lg group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                    <div className="relative flex items-center gap-4">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"
                        >
                            <UserGroupIcon className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Клиенты</h3>
                            <p className="text-green-100 text-sm">Управление клиентами</p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
      `}</style>
        </motion.div>
    );
};

export default AdminDashboard;