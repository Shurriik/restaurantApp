import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { menuService } from '../../services/menuService';
import { bookingService } from '../../services/bookingService';
import { MenuItem, Booking, Tag } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../common/LoadingSpinner';
import {
    MagnifyingGlassIcon,
    ShoppingCartIcon,
    ExclamationTriangleIcon,
    StarIcon,
    FireIcon,
    HeartIcon,
    TrophyIcon,
} from '@heroicons/react/24/outline';

import dranikiImg from '../../assets/draniki.png';
import mushroomSoupImg from '../../assets/mushroom-soup.png';
import beefStroganoffImg from '../../assets/beef-stroganoff.png';
import chickenKievImg from '../../assets/chicken-kiev.png';
import borschtImg from '../../assets/borscht.png';
import varenikiImg from '../../assets/vareniki.png';
import golubtsyImg from '../../assets/golubtsy.png';
import koldunyImg from '../../assets/kolduny.png';
import machankaImg from '../../assets/machanka.png';
import kuleshImg from '../../assets/kulesh.png';
import nalesnikiImg from '../../assets/nalesniki.png';
import pyachystaImg from '../../assets/pyachysta.png';
import ukhaImg from '../../assets/ukha.png';
import kletskiImg from '../../assets/kletski.png';
import zrazyImg from '../../assets/zrazy.png';
import babkaImg from '../../assets/babka.png';
import sbitenImg from '../../assets/sbiten.png';
import krambambulaImg from '../../assets/krambambula.png';
import kompotImg from '../../assets/kompot.png';
import kvasImg from '../../assets/kvas.png';

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

const formatPrice = (price: number): string => {
    return price.toFixed(2);
};

const foodImageMap: Record<string, string> = {
    'Драники со сметаной': dranikiImg,
    'Грибной суп': mushroomSoupImg,
    'Бефстроганов': beefStroganoffImg,
    'Котлета по-киевски': chickenKievImg,
    'Борщ с пампушкой': borschtImg,
    'Вареники с картошкой': varenikiImg,
    'Голубцы': golubtsyImg,
    'Колдуны с мясом': koldunyImg,
    'Мачанка с блинами': machankaImg,
    'Кулеш пшенный': kuleshImg,
    'Налистники с творогом': nalesnikiImg,
    'Пячиста свиные ребра': pyachystaImg,
    'Уха': ukhaImg,
    'Клецки с мясом': kletskiImg,
    'Зразы с грибами': zrazyImg,
    'Картофельная бабка': babkaImg,
    'Сбитень медовый': sbitenImg,
    'Крамбамбуля': krambambulaImg,
    'Компот ассорти': kompotImg,
    'Квас домашний': kvasImg,
};

const defaultFoodImage = dranikiImg;

const getFoodImage = (name: string): string => {
    return foodImageMap[name] || defaultFoodImage;
};

const foodDescriptions: Record<string, string> = {
    'Драники со сметаной': 'Хрустящие картофельные драники по-белорусски, подаются с домашней сметаной',
    'Грибной суп': 'Ароматный суп из лесных грибов с домашней лапшой',
    'Бефстроганов': 'Нежная говядина в сметанном соусе с луком',
    'Котлета по-киевски': 'Сочная куриная котлета с маслом внутри, хрустящая корочка',
    'Борщ с пампушкой': 'Наваристый красный борщ с чесночной пампушкой',
    'Вареники с картошкой': 'Домашние вареники с картофелем и жареным луком',
    'Голубцы': 'Капустные рулетики с мясом и рисом в томатном соусе',
    'Колдуны с мясом': 'Картофельные оладьи с мясной начинкой',
    'Мачанка с блинами': 'Традиционное белорусское блюдо из мяса с толстыми блинами',
    'Кулеш пшенный': 'Наваристый суп с пшеном и шкварками',
    'Налистники с творогом': 'Тонкие блинчики с нежной творожной начинкой',
    'Пячиста свиные ребра': 'Запеченные свиные ребра по-белорусски с травами',
    'Уха': 'Наваристый рыбный суп из свежей речной рыбы',
    'Клецки с мясом': 'Картофельные клецки с мясной начинкой в сметанном соусе',
    'Зразы с грибами': 'Картофельные зразы с грибной начинкой',
    'Картофельная бабка': 'Запеченная картофельная запеканка с мясом',
    'Сбитень медовый': 'Традиционный горячий напиток из меда и пряностей',
    'Крамбамбуля': 'Белорусский медовый напиток с пряностями',
    'Компот ассорти': 'Домашний компот из сухофруктов и ягод',
    'Квас домашний': 'Освежающий домашний квас по старинному рецепту',
};

const getDescription = (name: string): string => {
    return foodDescriptions[name] || 'Традиционное белорусское блюдо';
};

