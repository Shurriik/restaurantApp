import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import {
    HomeIcon,
    CalendarIcon,
    TableCellsIcon,
    ClipboardDocumentListIcon,
    ShoppingCartIcon,
    UsersIcon,
    UserCircleIcon,
    ChartBarIcon,
    Bars3Icon,
    XMarkIcon,
    BellIcon,
    PowerIcon
} from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
    const { role, user, logout } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isLogoutHovered, setIsLogoutHovered] = useState(false);

    const userNavItems = [
        { path: '/user', label: 'Главная', icon: HomeIcon, color: 'from-blue-500 to-cyan-500' },
        { path: '/user/bookings', label: 'Бронирования', icon: CalendarIcon, color: 'from-emerald-500 to-teal-500' },
        { path: '/user/tables', label: 'Столики', icon: TableCellsIcon, color: 'from-purple-500 to-pink-500' },
        { path: '/user/menu', label: 'Меню', icon: ClipboardDocumentListIcon, color: 'from-orange-500 to-red-500' },
    ];

    const adminNavItems = [
        { path: '/admin', label: 'Центр управления', icon: ChartBarIcon, color: 'from-indigo-500 to-purple-500' },
        { path: '/admin/bookings', label: 'Бронирования', icon: CalendarIcon, color: 'from-emerald-500 to-teal-500' },
        { path: '/admin/tables', label: 'Столики', icon: TableCellsIcon, color: 'from-blue-500 to-cyan-500' },
        { path: '/admin/menu', label: 'Меню', icon: ClipboardDocumentListIcon, color: 'from-orange-500 to-red-500' },
        { path: '/admin/orders', label: 'Заказы', icon: ShoppingCartIcon, color: 'from-amber-500 to-yellow-500' },
        { path: '/admin/customers', label: 'Клиенты', icon: UsersIcon, color: 'from-purple-500 to-pink-500' },
    ];

    const navItems = role === 'admin' ? adminNavItems : userNavItems;

    const handleLogout = () => {
        authService.logout();
        logout();
        navigate('/login');
        setIsMobileMenuOpen(false);
    };

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    const menuItemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: (i: number) => ({
            opacity: 1,
            x: 0,
            transition: { delay: i * 0.05, type: 'spring', stiffness: 100 }
        }),
        hover: { scale: 1.05, y: -2, transition: { duration: 0.2, type: 'spring', stiffness: 400 } },
        tap: { scale: 0.95 }
    };

    const logoutButtonVariants = {
        initial: { scale: 1, rotate: 0 },
        hover: {
            scale: 1.05,
            rotate: [0, -5, 5, -5, 0],
            transition: { duration: 0.5, type: 'spring', stiffness: 400 }
        },
        tap: { scale: 0.95, rotate: 0 },
        animate: {
            boxShadow: [
                '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                '0 10px 15px -3px rgba(239, 68, 68, 0.3)',
                '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            ],
            transition: { duration: 1, repeat: Infinity }
        }
    };

    const mobileMenuVariants = {
        hidden: { opacity: 0, height: 0, transition: { duration: 0.3 } },
        visible: { opacity: 1, height: 'auto', transition: { duration: 0.3, staggerChildren: 0.05 } }
    };

    const notificationVariants = {
        hidden: { opacity: 0, scale: 0.8, y: -20 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 200 } },
        exit: { opacity: 0, scale: 0.8, y: -20, transition: { duration: 0.2 } }
    };

    return (
        <nav className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, type: 'spring' }}
                    >
                        <Link
                            to={role === 'admin' ? '/admin' : '/user'}
                            className="flex items-center space-x-3 group"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <motion.div
                                whileHover={{ rotate: 360, scale: 1.1 }}
                                transition={{ duration: 0.5 }}
                                className="w-10 h-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"
                            >
                                <span className="text-white text-xl animate-pulse-slow">🍽️</span>
                            </motion.div>
                            <div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Restaurant Booking
                </span>
                                {role === 'admin' && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.3, type: 'spring' }}
                                        className="ml-2 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full font-semibold"
                                    >
                                        ADMIN
                                    </motion.span>
                                )}
                            </div>
                        </Link>
                    </motion.div>

                    {}
                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map((item, i) => {
                            const active = isActive(item.path);
                            const Icon = item.icon;
                            return (
                                <motion.div
                                    key={item.path}
                                    custom={i}
                                    variants={menuItemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    <Link
                                        to={item.path}
                                        className={`relative px-4 py-2 rounded-xl transition-all duration-200 flex items-center space-x-2 ${
                                            active
                                                ? 'text-white bg-gradient-to-r ' + item.color
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                        }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                        {active && (
                                            <motion.div
                                                layoutId="activeNav"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-white to-white/50 rounded-full"
                                                transition={{ duration: 0.2 }}
                                            />
                                        )}
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>

                    {}
                    <div className="flex items-center space-x-3">
                        {}
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="relative"
                        >
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 15 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                            >
                                <BellIcon className="w-5 h-5 text-gray-600" />
                                <motion.span
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                                />
                            </motion.button>

                            <AnimatePresence>
                                {isNotificationsOpen && (
                                    <motion.div
                                        variants={notificationVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-100"
                                    >
                                        <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                                            <h3 className="font-semibold">Уведомления</h3>
                                        </div>
                                        <div className="p-3">
                                            <div className="text-center text-gray-500 py-4 text-sm">
                                                Нет новых уведомлений
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, type: 'spring' }}
                            className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl"
                        >
                            <motion.div
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.5 }}
                            >
                                <UserCircleIcon className="w-5 h-5 text-purple-600" />
                            </motion.div>
                            <div className="text-sm">
                                <p className="font-medium text-gray-700">{user?.name || 'Гость'}</p>
                                <p className="text-xs text-gray-500">{role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
                            </div>
                        </motion.div>

                        {}
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4, type: 'spring' }}
                            onMouseEnter={() => setIsLogoutHovered(true)}
                            onMouseLeave={() => setIsLogoutHovered(false)}
                        >
                            <motion.button
                                variants={logoutButtonVariants}
                                initial="initial"
                                whileHover="hover"
                                whileTap="tap"
                                animate="animate"
                                onClick={handleLogout}
                                className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold shadow-md overflow-hidden relative group"
                            >
                                {}
                                <motion.div
                                    animate={{
                                        x: isLogoutHovered ? '100%' : '-100%',
                                        opacity: isLogoutHovered ? 0.3 : 0
                                    }}
                                    transition={{ duration: 0.5 }}
                                    className="absolute inset-0 bg-gradient-to-r from-white to-transparent"
                                />
                                <motion.div
                                    animate={{ rotate: isLogoutHovered ? [0, 360] : 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <PowerIcon className="w-5 h-5" />
                                </motion.div>
                                <motion.span
                                    animate={{ x: isLogoutHovered ? 2 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    Выйти
                                </motion.span>
                            </motion.button>
                        </motion.div>

                        {}
                        <motion.button
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {isMobileMenuOpen ? (
                                <XMarkIcon className="w-6 h-6 text-gray-600" />
                            ) : (
                                <Bars3Icon className="w-6 h-6 text-gray-600" />
                            )}
                        </motion.button>
                    </div>
                </div>

                {}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            variants={mobileMenuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="md:hidden overflow-hidden"
                        >
                            <div className="py-4 border-t border-gray-100">
                                {}
                                <motion.div
                                    variants={menuItemVariants}
                                    custom={0}
                                    className="flex items-center space-x-3 px-3 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl mb-3"
                                >
                                    <UserCircleIcon className="w-10 h-10 text-purple-500" />
                                    <div>
                                        <p className="font-semibold text-gray-800">{user?.name || 'Гость'}</p>
                                        <p className="text-sm text-gray-500">{user?.email || ''}</p>
                                        <p className="text-xs text-gray-400">{role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
                                    </div>
                                </motion.div>

                                {}
                                {navItems.map((item, i) => {
                                    const active = isActive(item.path);
                                    const Icon = item.icon;
                                    return (
                                        <motion.div
                                            key={item.path}
                                            variants={menuItemVariants}
                                            custom={i + 1}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Link
                                                to={item.path}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                                                    active
                                                        ? `bg-gradient-to-r ${item.color} text-white`
                                                        : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span className="font-medium">{item.label}</span>
                                            </Link>
                                        </motion.div>
                                    );
                                })}

                                {}
                                <motion.button
                                    variants={menuItemVariants}
                                    custom={navItems.length + 1}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold mt-3"
                                >
                                    <PowerIcon className="w-5 h-5" />
                                    <span>Выйти</span>
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
};

export default Navbar;