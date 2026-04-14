import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { tableService } from '../../services/tableService';
import { bookingService } from '../../services/bookingService';
import { TableLocation, RestaurantTable } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';
import {
    FunnelIcon,
    UserGroupIcon,
    MapPinIcon,
    StarIcon
} from '@heroicons/react/24/outline';

const UserTables: React.FC = () => {
    const { user } = useAuthStore();
    const [filters, setFilters] = useState({
        minCapacity: '',
        location: '',
    });
    const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [hoveredTable, setHoveredTable] = useState<number | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    const [bookingForm, setBookingForm] = useState({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        startTime: '',
        endTime: '',
        numberOfGuests: 2,
    });
    const { showSuccess, showError } = useToast();

    const { data: tables, isLoading, refetch } = useQuery<RestaurantTable[]>({
        queryKey: ['tables', filters],
        queryFn: () => tableService.filter({
            minCapacity: filters.minCapacity ? Number.parseInt(filters.minCapacity, 10) : undefined,
            location: filters.location as TableLocation || undefined,
            available: true,
        }),
    });

    const openBookingModal = (table: RestaurantTable) => {
        setSelectedTable(table);
        setBookingForm({
            customerName: user?.name || '',
            customerPhone: user?.phone || '',
            customerEmail: user?.email || '',
            startTime: '',
            endTime: '',
            numberOfGuests: 2,
        });
        setIsBookingModalOpen(true);
    };

    const createBooking = async () => {
        if (!selectedTable) return;

        if (!bookingForm.startTime || !bookingForm.endTime) {
            showError('Пожалуйста, выберите дату и время');
            return;
        }

        if (bookingForm.numberOfGuests > selectedTable.capacity) {
            showError(`Вместимость столика: ${selectedTable.capacity} человек`);
            return;
        }

        if (new Date(bookingForm.startTime) < new Date()) {
            showError('Дата и время начала не могут быть в прошлом');
            return;
        }

        if (new Date(bookingForm.endTime) <= new Date(bookingForm.startTime)) {
            showError('Дата и время окончания должны быть позже даты начала');
            return;
        }

        setIsChecking(true);

        try {
            const isAvailable = await bookingService.checkTableAvailability(
                selectedTable.id,
                bookingForm.startTime,
                bookingForm.endTime
            );

            if (!isAvailable) {
                showError(`❌ Стол #${selectedTable.number} на выбранное время уже забронирован. Пожалуйста, выберите другое время или другой столик.`);
                setIsChecking(false);
                return;
            }

            const bookingData = {
                customerName: bookingForm.customerName,
                customerPhone: bookingForm.customerPhone,
                customerEmail: bookingForm.customerEmail,
                tableId: selectedTable.id,
                startTime: bookingForm.startTime,
                endTime: bookingForm.endTime,
                numberOfGuests: bookingForm.numberOfGuests,
            };

            await bookingService.create(bookingData);
            showSuccess(`✨ Стол #${selectedTable.number} успешно забронирован!`);
            setIsBookingModalOpen(false);
            setSelectedTable(null);
            setBookingForm({
                customerName: user?.name || '',
                customerPhone: user?.phone || '',
                customerEmail: user?.email || '',
                startTime: '',
                endTime: '',
                numberOfGuests: 2,
            });
            await refetch();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Ошибка при создании бронирования';
            showError(errorMessage);
        } finally {
            setIsChecking(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createBooking();
    };

    const getLocationText = (location: TableLocation): string => {
        const locations = {
            [TableLocation.MAIN_HALL]: 'Основной зал',
            [TableLocation.TERRACE]: 'Терраса',
            [TableLocation.VIP_ROOM]: 'VIP зал',
            [TableLocation.PRIVATE_ROOM]: 'Приватная комната',
            [TableLocation.WINDOW_SIDE]: 'У окна',
            [TableLocation.BAR_COUNTER]: 'Барная стойка',
        };
        return locations[location];
    };

    const getLocationIcon = (location: TableLocation): string => {
        const icons = {
            [TableLocation.MAIN_HALL]: '🏛️',
            [TableLocation.TERRACE]: '🌳',
            [TableLocation.VIP_ROOM]: '💎',
            [TableLocation.PRIVATE_ROOM]: '🚪',
            [TableLocation.WINDOW_SIDE]: '🪟',
            [TableLocation.BAR_COUNTER]: '🍸',
        };
        return icons[location];
    };

    const setMinTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    if (isLoading) return <LoadingSpinner />;

    const tableVariants = {
        hidden: { opacity: 0, y: 50, scale: 0.9 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { delay: i * 0.1, type: 'spring', stiffness: 100 }
        }),
        hover: { y: -10, scale: 1.02, transition: { duration: 0.2 } }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 rounded-2xl p-6 text-white shadow-2xl"
            >
                <h1 className="text-2xl font-bold mb-2">🍽️ Выберите идеальный столик</h1>
                <p className="text-white/80">Найдите идеальное место для вашего вечера. После бронирования вы сможете заказывать блюда из меню.</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-6"
            >
                <div className="flex items-center gap-2 mb-4">
                    <FunnelIcon className="w-5 h-5 text-orange-500" />
                    <h3 className="font-semibold text-gray-800">Фильтры</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">👥 Мин. вместимость</label>
                        <input
                            type="number"
                            value={filters.minCapacity}
                            onChange={(e) => setFilters({ ...filters, minCapacity: e.target.value })}
                            placeholder="От 1 человека"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">📍 Локация</label>
                        <select
                            value={filters.location}
                            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                            <option value="">Все локации</option>
                            {Object.values(TableLocation).map((loc) => (
                                <option key={loc} value={loc}>{getLocationText(loc)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => setFilters({ minCapacity: '', location: '' })}
                            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            🔄 Сбросить фильтры
                        </button>
                    </div>
                </div>
            </motion.div>

            {tables && tables.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tables.map((table: RestaurantTable, idx: number) => (
                        <motion.div
                            key={table.id}
                            custom={idx}
                            variants={tableVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                            onHoverStart={() => setHoveredTable(table.id)}
                            onHoverEnd={() => setHoveredTable(null)}
                            className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 cursor-pointer"
                            onClick={() => openBookingModal(table)}
                        >
                            <div className="relative">
                                <div className="p-6">
                                    <motion.div
                                        className="flex items-center gap-3 mb-4"
                                        animate={{ x: hoveredTable === table.id ? 5 : 0 }}
                                    >
                                        <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center shadow-md">
                                            <span className="text-3xl">{getLocationIcon(table.location)}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">Стол #{table.number}</h3>
                                            <p className="text-sm text-gray-500">{getLocationText(table.location)}</p>
                                        </div>
                                    </motion.div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <UserGroupIcon className="w-5 h-5 text-orange-500" />
                                            <span>Вместимость: <strong>{table.capacity} человек</strong></span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <MapPinIcon className="w-5 h-5 text-orange-500" />
                                            <span>Локация: <strong>{getLocationText(table.location)}</strong></span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {table.capacity >= 6 && (
                                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full flex items-center gap-1">
                                                <StarIcon className="w-3 h-3" /> Большая компания
                                            </span>
                                        )}
                                        {table.location === TableLocation.VIP_ROOM && (
                                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1">
                                                <StarIcon className="w-3 h-3" /> VIP класс
                                            </span>
                                        )}
                                        {table.location === TableLocation.WINDOW_SIDE && (
                                            <span className="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded-full flex items-center gap-1">
                                                🪟 Вид на город
                                            </span>
                                        )}
                                        {table.location === TableLocation.TERRACE && (
                                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-1">
                                                🌳 Открытая веранда
                                            </span>
                                        )}
                                        {table.location === TableLocation.BAR_COUNTER && (
                                            <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full flex items-center gap-1">
                                                🍸 Барная зона
                                            </span>
                                        )}
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                                    >
                                        ✨ Забронировать столик
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-xl shadow-md p-12 text-center"
                >
                    <div className="text-6xl mb-4 animate-bounce">🍽️</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Нет доступных столиков</h3>
                    <p className="text-gray-500">Попробуйте изменить параметры фильтрации</p>
                </motion.div>
            )}

            {}
            <Modal isOpen={isBookingModalOpen} onClose={() => {
                setIsBookingModalOpen(false);
                setSelectedTable(null);
            }} title="✨ Бронирование столика" size="xl">
                {selectedTable && (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-gradient-to-br from-orange-200 to-red-200 rounded-xl flex items-center justify-center">
                                    <span className="text-3xl">{getLocationIcon(selectedTable.location)}</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-orange-800">Стол #{selectedTable.number}</h3>
                                    <p className="text-orange-600 text-base">{getLocationText(selectedTable.location)}</p>
                                    <p className="text-sm text-orange-500 mt-1">👥 Вместимость: {selectedTable.capacity} человек</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">👤 Ваше имя *</label>
                                    <input
                                        type="text"
                                        required
                                        value={bookingForm.customerName}
                                        onChange={(e) => setBookingForm({ ...bookingForm, customerName: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                                        placeholder="Иван Иванов"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">📞 Телефон *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={bookingForm.customerPhone}
                                        onChange={(e) => setBookingForm({ ...bookingForm, customerPhone: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                                        placeholder="+375291653078"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">📧 Email</label>
                                <input
                                    type="email"
                                    value={bookingForm.customerEmail}
                                    onChange={(e) => setBookingForm({ ...bookingForm, customerEmail: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                                    placeholder="ivan@example.com"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">📅 Дата и время начала *</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        min={setMinTime()}
                                        value={bookingForm.startTime}
                                        onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">⏰ Дата и время окончания *</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        min={bookingForm.startTime || setMinTime()}
                                        value={bookingForm.endTime}
                                        onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">👥 Количество гостей *</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max={selectedTable.capacity}
                                    value={bookingForm.numberOfGuests}
                                    onChange={(e) => setBookingForm({ ...bookingForm, numberOfGuests: Number.parseInt(e.target.value, 10) })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                                />
                                <p className="text-sm text-gray-500 mt-2">Максимум {selectedTable.capacity} человек</p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <p className="text-sm text-blue-700 flex items-center gap-2">
                                    ℹ️ Если столик будет занят в выбранное время, вы увидите предупреждение.
                                </p>
                            </div>

                            <div className="flex gap-4 justify-end pt-6 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsBookingModalOpen(false);
                                        setSelectedTable(null);
                                    }}
                                    className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all text-base"
                                >
                                    Отмена
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isChecking}
                                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 text-base"
                                >
                                    {isChecking ? 'Проверка...' : '✨ Забронировать'}
                                </motion.button>
                            </div>
                        </form>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default UserTables;