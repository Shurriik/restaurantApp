import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { bookingService } from '../../services/bookingService';
import { tableService } from '../../services/tableService';
import { Booking, CompleteBookingRequest, BookingStatus } from '../../types';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';
import {
    EyeIcon,
    TrashIcon,
    PlusIcon,
    TrophyIcon,
    CalendarIcon,
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    TableCellsIcon,
    UsersIcon,
    ClockIcon,
    FunnelIcon,
    XMarkIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

const AdminBookings: React.FC = () => {
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [dateFilter, setDateFilter] = useState<string>('');
    const [startDateFilter, setStartDateFilter] = useState<string>('');
    const [endDateFilter, setEndDateFilter] = useState<string>('');
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [formData, setFormData] = useState<CompleteBookingRequest>({
        customerName: '', customerPhone: '', customerEmail: '', tableId: 0, startTime: '', endTime: '', numberOfGuests: 2,
    });
    const { showSuccess, showError } = useToast();
    const queryClient = useQueryClient();

    const { data: bookings, isLoading } = useQuery<Booking[]>({
        queryKey: ['adminBookings'],
        queryFn: bookingService.getAll,
        refetchInterval: 5000
    });
    const { data: tables } = useQuery({ queryKey: ['tables'], queryFn: tableService.getAll });

    const invalidateQueries = () => {
        queryClient.invalidateQueries({ queryKey: ['adminBookings'] }).catch(console.error);
        queryClient.invalidateQueries({ queryKey: ['tables'] }).catch(console.error);
    };

    const deleteMutation = useMutation({
        mutationFn: bookingService.delete,
        onSuccess: () => {
            invalidateQueries();
            showSuccess('✨ Бронирование удалено');
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: CompleteBookingRequest) => {
            const isAvailable = await bookingService.checkTableAvailability(
                data.tableId, data.startTime, data.endTime
            );
            if (!isAvailable) {
                throw new Error('Столик на выбранное время уже забронирован');
            }
            const result = await bookingService.create(data);
            const table = tables?.find(t => t.id === data.tableId);
            if (table?.available) {
                await tableService.update(data.tableId, { ...table, available: false });
            }
            return result;
        },
        onSuccess: () => {
            invalidateQueries();
            showSuccess('✨ Бронирование создано, столик забронирован');
            setIsCreateModalOpen(false);
            setFormData({ customerName: '', customerPhone: '', customerEmail: '', tableId: 0, startTime: '', endTime: '', numberOfGuests: 2 });
        },
        onError: (error: Error) => showError(error.message)
    });

    const getStartOfWeek = (date: Date): Date => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(d.setDate(diff));
        startOfWeek.setHours(0, 0, 0, 0);
        return startOfWeek;
    };

    const getEndOfWeek = (date: Date): Date => {
        const startOfWeek = getStartOfWeek(date);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return endOfWeek;
    };

    const getStartOfMonth = (date: Date): Date => {
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        return startOfMonth;
    };

    const getEndOfMonth = (date: Date): Date => {
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        return endOfMonth;
    };

    const filterByDate = (booking: Booking): boolean => {
        const bookingStartTime = new Date(booking.startTime);
        const today = new Date();

        if (dateFilter === 'today') {
            return bookingStartTime.toDateString() === today.toDateString();
        }

        if (dateFilter === 'tomorrow') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return bookingStartTime.toDateString() === tomorrow.toDateString();
        }

        if (dateFilter === 'week') {
            const weekStart = getStartOfWeek(today);
            const weekEnd = getEndOfWeek(today);
            return bookingStartTime >= weekStart && bookingStartTime <= weekEnd;
        }

        if (dateFilter === 'month') {
            const monthStart = getStartOfMonth(today);
            const monthEnd = getEndOfMonth(today);
            return bookingStartTime >= monthStart && bookingStartTime <= monthEnd;
        }

        if (startDateFilter && endDateFilter) {
            const start = new Date(startDateFilter);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDateFilter);
            end.setHours(23, 59, 59, 999);
            return bookingStartTime >= start && bookingStartTime <= end;
        }

        if (startDateFilter) {
            const start = new Date(startDateFilter);
            start.setHours(0, 0, 0, 0);
            return bookingStartTime >= start;
        }

        if (endDateFilter) {
            const end = new Date(endDateFilter);
            end.setHours(23, 59, 59, 999);
            return bookingStartTime <= end;
        }

        return true;
    };

    const resetFilters = () => {
        setDateFilter('');
        setStartDateFilter('');
        setEndDateFilter('');
        setShowFilters(false);
    };

    const filteredBookings = bookings?.filter(filterByDate) || [];

    const today = new Date();
    const weekStart = getStartOfWeek(today);
    const weekEnd = getEndOfWeek(today);
    const monthStart = getStartOfMonth(today);
    const monthEnd = getEndOfMonth(today);

    const allStats = {
        total: bookings?.length || 0,
        today: bookings?.filter(b => new Date(b.startTime).toDateString() === today.toDateString()).length || 0,
        week: bookings?.filter(b => {
            const bookingDate = new Date(b.startTime);
            return bookingDate >= weekStart && bookingDate <= weekEnd;
        }).length || 0,
        month: bookings?.filter(b => {
            const bookingDate = new Date(b.startTime);
            return bookingDate >= monthStart && bookingDate <= monthEnd;
        }).length || 0,
    };

    const getStatusBadge = (status: BookingStatus) => {
        const config: Record<BookingStatus, { color: string; icon: any; text: string }> = {
            [BookingStatus.CONFIRMED]: { color: 'bg-green-100 text-green-700', icon: CheckCircleIcon, text: 'Подтверждено' },
            [BookingStatus.PENDING]: { color: 'bg-yellow-100 text-yellow-700', icon: ClockIcon, text: 'Ожидает' },
            [BookingStatus.CANCELLED]: { color: 'bg-red-100 text-red-700', icon: XCircleIcon, text: 'Отменено' },
            [BookingStatus.COMPLETED]: { color: 'bg-blue-100 text-blue-700', icon: CheckCircleIcon, text: 'Завершено' },
            [BookingStatus.NO_SHOW]: { color: 'bg-gray-100 text-gray-700', icon: XCircleIcon, text: 'Неявка' }
        };
        return config[status];
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100 } }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-6 animate-fade-in">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-2xl"
            >
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <TrophyIcon className="w-8 h-8 text-yellow-300 animate-bounce" />
                        <div>
                            <h1 className="text-2xl font-bold">Управление бронированиями</h1>
                            <p className="text-white/80">Всего бронирований: {allStats.total}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                                showFilters ? 'bg-white text-purple-600' : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                        >
                            <FunnelIcon className="w-5 h-5" /> Фильтры
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 bg-white text-purple-600 px-4 py-2 rounded-xl font-semibold hover:bg-gray-100"
                        >
                            <PlusIcon className="w-5 h-5" /> Создать бронирование
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-3 text-white text-center">
                    <p className="text-xs">Всего</p>
                    <p className="text-2xl font-bold">{allStats.total}</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-3 text-white text-center">
                    <p className="text-xs">Сегодня</p>
                    <p className="text-2xl font-bold">{allStats.today}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-3 text-white text-center">
                    <p className="text-xs">Эта неделя</p>
                    <p className="text-2xl font-bold">{allStats.week}</p>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-3 text-white text-center">
                    <p className="text-xs">Этот месяц</p>
                    <p className="text-2xl font-bold">{allStats.month}</p>
                </div>
            </div>

            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-6 border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <FunnelIcon className="w-5 h-5 text-purple-500" />
                                    Фильтрация по дате
                                </h3>
                                <button
                                    onClick={resetFilters}
                                    className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                                >
                                    <XMarkIcon className="w-4 h-4" /> Сбросить
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Быстрые фильтры</label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => { setDateFilter('today'); setStartDateFilter(''); setEndDateFilter(''); }}
                                            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                                                dateFilter === 'today' ? 'bg-purple-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            Сегодня
                                        </button>
                                        <button
                                            onClick={() => { setDateFilter('tomorrow'); setStartDateFilter(''); setEndDateFilter(''); }}
                                            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                                                dateFilter === 'tomorrow' ? 'bg-purple-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            Завтра
                                        </button>
                                        <button
                                            onClick={() => { setDateFilter('week'); setStartDateFilter(''); setEndDateFilter(''); }}
                                            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                                                dateFilter === 'week' ? 'bg-purple-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            Эта неделя
                                        </button>
                                        <button
                                            onClick={() => { setDateFilter('month'); setStartDateFilter(''); setEndDateFilter(''); }}
                                            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                                                dateFilter === 'month' ? 'bg-purple-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            Этот месяц
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Произвольный диапазон</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="date"
                                            value={startDateFilter}
                                            onChange={(e) => { setStartDateFilter(e.target.value); setDateFilter(''); }}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        />
                                        <input
                                            type="date"
                                            value={endDateFilter}
                                            onChange={(e) => { setEndDateFilter(e.target.value); setDateFilter(''); }}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {(dateFilter || startDateFilter || endDateFilter) && (
                                <div className="mt-4 pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-500 mb-2">Активные фильтры:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {dateFilter === 'today' && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">📅 Сегодня</span>}
                                        {dateFilter === 'tomorrow' && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">📅 Завтра</span>}
                                        {dateFilter === 'week' && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">📅 Эта неделя</span>}
                                        {dateFilter === 'month' && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">📅 Этот месяц</span>}
                                        {startDateFilter && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">📅 От: {new Date(startDateFilter).toLocaleDateString()}</span>}
                                        {endDateFilter && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">📅 До: {new Date(endDateFilter).toLocaleDateString()}</span>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
            >
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-purple-500" />
                    Список бронирований
                    {filteredBookings.length !== bookings?.length && (
                        <span className="text-sm font-normal text-gray-500">
                            (показано {filteredBookings.length} из {bookings?.length})
                        </span>
                    )}
                </h2>

                {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => {
                        const statusConfig = getStatusBadge(booking.status);
                        const StatusIcon = statusConfig.icon;
                        return (
                            <motion.div
                                key={booking.id}
                                variants={itemVariants}
                                whileHover={{ y: -3, scale: 1.01 }}
                                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all"
                            >
                                <div className="p-6">
                                    <div className="flex flex-wrap justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <h3 className="text-lg font-semibold text-gray-800">Бронирование #{booking.id}</h3>
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                                                    <StatusIcon className="w-4 h-4" />{statusConfig.text}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                                                <p className="text-sm text-gray-500 flex items-center gap-1">👤 Клиент: {booking.customer?.name}</p>
                                                <p className="text-sm text-gray-500 flex items-center gap-1">📞 {booking.customer?.phone}</p>
                                                <p className="text-sm text-gray-500 flex items-center gap-1">🍽️ Стол: #{booking.table?.number}</p>
                                                <p className="text-sm text-gray-500 flex items-center gap-1">👥 {booking.numberOfGuests} гостей</p>
                                                <p className="text-sm text-gray-500 flex items-center gap-1 col-span-2">📅 {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => { setSelectedBooking(booking); setIsViewModalOpen(true); }}
                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                                            >
                                                <EyeIcon className="w-5 h-5" />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => deleteMutation.mutate(booking.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="bg-gray-50 rounded-xl p-8 text-center">
                        <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Нет бронирований за выбранный период</p>
                        <button
                            onClick={resetFilters}
                            className="mt-3 text-purple-500 hover:text-purple-600 text-sm"
                        >
                            Сбросить фильтры
                        </button>
                    </div>
                )}
            </motion.div>

            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Бронирование #${selectedBooking?.id}`} size="lg">
                {selectedBooking && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
                                <p className="text-xs text-gray-500 flex items-center gap-1"><UserIcon className="w-3 h-3" /> Клиент</p>
                                <p className="font-medium">{selectedBooking.customer?.name}</p>
                            </div>
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
                                <p className="text-xs text-gray-500 flex items-center gap-1"><PhoneIcon className="w-3 h-3" /> Телефон</p>
                                <p className="font-medium">{selectedBooking.customer?.phone}</p>
                            </div>
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
                                <p className="text-xs text-gray-500 flex items-center gap-1"><EnvelopeIcon className="w-3 h-3" /> Email</p>
                                <p className="font-medium">{selectedBooking.customer?.email || '-'}</p>
                            </div>
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
                                <p className="text-xs text-gray-500 flex items-center gap-1"><TableCellsIcon className="w-3 h-3" /> Столик</p>
                                <p className="font-medium">#{selectedBooking.table?.number}</p>
                                <p className="text-sm">{selectedBooking.table?.location}</p>
                            </div>
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
                                <p className="text-xs text-gray-500 flex items-center gap-1"><UsersIcon className="w-3 h-3" /> Гости</p>
                                <p className="font-medium">{selectedBooking.numberOfGuests} человек</p>
                            </div>
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl col-span-2">
                                <p className="text-xs text-gray-500 flex items-center gap-1"><ClockIcon className="w-3 h-3" /> Время</p>
                                <p className="font-medium">{new Date(selectedBooking.startTime).toLocaleString()} - {new Date(selectedBooking.endTime).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="✨ Создание бронирования" size="lg">
                <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">👤 Имя клиента *</label>
                            <input
                                id="customerName"
                                type="text"
                                required
                                value={formData.customerName}
                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">📞 Телефон *</label>
                            <input
                                id="customerPhone"
                                type="tel"
                                required
                                value={formData.customerPhone}
                                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                                placeholder="+375291653078"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">📧 Email</label>
                        <input
                            id="customerEmail"
                            type="email"
                            value={formData.customerEmail}
                            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="tableId" className="block text-sm font-medium text-gray-700 mb-1">🍽️ Столик *</label>
                            <select
                                id="tableId"
                                required
                                value={formData.tableId}
                                onChange={(e) => setFormData({ ...formData, tableId: Number.parseInt(e.target.value, 10) })}
                                className="w-full px-3 py-2 border rounded-lg"
                            >
                                <option value="">Выберите столик</option>
                                {tables?.filter(t => t.available).map(t => (
                                    <option key={t.id} value={t.id}>Стол #{t.number} ({t.capacity} чел.)</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="numberOfGuests" className="block text-sm font-medium text-gray-700 mb-1">👥 Гостей *</label>
                            <input
                                id="numberOfGuests"
                                type="number"
                                required
                                min="1"
                                value={formData.numberOfGuests}
                                onChange={(e) => setFormData({ ...formData, numberOfGuests: Number.parseInt(e.target.value, 10) })}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">📅 Начало *</label>
                            <input
                                id="startTime"
                                type="datetime-local"
                                required
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">⏰ Окончание *</label>
                            <input
                                id="endTime"
                                type="datetime-local"
                                required
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 justify-end pt-4">
                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Отмена</button>
                        <motion.button whileHover={{ scale: 1.02 }} type="submit" className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg">✨ Создать</motion.button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminBookings;