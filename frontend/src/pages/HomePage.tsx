import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
    SparklesIcon,
    TrophyIcon,
    StarIcon,
    FireIcon,
    HeartIcon,
    ArrowRightIcon,
    CheckBadgeIcon,
    UsersIcon,
    TableCellsIcon,
    CalendarIcon,
    ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const { role } = useAuthStore();
    const [activeSlide, setActiveSlide] = useState(0);
    const [floatingElements, setFloatingElements] = useState<Array<{ id: number; x: number; y: number; type: string }>>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setFloatingElements(prev => {
                const newElement = {
                    id: Date.now(),
                    x: Math.random() * window.innerWidth,
                    y: window.innerHeight + 50,
                    type: ['⭐', '🍽️', '✨', '🌟', '💫'][Math.floor(Math.random() * 5)]
                };
                return [...prev.slice(-30), newElement];
            });
        }, 500);
        return () => clearInterval(interval);
    }, []);

    const slides = [
        {
            id: 0,
            title: 'Добро пожаловать в Restaurant Booking',
            description: 'Лучшая система бронирования столиков для ресторанов и кафе',
            icon: <TrophyIcon className="w-20 h-20 text-yellow-400" />,
            color: 'from-purple-600 to-pink-600'
        },
        {
            id: 1,
            title: 'Удобное бронирование',
            description: 'Забронируйте столик за 30 секунд в несколько кликов',
            icon: <CalendarIcon className="w-20 h-20 text-blue-400" />,
            color: 'from-blue-600 to-cyan-600'
        },
        {
            id: 2,
            title: 'Богатое меню',
            description: 'Более 20 традиционных белорусских блюд от шеф-повара',
            icon: <ClipboardDocumentListIcon className="w-20 h-20 text-orange-400" />,
            color: 'from-orange-600 to-red-600'
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const features = [
        { id: 0, icon: <TableCellsIcon className="w-6 h-6" />, title: 'Столики', desc: 'Выбор свободных столиков в реальном времени', color: 'from-blue-500 to-cyan-500' },
        { id: 1, icon: <CalendarIcon className="w-6 h-6" />, title: 'Бронирования', desc: 'Мгновенное подтверждение брони', color: 'from-green-500 to-emerald-500' },
        { id: 2, icon: <UsersIcon className="w-6 h-6" />, title: 'Клиенты', desc: 'Удобное управление клиентами', color: 'from-purple-500 to-pink-500' },
        { id: 3, icon: <ClipboardDocumentListIcon className="w-6 h-6" />, title: 'Меню', desc: 'Актуальное меню с ценами', color: 'from-orange-500 to-red-500' },
    ];

    const stats = [
        { id: 0, value: '500+', label: 'Довольных клиентов', icon: <HeartIcon className="w-6 h-6 text-red-400" /> },
        { id: 1, value: '20+', label: 'Блюд в меню', icon: <StarIcon className="w-6 h-6 text-yellow-400" /> },
        { id: 2, value: '100%', label: 'Гарантия качества', icon: <CheckBadgeIcon className="w-6 h-6 text-green-400" /> },
        { id: 3, value: '24/7', label: 'Поддержка', icon: <SparklesIcon className="w-6 h-6 text-purple-400" /> },
    ];

    return (
        <div className="relative min-h-screen overflow-x-hidden">
            {floatingElements.map(el => (
                <motion.div
                    key={el.id}
                    initial={{ y: el.y, x: el.x, opacity: 1, scale: 0.5 }}
                    animate={{ y: -100, opacity: 0, scale: 1.5, rotate: 360 }}
                    transition={{ duration: 4, ease: 'easeOut' }}
                    className="fixed pointer-events-none z-50 text-3xl"
                    style={{ left: el.x }}
                >
                    {el.type}
                </motion.div>
            ))}

            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50" />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 180, 270, 360] }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-20 -left-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
                />
                <motion.div
                    animate={{ scale: [1.2, 1, 1.2], rotate: [360, 270, 180, 90, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                    className="absolute bottom-20 -right-40 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
                />
                <motion.div
                    animate={{ y: [0, -50, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
                />
            </div>

            <div className="relative z-10">
                <div className="min-h-screen flex items-center justify-center px-4">
                    <div className="max-w-6xl mx-auto text-center">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                            className="inline-block mb-6"
                        >
                            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                                <span className="text-5xl animate-bounce">🍽️</span>
                            </div>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-4"
                        >
                            Restaurant Booking
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
                        >
                            Лучшая система бронирования столиков для вашего ресторана.
                            Быстро, удобно, надежно.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex gap-4 justify-center"
                        >
                            <button
                                onClick={() => navigate(role === 'admin' ? '/admin' : '/user')}
                                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center gap-2"
                            >
                                Начать работу
                                <ArrowRightIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="px-8 py-3 border-2 border-purple-500 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all"
                            >
                                Войти
                            </button>
                        </motion.div>
                    </div>
                </div>

                <div className="py-20 px-4">
                    <div className="max-w-6xl mx-auto">
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12"
                        >
                            Почему выбирают нас?
                        </motion.h2>

                        <div className="relative h-96">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeSlide}
                                    initial={{ opacity: 0, x: 100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ duration: 0.5 }}
                                    className={`absolute inset-0 bg-gradient-to-r ${slides[activeSlide].color} rounded-3xl p-12 text-white text-center shadow-2xl`}
                                >
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <motion.div
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            {slides[activeSlide].icon}
                                        </motion.div>
                                        <h3 className="text-3xl font-bold mt-6 mb-4">{slides[activeSlide].title}</h3>
                                        <p className="text-xl opacity-90">{slides[activeSlide].description}</p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                                {slides.map((slide) => (
                                    <button
                                        key={slide.id}
                                        onClick={() => setActiveSlide(slide.id)}
                                        className={`w-3 h-3 rounded-full transition-all ${activeSlide === slide.id ? 'bg-white w-6' : 'bg-white/50'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="py-20 px-4 bg-white/50 backdrop-blur-sm">
                    <div className="max-w-6xl mx-auto">
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12"
                        >
                            Наши преимущества
                        </motion.h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {features.map((feature) => (
                                <motion.div
                                    key={feature.id}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: feature.id * 0.1 }}
                                    whileHover={{ y: -10, scale: 1.05 }}
                                    className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-300"
                                >
                                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg`}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                                    <p className="text-gray-500">{feature.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="py-20 px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {stats.map((stat) => (
                                <motion.div
                                    key={stat.id}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: stat.id * 0.1, type: 'spring', stiffness: 200 }}
                                    className="text-center"
                                >
                                    <div className="flex justify-center mb-2">{stat.icon}</div>
                                    <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
                                    <div className="text-sm text-gray-500">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="py-20 px-4"
                >
                    <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-white shadow-2xl">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="inline-block mb-4"
                        >
                            <FireIcon className="w-16 h-16 text-yellow-300" />
                        </motion.div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Готовы начать?</h2>
                        <p className="text-xl mb-8 opacity-90">Присоединяйтесь к нам и получите лучший сервис</p>
                        <button
                            onClick={() => navigate(role === 'admin' ? '/admin' : '/user')}
                            className="px-8 py-3 bg-white text-purple-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                        >
                            Начать сейчас
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default HomePage;