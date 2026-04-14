import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { customerService, validateBelarusPhone } from '../../services/customerService';
import { Customer, CustomerRequest } from '../../types';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';
import {
    UserPlusIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    TrashIcon,
    PhoneIcon,
    EnvelopeIcon,
    UserGroupIcon,
    CalendarIcon,
    TrophyIcon,
    SparklesIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';

const AdminCustomers: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [formData, setFormData] = useState<CustomerRequest>({ name: '', phone: '', email: '' });
    const [editingId, setEditingId] = useState<number | null>(null);
    const { showSuccess, showError } = useToast();
    const queryClient = useQueryClient();

    const { data: customers, isLoading } = useQuery<Customer[]>({
        queryKey: ['adminCustomers'],
        queryFn: customerService.getAll,
        refetchInterval: 10000
    });

    const invalidateCustomers = () => {
        queryClient.invalidateQueries({ queryKey: ['adminCustomers'] }).catch(console.error);
    };

    const createMutation = useMutation({
        mutationFn: customerService.create,
        onSuccess: () => {
            invalidateCustomers();
            showSuccess('✨ Клиент успешно создан');
            closeModal();
        },
        onError: (error: Error) => showError(error.message)
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: CustomerRequest }) => customerService.update(id, data),
        onSuccess: () => {
            invalidateCustomers();
            showSuccess('✨ Клиент успешно обновлен');
            closeModal();
        },
        onError: (error: Error) => showError(error.message)
    });

    const deleteMutation = useMutation({
        mutationFn: customerService.delete,
        onSuccess: () => {
            invalidateCustomers();
            showSuccess('✨ Клиент успешно удален');
            setIsDeleteModalOpen(false);
        },
        onError: (error: Error) => showError(error.message)
    });

    const filteredCustomers = customers?.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openCreateModal = () => {
        setEditingId(null);
        setFormData({ name: '', phone: '', email: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (customer: Customer) => {
        setEditingId(customer.id);
        setFormData({ name: customer.name, phone: customer.phone, email: customer.email || '' });
        setIsModalOpen(true);
    };

    const openViewModal = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsViewModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateBelarusPhone(formData.phone)) {
            showError('Неверный формат белорусского номера телефона');
            return;
        }
        if (editingId) {
            updateMutation.mutate({ id: editingId, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 12 } }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-6 animate-fade-in">
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-2xl"
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
                </div>

                <div className="relative z-10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                        >
                            <TrophyIcon className="w-8 h-8 text-yellow-300 animate-float" />
                        </motion.div>
                        <div>
                            <h1 className="text-2xl font-bold">Управление клиентами</h1>
                            <p className="text-white/80">Всего клиентов: {customers?.length || 0}</p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-white text-purple-600 px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                        <UserPlusIcon className="w-5 h-5" /> Добавить клиента
                    </motion.button>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-4"
            >
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="🔍 Поиск по имени, телефону или email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                </div>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {filteredCustomers?.map((customer) => (
                    <motion.div
                        key={customer.id}
                        variants={itemVariants}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className="group bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 border border-gray-100"
                        onClick={() => openViewModal(customer)}
                    >
                        <div className="relative">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full -mr-10 -mt-10 opacity-50" />
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <motion.div
                                            whileHover={{ rotate: 360 }}
                                            transition={{ duration: 0.5 }}
                                            className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center"
                                        >
                                            <UserGroupIcon className="w-6 h-6 text-purple-600" />
                                        </motion.div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800 text-lg">{customer.name}</h3>
                                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                                <SparklesIcon className="w-3 h-3" />
                                                <span>Клиент</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); openEditModal(customer); }}
                                            className="p-1.5 text-yellow-500 hover:bg-yellow-50 rounded-lg transition-all hover:scale-110"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedCustomer(customer); setIsDeleteModalOpen(true); }}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all hover:scale-110"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 mt-3">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <PhoneIcon className="w-4 h-4 text-purple-500" />
                                        <span className="text-sm">{customer.phone}</span>
                                    </div>
                                    {customer.email && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <EnvelopeIcon className="w-4 h-4 text-purple-500" />
                                            <span className="text-sm truncate">{customer.email}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <CalendarIcon className="w-4 h-4 text-purple-500" />
                                        <span className="text-sm">Бронирований: {customer.bookings?.length || 0}</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                                    <span className="text-xs text-purple-500 flex items-center gap-1">
                                        Подробнее <ChevronRightIcon className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {filteredCustomers?.length === 0 && (
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
                        👥
                    </motion.div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Клиенты не найдены</h3>
                    <p className="text-gray-500">Попробуйте изменить параметры поиска</p>
                </motion.div>
            )}

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? '✏️ Редактирование клиента' : '✨ Добавление клиента'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">ФИО *</label>
                        <input
                            id="customerName"
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">Телефон *</label>
                        <input
                            id="customerPhone"
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                            placeholder="+375291653078"
                        />
                    </div>
                    <div>
                        <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            id="customerEmail"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div className="flex gap-3 justify-end pt-4">
                        <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">Отмена</button>
                        <motion.button whileHover={{ scale: 1.02 }} type="submit" className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg shadow-md hover:shadow-lg transition">Сохранить</motion.button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="👤 Информация о клиенте" size="lg">
                {selectedCustomer && (
                    <div className="space-y-4">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring' }}
                                className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3"
                            >
                                <UserGroupIcon className="w-10 h-10 text-white" />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-gray-800">{selectedCustomer.name}</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="text-xs text-gray-500 flex items-center gap-1"><PhoneIcon className="w-3 h-3" /> Телефон</p>
                                <p className="font-medium text-gray-800">{selectedCustomer.phone}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="text-xs text-gray-500 flex items-center gap-1"><EnvelopeIcon className="w-3 h-3" /> Email</p>
                                <p className="font-medium text-gray-800">{selectedCustomer.email || '-'}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl col-span-2">
                                <p className="text-xs text-gray-500 flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> Бронирований</p>
                                <p className="font-medium text-gray-800">{selectedCustomer.bookings?.length || 0}</p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="⚠️ Подтверждение удаления">
                <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800 font-medium">Вы уверены, что хотите удалить клиента "{selectedCustomer?.name}"?</p>
                        <p className="text-sm text-red-600 mt-2">Это действие нельзя отменить.</p>
                    </div>
                    <div className="flex gap-3 justify-end">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Отмена</button>
                        <motion.button whileHover={{ scale: 1.02 }} onClick={() => selectedCustomer && deleteMutation.mutate(selectedCustomer.id)} className="px-4 py-2 bg-red-500 text-white rounded-lg">Удалить</motion.button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminCustomers;