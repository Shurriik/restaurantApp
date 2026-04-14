import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { orderService } from '../../services/orderService';
import { useAuthStore } from '../../store/authStore';
import { Order } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';
import {
    TrophyIcon,
    EyeIcon,
    ClockIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const formatPrice = (price: number): string => {
    return price.toFixed(2);
};

const UserOrders: React.FC = () => {
    const { user } = useAuthStore();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const { data: allOrders, isLoading } = useQuery<Order[]>({
        queryKey: ['orders'],
        queryFn: orderService.getAll,
    });

    const orders = allOrders?.filter(order => order.userId === user?.id) || [];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100 } }
    };

    const handleNavigateToMenu = (): void => {
        if (globalThis.window !== undefined) {
            globalThis.window.location.href = '/user/menu';
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
                        <h1 className="text-2xl font-bold">Мои заказы</h1>
                        <p className="text-white/80">Всего заказов: {orders.length}</p>
                    </div>
                </div>
            </motion.div>

            {orders.length > 0 ? (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                >
                    {orders.map((order) => (
                        <motion.div
                            key={order.id}
                            variants={itemVariants}
                            whileHover={{ y: -5, scale: 1.01 }}
                            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
                        >
                            <div className="p-6">
                                <div className="flex flex-wrap justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                                            <h3 className="text-lg font-semibold text-gray-800">Заказ #{order.id}</h3>
                                            <span className="text-sm text-gray-500">
                                                {new Date(order.orderTime).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <ClockIcon className="w-4 h-4 text-orange-500" />
                                                <span className="text-sm">{new Date(order.orderTime).toLocaleTimeString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <CurrencyDollarIcon className="w-4 h-4 text-orange-500" />
                                                <span className="text-sm font-semibold">{formatPrice(order.totalAmount)} BYN</span>
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <p className="text-sm text-gray-500">Состав заказа:</p>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {order.orderItems?.slice(0, 3).map((item) => (
                                                    <span key={item.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                        {item.menuItem.name} x{item.quantity}
                                                    </span>
                                                ))}
                                                {order.orderItems && order.orderItems.length > 3 && (
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                        +{order.orderItems.length - 3} еще
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setSelectedOrder(order);
                                            setIsViewModalOpen(true);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        <EyeIcon className="w-5 h-5" />
                                        Детали
                                    </button>
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
                        🛒
                    </motion.div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Нет заказов</h3>
                    <p className="text-gray-500 mb-4">У вас пока нет заказов</p>
                    <button
                        onClick={handleNavigateToMenu}
                        className="btn-primary"
                    >
                        ✨ Перейти в меню
                    </button>
                </motion.div>
            )}

            {/* Modal for order details */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title={`Заказ #${selectedOrder?.id}`}
                size="lg"
            >
                {selectedOrder && (
                    <div className="space-y-4">
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
                            <div className="grid grid-cols-2 gap-3">
                                <p><strong>📅 Дата:</strong> {new Date(selectedOrder.orderTime).toLocaleDateString()}</p>
                                <p><strong>⏰ Время:</strong> {new Date(selectedOrder.orderTime).toLocaleTimeString()}</p>
                                <p><strong>💰 Сумма:</strong> {formatPrice(selectedOrder.totalAmount)} BYN</p>
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

export default UserOrders;