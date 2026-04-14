import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';
import {
    EyeIcon,
    TrophyIcon,
    ShoppingBagIcon,
    UserIcon,
    TableCellsIcon,
    CurrencyDollarIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

const formatPrice = (price: number): string => {
    return price.toFixed(2);
};

const AdminOrders: React.FC = () => {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const { data: orders, isLoading } = useQuery<Order[]>({
        queryKey: ['adminOrders'],
        queryFn: orderService.getAll,
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100 } }
    };

    if (isLoading) return <LoadingSpinner />;

    const totalRevenue = orders?.reduce((sum, order) => sum + order.totalAmount, 0) || 0;

    return (
        <div className="space-y-6 animate-fade-in">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-2xl"
            >
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <TrophyIcon className="w-8 h-8 text-yellow-300 animate-bounce" />
                        <div>
                            <h1 className="text-2xl font-bold">Управление заказами</h1>
                            <p className="text-white/80">Всего заказов: {orders?.length || 0}</p>
                        </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2">
                        <p className="text-sm">Общая выручка</p>
                        <p className="text-xl font-bold">{formatPrice(totalRevenue)} BYN</p>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-3 text-white text-center">
                    <p className="text-xs">Всего заказов</p>
                    <p className="text-2xl font-bold">{orders?.length || 0}</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-3 text-white text-center">
                    <p className="text-xs">Средний чек</p>
                    <p className="text-2xl font-bold">{orders?.length ? formatPrice(totalRevenue / orders.length) : 0} BYN</p>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-3 text-white text-center">
                    <p className="text-xs">Общая выручка</p>
                    <p className="text-2xl font-bold">{formatPrice(totalRevenue)} BYN</p>
                </div>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
            >
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <ShoppingBagIcon className="w-5 h-5 text-purple-500" />
                    Все заказы
                </h2>
                {orders?.map((order) => (
                    <motion.div
                        key={order.id}
                        variants={itemVariants}
                        whileHover={{ y: -3, scale: 1.01 }}
                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all"
                    >
                        <div className="p-6">
                            <div className="flex flex-wrap justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <h3 className="text-lg font-semibold text-gray-800">Заказ #{order.id}</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                                        <p className="text-sm text-gray-500 flex items-center gap-1"><UserIcon className="w-4 h-4" /> {order.booking?.customer?.name || 'Неизвестен'}</p>
                                        <p className="text-sm text-gray-500 flex items-center gap-1"><TableCellsIcon className="w-4 h-4" /> Стол #{order.booking?.table?.number || '?'}</p>
                                        <p className="text-sm text-gray-500 flex items-center gap-1"><CurrencyDollarIcon className="w-4 h-4" /> {formatPrice(order.totalAmount)} BYN</p>
                                        <p className="text-sm text-gray-500 flex items-center gap-1 col-span-2"><ClockIcon className="w-4 h-4" /> {new Date(order.orderTime).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setSelectedOrder(order); setIsViewModalOpen(true); }}
                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                                    >
                                        <EyeIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {orders?.length === 0 && (
                    <div className="bg-gray-50 rounded-xl p-8 text-center">
                        <ShoppingBagIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Нет заказов</p>
                    </div>
                )}
            </motion.div>

            {}
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Заказ #${selectedOrder?.id}`} size="lg">
                {selectedOrder && (
                    <div className="space-y-4">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                            <div className="grid grid-cols-2 gap-3">
                                <p><strong>👤 Клиент:</strong> {selectedOrder.booking?.customer?.name}</p>
                                <p><strong>📞 Телефон:</strong> {selectedOrder.booking?.customer?.phone}</p>
                                <p><strong>🍽️ Столик:</strong> #{selectedOrder.booking?.table?.number}</p>
                                <p><strong>📅 Дата заказа:</strong> {new Date(selectedOrder.orderTime).toLocaleString()}</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Состав заказа:</h4>
                            <div className="space-y-2">
                                {selectedOrder.orderItems?.map(item => (
                                    <div key={item.id} className="flex justify-between py-2 border-b">
                                        <span>{item.menuItem.name} x{item.quantity}</span>
                                        <span>{formatPrice(item.totalPrice)} BYN</span>
                                    </div>
                                ))}
                                <div className="flex justify-between pt-2 font-bold">
                                    <span>Итого:</span>
                                    <span>{formatPrice(selectedOrder.totalAmount)} BYN</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminOrders;