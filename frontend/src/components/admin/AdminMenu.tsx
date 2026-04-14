    import React, { useState, useRef } from 'react';
    import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
    import { motion } from 'framer-motion';
    import { menuService } from '../../services/menuService';
    import { MenuItem, MenuItemRequest, Tag } from '../../types';
    import { useToast } from '../../hooks/useToast';
    import LoadingSpinner from '../common/LoadingSpinner';
    import Modal from '../common/Modal';
    import {
        PlusIcon,
        PencilIcon,
        TrashIcon,
        CheckIcon,
        StarIcon,
        FireIcon,
        HeartIcon,
        TrophyIcon,
        XMarkIcon,
        CloudArrowUpIcon,
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
    
    const getFoodDescription = (name: string): string => {
        return foodDescriptions[name] || 'Традиционное белорусское блюдо';
    };
    
    const formatPrice = (price: number): string => {
        return price.toFixed(2);
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
    
    interface MenuItemCardProps {
        item: {
            id: number;
            name: string;
            displayImage: string;
            displayPrice: string;
            displayDescription: string;
            tags?: Tag[];
        };
        badge: { text: string; icon: JSX.Element; color: string };
        onEdit: (item: any) => void;
        onDelete: (item: any) => void;
    }
    
    const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, badge, onEdit, onDelete }) => {
        return (
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
                }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden group transition-all duration-300"
            >
                <div className="relative h-48 overflow-hidden bg-gray-200">
                    <img
                        src={item.displayImage}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                            console.error(`Failed to load image for ${item.name}`);
                            (e.target as HTMLImageElement).src = defaultFoodImage;
                        }}
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-sm font-bold text-purple-600 shadow-md">
                        {item.displayPrice} BYN
                    </div>
                    <div className="absolute top-2 left-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${badge.color} shadow-md`}>
                {badge.icon} {badge.text}
              </span>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                </div>
    
                <div className="p-5">
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                            {item.name}
                        </h3>
                        <div className="flex gap-1">
                            <button
                                onClick={() => onEdit(item)}
                                className="p-1.5 text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors"
                                title="Редактировать"
                            >
                                <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onDelete(item)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Удалить"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
    
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.displayDescription}</p>
    
                    {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                            {item.tags.map((tag: Tag) => (
                                <span key={tag.id} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                    {getTagDisplayName(tag.name)}
                  </span>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };
    
    interface MenuFormProps {
        formData: {
            name: string;
            price: number;
            tagIds: number[];
            imageUrl: string;
            description: string;
            imageFile?: File | null;
        };
        editingId: number | null;
        tags?: Tag[];
        previewImage: string;
        onNameChange: (name: string) => void;
        onPriceChange: (value: string) => void;
        onImageFileChange: (file: File | null) => void;
        onImageUrlChange: (url: string) => void;
        onDescriptionChange: (description: string) => void;
        onTagToggle: (tagId: number) => void;
        onClearImage: () => void;
        onSubmit: (e: React.FormEvent) => void;
        onCancel: () => void;
        isPending: boolean;
    }
    
    const MenuForm: React.FC<MenuFormProps> = ({
                                                   formData,
                                                   editingId,
                                                   tags,
                                                   previewImage,
                                                   onNameChange,
                                                   onPriceChange,
                                                   onImageFileChange,
                                                   onImageUrlChange,
                                                   onDescriptionChange,
                                                   onTagToggle,
                                                   onClearImage,
                                                   onSubmit,
                                                   onCancel,
                                                   isPending
                                               }) => {
        const fileInputRef = useRef<HTMLInputElement>(null);
    
        const getButtonText = () => {
            if (isPending) return 'Сохранение...';
            if (editingId) return 'Обновить';
            return 'Создать';
        };
    
        const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                if (!file.type.startsWith('image/')) {
                    alert('Пожалуйста, выберите изображение');
                    return;
                }
                if (file.size > 5 * 1024 * 1024) {
                    alert('Размер изображения не должен превышать 5MB');
                    return;
                }
                onImageFileChange(file);
            }
        };
    
        return (
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label htmlFor="foodName" className="block text-sm font-medium text-gray-700 mb-1">Название блюда *</label>
                    <input
                        id="foodName"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => onNameChange(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Например: Драники со сметаной"
                    />
                </div>
    
                <div>
                    <label htmlFor="foodPrice" className="block text-sm font-medium text-gray-700 mb-1">Цена (BYN) *</label>
                    <input
                        id="foodPrice"
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => onPriceChange(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0.00"
                    />
                </div>
    
                {/* Загрузка изображения - новый блок */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Изображение блюда</label>
    
                    <div className="space-y-3">
                        {/* Загрузка из файла */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-purple-500 transition-colors">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center gap-2">
                                    <CloudArrowUpIcon className="w-6 h-6 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Загрузить из файла</p>
                                        <p className="text-xs text-gray-400">PNG, JPG до 5MB</p>
                                    </div>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label
                                    htmlFor="image-upload"
                                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors text-sm"
                                >
                                    Выбрать файл
                                </label>
                            </div>
                        </div>
    
                        {/* Или URL фото */}
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Или укажите URL фото</p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.imageUrl || ''}
                                    onChange={(e) => onImageUrlChange(e.target.value)}
                                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="https://images.pexels.com/..."
                                />
                                {previewImage && (
                                    <button
                                        type="button"
                                        onClick={onClearImage}
                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Если не указывать, будет использовано фото по умолчанию.</p>
                        </div>
                    </div>
    
                    {/* Превью изображения */}
                    {previewImage && (
                        <div className="mt-3">
                            <p className="text-xs text-gray-500 mb-1">Предпросмотр:</p>
                            <img
                                src={previewImage}
                                alt="Preview"
                                className="w-24 h-24 object-cover rounded-lg shadow border border-gray-200"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = defaultFoodImage;
                                }}
                            />
                        </div>
                    )}
                </div>
    
                <div>
                    <label htmlFor="foodDescription" className="block text-sm font-medium text-gray-700 mb-1">Описание блюда</label>
                    <textarea
                        id="foodDescription"
                        value={formData.description || ''}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows={3}
                        placeholder="Краткое описание блюда..."
                    />
                </div>
    
                <div>
                    <span className="block text-sm font-medium text-gray-700 mb-2">Теги</span>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                        {tags?.map((tag: Tag) => {
                            const isSelected = formData.tagIds.includes(tag.id);
                            return (
                                <button
                                    type="button"
                                    key={tag.id}
                                    onClick={() => onTagToggle(tag.id)}
                                    className={`px-3 py-1 rounded-full text-sm transition-all flex items-center gap-1 ${
                                        isSelected
                                            ? 'bg-purple-500 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {isSelected && <CheckIcon className="w-3 h-3" />}
                                    {getTagDisplayName(tag.name)}
                                </button>
                            );
                        })}
                    </div>
                </div>
    
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">Отмена</button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        type="submit"
                        disabled={isPending}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg shadow-md hover:shadow-lg transition disabled:opacity-50"
                    >
                        {getButtonText()}
                    </motion.button>
                </div>
            </form>
        );
    };
    
    const AdminMenu: React.FC = () => {
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
        const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
        const [formData, setFormData] = useState({
            name: '',
            price: 0,
            tagIds: [] as number[],
            imageUrl: '',
            description: '',
            imageFile: null as File | null,
        });
        const [editingId, setEditingId] = useState<number | null>(null);
        const [previewImage, setPreviewImage] = useState<string>('');
        const { showSuccess, showError } = useToast();
        const queryClient = useQueryClient();
    
        const { data: menuItems, isLoading } = useQuery<MenuItem[]>({
            queryKey: ['adminMenu'],
            queryFn: menuService.getAllMenuItems,
            refetchInterval: 5000
        });
    
        const { data: tags } = useQuery<Tag[]>({
            queryKey: ['tags'],
            queryFn: menuService.getAllTags
        });
    
        const invalidateMenu = () => {
            queryClient.invalidateQueries({ queryKey: ['adminMenu'] }).catch(console.error);
        };
    
        const createMutation = useMutation({
            mutationFn: menuService.createMenuItem,
            onSuccess: () => {
                invalidateMenu();
                showSuccess('✨ Блюдо создано');
                closeModal();
            },
            onError: (error: Error) => showError(error.message)
        });
    
        const updateMutation = useMutation({
            mutationFn: ({ id, data }: { id: number; data: MenuItemRequest }) => menuService.updateMenuItem(id, data),
            onSuccess: () => {
                invalidateMenu();
                showSuccess('✨ Блюдо обновлено');
                closeModal();
            },
            onError: (error: Error) => showError(error.message)
        });
    
        const deleteMutation = useMutation({
            mutationFn: menuService.deleteMenuItem,
            onSuccess: () => {
                invalidateMenu();
                showSuccess('✨ Блюдо удалено');
                setIsDeleteModalOpen(false);
            },
            onError: (error: Error) => showError(error.message)
        });
    
        const openCreateModal = () => {
            setEditingId(null);
            setFormData({ name: '', price: 0, tagIds: [], imageUrl: '', description: '', imageFile: null });
            setPreviewImage('');
            setIsModalOpen(true);
        };
    
        const openEditModal = (item: MenuItem) => {
            setEditingId(item.id);
            setFormData({
                name: item.name,
                price: item.price,
                tagIds: item.tags.map(t => t.id),
                imageUrl: item.image || getFoodImage(item.name),
                description: item.description || getFoodDescription(item.name),
                imageFile: null,
            });
            setPreviewImage(item.image || getFoodImage(item.name));
            setIsModalOpen(true);
        };
    
        const closeModal = () => {
            setIsModalOpen(false);
            setEditingId(null);
        };
    
        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
    
            if (formData.imageFile) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const submitData = {
                        name: formData.name,
                        price: formData.price,
                        tagIds: formData.tagIds,
                        image: reader.result as string,
                        description: formData.description || getFoodDescription(formData.name)
                    };
                    if (editingId) {
                        updateMutation.mutate({ id: editingId, data: submitData });
                    } else {
                        createMutation.mutate(submitData);
                    }
                };
                reader.readAsDataURL(formData.imageFile);
            } else {
                const submitData = {
                    name: formData.name,
                    price: formData.price,
                    tagIds: formData.tagIds,
                    image: formData.imageUrl || getFoodImage(formData.name),
                    description: formData.description || getFoodDescription(formData.name)
                };
                if (editingId) {
                    updateMutation.mutate({ id: editingId, data: submitData });
                } else {
                    createMutation.mutate(submitData);
                }
            }
        };
    
        const toggleTag = (tagId: number) => {
            setFormData(prev => {
                const hasTag = prev.tagIds.includes(tagId);
                if (hasTag) {
                    return { ...prev, tagIds: prev.tagIds.filter(id => id !== tagId) };
                }
                return { ...prev, tagIds: [...prev.tagIds, tagId] };
            });
        };
    
        const handleNameChange = (name: string) => {
            const autoImage = getFoodImage(name);
            const autoDescription = getFoodDescription(name);
            setFormData(prev => ({
                ...prev,
                name,
                imageUrl: prev.imageUrl || autoImage,
                description: prev.description || autoDescription
            }));
            if (!formData.imageUrl && !formData.imageFile) {
                setPreviewImage(autoImage);
            }
        };
    
        const handlePriceChange = (value: string) => {
            const parsedValue = Number.parseFloat(value);
            const newPrice = Number.isNaN(parsedValue) ? 0 : parsedValue;
            setFormData(prev => ({ ...prev, price: newPrice }));
        };
    
        const handleImageFileChange = (file: File | null) => {
            if (file) {
                const previewUrl = URL.createObjectURL(file);
                setPreviewImage(previewUrl);
                setFormData(prev => ({ ...prev, imageFile: file, imageUrl: '' }));
            }
        };
    
        const handleImageUrlChange = (url: string) => {
            setFormData(prev => ({ ...prev, imageUrl: url, imageFile: null }));
            setPreviewImage(url);
        };
    
        const handleClearImage = () => {
            setFormData(prev => ({ ...prev, imageUrl: '', imageFile: null }));
            setPreviewImage('');
        };
    
        const handleDescriptionChange = (description: string) => {
            setFormData(prev => ({ ...prev, description }));
        };
    
        const containerVariants = {
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
        };
    
        if (isLoading) return <LoadingSpinner />;
    
        const displayMenuItems = menuItems?.map((item: MenuItem) => ({
            ...item,
            displayImage: item.image || getFoodImage(item.name),
            displayPrice: formatPrice(item.price),
            displayDescription: item.description || getFoodDescription(item.name)
        }));
    
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
                                <h1 className="text-2xl font-bold">Управление меню</h1>
                                <p className="text-white/80">Всего блюд: {displayMenuItems?.length || 0}</p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={openCreateModal}
                            className="flex items-center gap-2 bg-white text-purple-600 px-4 py-2 rounded-xl font-semibold hover:bg-gray-100"
                        >
                            <PlusIcon className="w-5 h-5" /> Добавить блюдо
                        </motion.button>
                    </div>
                </motion.div>
    
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {displayMenuItems?.map((item, idx) => (
                        <MenuItemCard
                            key={item.id}
                            item={item}
                            badge={getBadgeByIndex(idx)}
                            onEdit={openEditModal}
                            onDelete={(item) => {
                                setSelectedItem(item);
                                setIsDeleteModalOpen(true);
                            }}
                        />
                    ))}
                </motion.div>
    
                {displayMenuItems?.length === 0 && (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <div className="text-6xl mb-4 animate-bounce">🍽️</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Нет блюд в меню</h3>
                        <p className="text-gray-500 mb-4">Добавьте первое блюдо в меню</p>
                        <button onClick={openCreateModal} className="bg-gradient-to-r from-primary-500 to-primary-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                            Добавить блюдо
                        </button>
                    </div>
                )}
    
                <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? 'Редактирование блюда' : 'Добавление блюда'} size="lg">
                    <MenuForm
                        formData={formData}
                        editingId={editingId}
                        tags={tags}
                        previewImage={previewImage}
                        onNameChange={handleNameChange}
                        onPriceChange={handlePriceChange}
                        onImageFileChange={handleImageFileChange}
                        onImageUrlChange={handleImageUrlChange}
                        onDescriptionChange={handleDescriptionChange}
                        onTagToggle={toggleTag}
                        onClearImage={handleClearImage}
                        onSubmit={handleSubmit}
                        onCancel={closeModal}
                        isPending={createMutation.isPending || updateMutation.isPending}
                    />
                </Modal>
    
                <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Подтверждение удаления">
                    <div className="space-y-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800 font-medium">Вы уверены, что хотите удалить блюдо "{selectedItem?.name}"?</p>
                            <p className="text-sm text-red-600 mt-2">Это действие нельзя отменить.</p>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Отмена</button>
                            <motion.button whileHover={{ scale: 1.02 }} onClick={() => selectedItem && deleteMutation.mutate(selectedItem.id)} className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:shadow-lg">Удалить</motion.button>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    };
    
    export default AdminMenu;