const getTagDisplayName = (tagName: string): string => {
    if (tagName === 'MAIN_HALL') return 'Основной зал';
    if (tagName === 'TERRACE') return 'Терраса';
    if (tagName === 'VIP_ROOM') return 'VIP зал';
    return tagName;
};


const badges = [
    { text: 'Рекомендуем', icon: <StarIcon className="w-3 h-3" />, color: 'bg-yellow-100 text-yellow-700' },
    { text: 'Фирменное блюдо', icon: <TrophyIcon className="w-3 h-3" />, color: 'bg-purple-100 text-purple-700' },
    { text: 'Хит продаж', icon: <FireIcon className="w-3 h-3" />, color: 'bg-red-100 text-red-700' },
    { text: 'Комплимент от шефа', icon: <HeartIcon className="w-3 h-3" />, color: 'bg-pink-100 text-pink-700' },
];

const getBadgeByIndex = (index: number) => {
    return badges[index % badges.length];
};

const UserMenu: React.FC = () => {
    const { user } = useAuthStore();
    const { showSuccess, showError } = useToast();
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
    const [isBookingSelectOpen, setIsBookingSelectOpen] = useState<boolean>(false);
    const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 100 });
    const [hoveredItem, setHoveredItem] = useState<number | null>(null);

    const { data: menuItems, isLoading } = useQuery<MenuItem[]>({
        queryKey: ['menu'],
        queryFn: menuService.getAllMenuItems,
    });

    const { data: allBookings } = useQuery<Booking[]>({
        queryKey: ['userBookings'],
        queryFn: bookingService.getAll,
    });

    const activeBookings = allBookings?.filter((booking: Booking) =>
        (booking.customer.phone === user?.phone || booking.customer.email === user?.email) &&
        new Date(booking.endTime) > new Date()
    ) || [];

    const transformedMenu = menuItems?.map((item: MenuItem, idx: number) => ({
        ...item,
        name: item.name,
        priceBYN: item.price,
        image: item.image || getFoodImage(item.name),
        description: item.description || getDescription(item.name),
        badge: getBadgeByIndex(idx)
    })) || [];

    if (isLoading) return <LoadingSpinner />;

    const addToCart = (item: any): void => {
        if (activeBookings.length === 0) {
            showError('Сначала забронируйте столик!');
            return;
        }
        setCart((prev: CartItem[]) => {
            const existing = prev.find((i: CartItem) => i.id === item.id);
            if (existing) {
                return prev.map((i: CartItem) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { id: item.id, name: item.name, price: item.priceBYN, quantity: 1, image: item.image }];
        });
        showSuccess(`${item.name} добавлено в корзину!`);
    };

    const removeFromCart = (itemId: number): void => {
        setCart((prev: CartItem[]) => prev.filter((i: CartItem) => i.id !== itemId));
    };

    const updateQuantity = (itemId: number, quantity: number): void => {
        if (quantity <= 0) {
            removeFromCart(itemId);
        } else {
            setCart((prev: CartItem[]) => prev.map((i: CartItem) => i.id === itemId ? { ...i, quantity } : i));
        }
    };

    const proceedToCheckout = (): void => {
        if (cart.length === 0) {
            showError('Корзина пуста');
            return;
        }

        if (activeBookings.length === 1) {
            void createOrder(activeBookings[0].id);
        } else if (activeBookings.length > 1) {
            setIsBookingSelectOpen(true);
        } else {
            showError('У вас нет активных бронирований. Сначала забронируйте столик!');
        }
    };

    const createOrder = async (bookingId: number): Promise<void> => {
        const total = cart.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
        showSuccess(`Заказ оформлен! Сумма: ${formatPrice(total)} BYN. Бронирование #${bookingId}`);
        setCart([]);
        setIsCartOpen(false);
        setIsBookingSelectOpen(false);
    };

    const handleCreateOrder = (bookingId: number): void => {
        void createOrder(bookingId);
    };

    const totalCartItems = cart.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);

    const filteredItems = transformedMenu?.filter((item: any) => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPrice = item.priceBYN >= priceRange.min && item.priceBYN <= priceRange.max;
        return matchesSearch && matchesPrice;
    });

    return (
        <div className="relative min-h-screen overflow-x-hidden">
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50" />
            </div>

            <div className="relative z-10 space-y-6">
                {}
                <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 rounded-2xl p-5 text-white shadow-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <span className="text-2xl">🍽️</span>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">Наше меню</h1>
                                    <p className="text-white/80 text-sm">Традиционная белорусская кухня</p>
                                </div>
                            </div>
                            {activeBookings.length === 0 && (
                                <div className="mt-2 flex items-center gap-2 bg-yellow-500/30 text-yellow-100 px-2 py-1 rounded-lg text-xs">
                                    <ExclamationTriangleIcon className="w-3 h-3" />
                                    Для заказа блюд необходимо активное бронирование
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative bg-white/20 backdrop-blur p-2 rounded-xl hover:bg-white/30 transition-all"
                        >
                            <ShoppingCartIcon className="w-6 h-6 text-white" />
                            {totalCartItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {totalCartItems}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {}
                <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-4 border border-white/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Поиск блюд..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Мин. цена"
                                value={priceRange.min || ''}
                                onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) || 0 }))}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            />
                            <input
                                type="number"
                                placeholder="Макс. цена"
                                value={priceRange.max || ''}
                                onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) || 100 }))}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            />
                        </div>
                    </div>
                </div>

                {filteredItems && filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((item: any) => (
                            <div
                                key={item.id}
                                onMouseEnter={() => setHoveredItem(item.id)}
                                onMouseLeave={() => setHoveredItem(null)}
                                className="relative group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                            >
                                <div className="relative h-48 overflow-hidden bg-gray-200">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = defaultFoodImage;
                                        }}
                                    />
                                    {hoveredItem === item.id && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/80 to-red-600/80 flex items-center justify-center">
                                            <button
                                                onClick={() => addToCart(item)}
                                                className="px-5 py-2 bg-white rounded-lg font-semibold text-orange-600 shadow-md text-sm"
                                            >
                                                🛒 В корзину
                                            </button>
                                        </div>
                                    )}

                                    {}
                                    <div className="absolute top-2 left-2">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${item.badge.color} shadow-md`}>
                                            {item.badge.icon} {item.badge.text}
                                        </span>
                                    </div>

                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-orange-600 shadow-md">
                                        {formatPrice(item.priceBYN)} BYN
                                    </div>
                                </div>

                                <div className="p-4">
                                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                                        {item.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>

                                    {}
                                    {item.tags && item.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {item.tags.map((tag: Tag) => (
                                                <span
                                                    key={tag.id}
                                                    className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full"
                                                >
                                                    {getTagDisplayName(tag.name)}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => addToCart(item)}
                                        disabled={activeBookings.length === 0}
                                        className={`mt-3 w-full py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm ${
                                            activeBookings.length > 0
                                                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow hover:shadow-md'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        <ShoppingCartIcon className="w-4 h-4" />
                                        В корзину
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <div className="text-6xl mb-3">🍽️</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">Блюда не найдены</h3>
                        <p className="text-sm text-gray-500">Попробуйте изменить параметры поиска</p>
                    </div>
                )}

                {}
                {isCartOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="bg-white rounded-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden shadow-xl">
                            <div className="p-4 bg-gradient-to-r from-orange-500 to-red-600 text-white flex justify-between items-center">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <ShoppingCartIcon className="w-5 h-5" /> Корзина
                                </h2>
                                <button onClick={() => setIsCartOpen(false)} className="p-1 hover:bg-white/20 rounded-lg">✕</button>
                            </div>

                            <div className="p-4 overflow-y-auto max-h-80">
                                {cart.length === 0 ? (
                                    <div className="text-center py-6">
                                        <div className="text-5xl mb-3">🛒</div>
                                        <p className="text-gray-500 text-sm">Корзина пуста</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {cart.map((item) => (
                                            <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                                                    <p className="text-xs text-orange-600">{formatPrice(item.price)} BYN</p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-0.5 bg-gray-200 rounded hover:bg-gray-300 text-sm">-</button>
                                                    <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-0.5 bg-gray-200 rounded hover:bg-gray-300 text-sm">+</button>
                                                    <button onClick={() => removeFromCart(item.id)} className="px-2 py-0.5 text-red-500 hover:bg-red-50 rounded text-sm">🗑️</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {cart.length > 0 && (
                                <div className="p-4 border-t border-gray-100">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="font-semibold text-gray-800 text-sm">Итого:</span>
                                        <span className="text-xl font-bold text-orange-600">{formatPrice(totalPrice)} BYN</span>
                                    </div>
                                    <button
                                        onClick={proceedToCheckout}
                                        className="w-full py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold text-sm"
                                    >
                                        Оформить заказ
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {}
                {isBookingSelectOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="bg-white rounded-xl max-w-md w-full mx-4 overflow-hidden shadow-xl">
                            <div className="p-4 bg-gradient-to-r from-orange-500 to-red-600 text-white">
                                <h2 className="text-lg font-bold">Выберите бронирование</h2>
                            </div>
                            <div className="p-4 space-y-2">
                                {activeBookings.map((booking) => (
                                    <button
                                        key={booking.id}
                                        onClick={() => handleCreateOrder(booking.id)}
                                        className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors"
                                    >
                                        <p className="font-semibold text-gray-800 text-sm">Бронирование #{booking.id}</p>
                                        <p className="text-xs text-gray-500">Стол #{booking.table.number} • {booking.numberOfGuests} гостей</p>
                                        <p className="text-xs text-gray-500">{new Date(booking.startTime).toLocaleString()}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserMenu;