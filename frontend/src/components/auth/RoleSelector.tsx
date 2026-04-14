import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import { UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const RoleSelector: React.FC = () => {
    const navigate = useNavigate();
    const { setRole } = useAuthStore();

    const selectRole = (role: 'user' | 'admin') => {
        setRole(role);
        navigate(role === 'admin' ? '/admin' : '/user');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl w-full"
            >
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="inline-block"
                    >
                        <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-2xl mx-auto">
                            <span className="text-5xl">🍽️</span>
                        </div>
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-bold mt-6 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                        Restaurant Booking System
                    </h1>
                    <p className="text-gray-600 mt-3 text-lg">Выберите режим работы</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectRole('user')}
                        className="cursor-pointer"
                    >
                        <div className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary-300">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <UserIcon className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Пользователь</h2>
                            <p className="text-gray-500">
                                Бронирование столиков<br />
                                Просмотр меню<br />
                                Оформление заказов
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectRole('admin')}
                        className="cursor-pointer"
                    >
                        <div className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary-300">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <ShieldCheckIcon className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Администратор</h2>
                            <p className="text-gray-500">
                                Полное управление системой<br />
                                Управление столиками и меню<br />
                                Управление клиентами
                            </p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default RoleSelector;