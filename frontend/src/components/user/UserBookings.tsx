import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { bookingService } from '../../services/bookingService';
import { tableService } from '../../services/tableService';
import { useAuthStore } from '../../store/authStore';
import { Booking } from '../../types';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';
import {
    CalendarIcon,
    UsersIcon,
    XCircleIcon,
    TableCellsIcon,
    TrophyIcon
} from '@heroicons/react/24/outline';

const UserBookings: React.FC = () => {
    const { user } = useAuthStore();
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const { showSuccess, showError } = useToast();
    const queryClient = useQueryClient();

    const { data: allBookings, isLoading } = useQuery<Booking[]>({
        queryKey: ['bookings'],
        queryFn: bookingService.getAll,
    });

    const { data: tables } = useQuery({
        queryKey: ['tables'],
        queryFn: tableService.getAll,
    });

    const bookings = allBookings?.filter(booking =>
        booking.customer.phone === user?.phone || booking.customer.email === user?.email
    ) || [];

    const cancelMutation = useMutation({
        mutationFn: async (booking: Booking) => {
            await bookingService.cancel(booking.id);

            const table = tables?.find(t => t.id === booking.table.id);
            if (table && !table.available) {
                await tableService.update(table.id, { ...table, available: true });
            }
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['bookings'] }),
                queryClient.invalidateQueries({ queryKey: ['tables'] })
            ]);
            showSuccess('✨ Бронирование успешно отменено, столик освобожден');
            setIsCancelModalOpen(false);
            setSelectedBooking(null);
        },
        onError: (error: Error) => {
            showError(error.message || 'Ошибка при отмене бронирования');
        },
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100 } }
    };

    const getTableLocationText = (location: string): string => {
        switch (location) {
            case 'WINDOW_SIDE':
                return 'У окна';
            case 'MAIN_HALL':
                return 'Основной зал';
            case 'TERRACE':
                return 'Терраса';
            case 'VIP_ROOM':
                return 'VIP зал';
            default:
                return 'Приватная комната';
        }
    };

    const handleNavigateToTables = (): void => {
        if (globalThis.window !== undefined) {
            globalThis.window.location.href = '/user/tables';
        }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-6 animate-fade-in">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 rounded-2xl p-6 text-white shadow-2xl"
            >
                <div className="flex items-center gap-3">
                    <TrophyIcon className="w-8 h-8 text-yellow-300 animate-bounce" />
                    <div>
                        <h1 className="text-2xl font-bold">Мои бронирования</h1>
                        <p className="text-white/80">Всего бронирований: {bookings.length}</p>
                    </div>
                </div>
            </motion.div>

            {bookings.length > 0 ? (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                >
                    {bookings.map((booking) => (
                        <motion.div
                            key={booking.id}
                            variants={itemVariants}
                            whileHover={{ y: -5, scale: 1.01 }}
                            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
                        >
                            <div className="p-6">
                                <div className="flex flex-wrap justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                                            <span className="text-sm text-gray-500">№{booking.id}</span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <CalendarIcon className="w-5 h-5 text-orange-500" />
                                                <div>
                                                    <p className="text-xs font-medium text-gray-400">Дата и время</p>
                                                    <p className="text-sm font-medium">
                                                        {new Date(booking.startTime).toLocaleDateString('ru-RU')}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(booking.startTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-600">
                                                <TableCellsIcon className="w-5 h-5 text-orange-500" />
                                                <div>
                                                    <p className="text-xs font-medium text-gray-400">Столик</p>
                                                    <p className="text-sm font-medium">Стол #{booking.table.number}</p>
                                                    <p className="text-xs text-gray-500">{getTableLocationText(booking.table.location)}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-600">
                                                <UsersIcon className="w-5 h-5 text-orange-500" />
                                                <div>
                                                    <p className="text-xs font-medium text-gray-400">Гости</p>
                                                    <p className="text-sm font-medium">{booking.numberOfGuests} человек</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedBooking(booking);
                                                setIsCancelModalOpen(true);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                        >
                                            <XCircleIcon className="w-5 h-5" />
                                            Отменить
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-xl shadow-md p-12 text-center"
                >
                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-6xl mb-4"
                    >
                        📅
                    </motion.div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Нет бронирований</h3>
                    <p className="text-gray-500 mb-4">У вас пока нет активных бронирований</p>
                    <button
                        onClick={handleNavigateToTables}
                        className="btn-primary"
                    >
                        ✨ Забронировать столик
                    </button>
                </motion.div>
            )}

            {}
            <Modal isOpen={isCancelModalOpen} onClose={() => {
                setIsCancelModalOpen(false);
                setSelectedBooking(null);
            }} title="Отмена бронирования">
                <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800 font-medium">⚠️ Вы уверены, что хотите отменить бронирование?</p>
                        {selectedBooking && (
                            <div className="mt-3 text-sm text-yellow-700 space-y-1">
                                <p>📍 Стол #{selectedBooking.table.number}</p>
                                <p>📅 {new Date(selectedBooking.startTime).toLocaleDateString('ru-RU')}</p>
                                <p>⏰ в {new Date(selectedBooking.startTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</p>
                                <p>👥 {selectedBooking.numberOfGuests} гостей</p>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3 justify-end">
                        <button onClick={() => {
                            setIsCancelModalOpen(false);
                            setSelectedBooking(null);
                        }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Отмена</button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => selectedBooking && cancelMutation.mutate(selectedBooking)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                            Подтвердить отмену
                        </motion.button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UserBookings;