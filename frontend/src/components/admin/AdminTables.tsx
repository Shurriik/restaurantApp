import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tableService } from '../../services/tableService';
import { TableLocation, RestaurantTable, TableRequest } from '../../types';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    UserGroupIcon,
    MapPinIcon,
    TrophyIcon,
    HomeIcon,
    SunIcon,
    StarIcon,
    BuildingOfficeIcon,
    BeakerIcon
} from '@heroicons/react/24/outline';

const AdminTables: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
    const [formData, setFormData] = useState<TableRequest>({
        number: 0,
        capacity: 2,
        location: TableLocation.MAIN_HALL,
        available: true,
    });
    const [editingId, setEditingId] = useState<number | null>(null);
    const { showSuccess, showError } = useToast();
    const queryClient = useQueryClient();

    const { data: tables, isLoading } = useQuery<RestaurantTable[]>({
        queryKey: ['adminTables'],
        queryFn: tableService.getAll,
    });

    const invalidateTables = () => {
        queryClient.invalidateQueries({ queryKey: ['adminTables'] }).catch(console.error);
    };

    const createMutation = useMutation({
        mutationFn: tableService.create,
        onSuccess: () => {
            invalidateTables();
            showSuccess('Столик успешно создан');
            closeModal();
        },
        onError: (error: Error) => showError(error.message),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: TableRequest }) =>
            tableService.update(id, data),
        onSuccess: () => {
            invalidateTables();
            showSuccess('Столик успешно обновлен');
            closeModal();
        },
        onError: (error: Error) => showError(error.message),
    });

    const deleteMutation = useMutation({
        mutationFn: tableService.delete,
        onSuccess: () => {
            invalidateTables();
            showSuccess('Столик успешно удален');
            setIsDeleteModalOpen(false);
            setSelectedTable(null);
        },
        onError: (error: Error) => showError(error.message),
    });

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

    const getLocationIcon = (location: TableLocation): { icon: JSX.Element; bg: string } => {
        const icons = {
            [TableLocation.MAIN_HALL]: { icon: <HomeIcon className="w-5 h-5" />, bg: 'from-amber-400 to-orange-500' },
            [TableLocation.TERRACE]: { icon: <SunIcon className="w-5 h-5" />, bg: 'from-sky-400 to-blue-500' },
            [TableLocation.VIP_ROOM]: { icon: <StarIcon className="w-5 h-5" />, bg: 'from-purple-500 to-pink-500' },
            [TableLocation.PRIVATE_ROOM]: { icon: <BuildingOfficeIcon className="w-5 h-5" />, bg: 'from-indigo-500 to-purple-500' },
            [TableLocation.WINDOW_SIDE]: { icon: <SunIcon className="w-5 h-5" />, bg: 'from-yellow-400 to-orange-500' },
            [TableLocation.BAR_COUNTER]: { icon: <BeakerIcon className="w-5 h-5" />, bg: 'from-cyan-400 to-blue-500' },
        };
        return icons[location];
    };

    const openCreateModal = () => {
        setEditingId(null);
        setFormData({ number: 0, capacity: 2, location: TableLocation.MAIN_HALL, available: true });
        setIsModalOpen(true);
    };

    const openEditModal = (table: RestaurantTable) => {
        setEditingId(table.id);
        setFormData({
            number: table.number,
            capacity: table.capacity,
            location: table.location,
            available: table.available,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const handleNumberChange = (value: string) => {
        const parsedValue = Number.parseInt(value, 10);
        setFormData({ ...formData, number: Number.isNaN(parsedValue) ? 0 : parsedValue });
    };

    const handleCapacityChange = (value: string) => {
        const parsedValue = Number.parseInt(value, 10);
        setFormData({ ...formData, capacity: Number.isNaN(parsedValue) ? 2 : parsedValue });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            updateMutation.mutate({ id: editingId, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    if (isLoading) return <LoadingSpinner />;

    const tablesByLocation = tables?.reduce((acc, table) => {
        const location = table.location;
        if (!acc[location]) acc[location] = [];
        acc[location].push(table);
        return acc;
    }, {} as Record<string, RestaurantTable[]>);

    return (
        <div className="space-y-6">
            {}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-5 text-white shadow-lg">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <TrophyIcon className="w-6 h-6 text-yellow-300" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Управление столиками</h1>
                            <p className="text-purple-100 text-sm">Всего столиков: {tables?.length || 0}</p>
                        </div>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-1.5 bg-white text-purple-600 px-3 py-1.5 rounded-lg font-semibold shadow hover:shadow-md transition-all text-sm"
                    >
                        <PlusIcon className="w-4 h-4" /> Добавить столик
                    </button>
                </div>
            </div>

            {Object.entries(tablesByLocation || {}).map(([location, locationTables]) => (
                <div key={location} className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 bg-gradient-to-r ${getLocationIcon(location as TableLocation).bg} rounded-lg flex items-center justify-center shadow`}>
                            {getLocationIcon(location as TableLocation).icon}
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">{getLocationText(location as TableLocation)}</h2>
                        <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {locationTables.length} столиков
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {locationTables.map((table) => {
                            const locationIcon = getLocationIcon(table.location);
                            return (
                                <div
                                    key={table.id}
                                    className="relative group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                                >
                                    <div className={`h-1.5 bg-gradient-to-r ${locationIcon.bg}`} />

                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-10 h-10 bg-gradient-to-r ${locationIcon.bg} rounded-lg flex items-center justify-center shadow`}>
                                                    {locationIcon.icon}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-800">Стол #{table.number}</h3>
                                                    <p className="text-xs text-gray-400">{getLocationText(table.location)}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEditModal(table)}
                                                    className="p-1 text-yellow-500 hover:bg-yellow-50 rounded transition-colors"
                                                >
                                                    <PencilIcon className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedTable(table); setIsDeleteModalOpen(true); }}
                                                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                                >
                                                    <TrashIcon className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <UserGroupIcon className="w-3.5 h-3.5 text-purple-500" />
                                                <span className="text-xs">Вместимость: <strong className="text-gray-800">{table.capacity} чел.</strong></span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPinIcon className="w-3.5 h-3.5 text-purple-500" />
                                                <span className="text-xs">Локация: <strong className="text-gray-800">{getLocationText(table.location)}</strong></span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                            {table.capacity >= 6 && (
                                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                                    <StarIcon className="w-2.5 h-2.5" /> Большая компания
                                                </span>
                                            )}
                                            {table.location === TableLocation.VIP_ROOM && (
                                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                                    <StarIcon className="w-2.5 h-2.5" /> VIP класс
                                                </span>
                                            )}
                                            {table.location === TableLocation.WINDOW_SIDE && (
                                                <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                                    <SunIcon className="w-2.5 h-2.5" /> Вид на город
                                                </span>
                                            )}
                                            {table.location === TableLocation.TERRACE && (
                                                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                                    <SunIcon className="w-2.5 h-2.5" /> Открытая веранда
                                                </span>
                                            )}
                                            {table.location === TableLocation.BAR_COUNTER && (
                                                <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                                    <BeakerIcon className="w-2.5 h-2.5" /> Барная зона
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {tables?.length === 0 && (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <div className="text-6xl mb-3">🍽️</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">Нет столиков</h3>
                    <p className="text-sm text-gray-500 mb-3">Добавьте первый столик в ресторан</p>
                    <button onClick={openCreateModal} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-1.5 rounded-lg font-semibold shadow hover:shadow-md transition-all text-sm">
                        Добавить столик
                    </button>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? 'Редактирование столика' : 'Добавление столика'} size="md">
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700 mb-1">Номер столика *</label>
                        <input
                            id="tableNumber"
                            type="number"
                            required
                            value={formData.number}
                            onChange={(e) => handleNumberChange(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label htmlFor="tableCapacity" className="block text-sm font-medium text-gray-700 mb-1">Вместимость *</label>
                        <input
                            id="tableCapacity"
                            type="number"
                            required
                            min="1"
                            max="20"
                            value={formData.capacity}
                            onChange={(e) => handleCapacityChange(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label htmlFor="tableLocation" className="block text-sm font-medium text-gray-700 mb-1">Локация *</label>
                        <select
                            id="tableLocation"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value as TableLocation })}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            {Object.values(TableLocation).map((loc) => (
                                <option key={loc} value={loc}>{getLocationText(loc)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-3 justify-end pt-3">
                        <button type="button" onClick={closeModal} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">Отмена</button>
                        <button type="submit" className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg text-sm">Сохранить</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Подтверждение удаления">
                <div className="space-y-3">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-800 font-medium text-sm">Вы уверены, что хотите удалить столик #{selectedTable?.number}?</p>
                        <p className="text-xs text-red-600 mt-1">Это действие нельзя отменить.</p>
                    </div>
                    <div className="flex gap-3 justify-end">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="px-3 py-1.5 bg-gray-200 rounded-lg text-sm">Отмена</button>
                        <button onClick={() => selectedTable && deleteMutation.mutate(selectedTable.id)} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm">Удалить</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminTables;