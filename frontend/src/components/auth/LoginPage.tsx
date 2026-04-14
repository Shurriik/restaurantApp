import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { useToast } from '../../hooks/useToast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    EnvelopeIcon,
    LockClosedIcon,
    UserIcon,
    PhoneIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';

const LoginPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { setRole, setUser } = useAuthStore();
    const { showSuccess, showError } = useToast();

    const cleanPhoneNumber = (phone: string): string => {
        return phone.replaceAll(/\D/g, '');
    };

    const formatPhoneWithPlus = (phone: string): string => {
        const cleaned = cleanPhoneNumber(phone);
        if (cleaned.startsWith('375')) {
            return `+${cleaned}`;
        }
        if (cleaned.startsWith('80')) {
            const without8 = cleaned.substring(1);
            return `+${without8}`;
        }
        return `+${cleaned}`;
    };

    const validateBelarusPhone = (phone: string): boolean => {
        const cleaned = cleanPhoneNumber(phone);
        return (cleaned.length === 12 && cleaned.startsWith('375')) ||
            (cleaned.length === 11 && cleaned.startsWith('80'));
    };

    const validateRegistrationForm = (): boolean => {
        if (!formData.name || !formData.phone || !formData.password) {
            showError('Пожалуйста, заполните все поля');
            return false;
        }
        if (!validateBelarusPhone(formData.phone)) {
            showError('Введите корректный белорусский номер телефона (например: +375291655555)');
            return false;
        }
        return true;
    };

    const processLogin = async (): Promise<void> => {
        const loginValue = loginMethod === 'phone' ? formData.phone : formData.email;

        if (!loginValue) {
            showError(`Введите ${loginMethod === 'phone' ? 'номер телефона' : 'email'}`);
            return;
        }

        let loginData = loginValue;
        if (loginMethod === 'phone') {
            loginData = cleanPhoneNumber(loginValue);
        }

        const response = await authService.login({
            email: loginMethod === 'email' ? formData.email : loginData,
            password: formData.password,
        });

        setRole(response.user.role);
        setUser(response.user);
        navigate(response.user.role === 'admin' ? '/admin' : '/user');
    };

    const processRegistration = async (): Promise<void> => {
        if (!validateRegistrationForm()) {
            return;
        }

        const cleanPhone = cleanPhoneNumber(formData.phone);
        const formattedPhone = formatPhoneWithPlus(formData.phone);
        const userEmail = formData.email || `${cleanPhone}@user.com`;

        const response = await authService.register({
            name: formData.name,
            email: userEmail,
            phone: formattedPhone,
            password: formData.password,
        });

        setRole(response.user.role);
        setUser(response.user);
        navigate(response.user.role === 'admin' ? '/admin' : '/user');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                await processLogin();
                showSuccess('Добро пожаловать!');
            } else {
                await processRegistration();
                showSuccess('Регистрация успешна!');
            }
        } catch (error: any) {
            showError(error.message || 'Ошибка авторизации');
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneInput = (value: string): void => {
        let cleaned = value.replaceAll(/\s/g, '');

        if (cleaned.startsWith('+')) {
            const plusIndex = cleaned.indexOf('+');
            const afterPlus = cleaned.substring(plusIndex + 1).replaceAll(/\D/g, '');
            cleaned = `+${afterPlus}`;
        } else {
            const digitsOnly = cleaned.replaceAll(/\D/g, '');
            cleaned = digitsOnly.length > 0 ? `+${digitsOnly}` : '';
        }

        setFormData({ ...formData, phone: cleaned });
    };

    const toggleFormMode = (): void => {
        setIsLogin(!isLogin);
        setFormData({ name: '', email: '', phone: '', password: '' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse-slow delay-1000" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full relative z-10"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="text-center mb-8"
                >
                    <div className="inline-block p-4 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl">
                        <div className="w-20 h-20 bg-gradient-to-br from-white to-white/90 rounded-2xl flex items-center justify-center shadow-2xl">
                            <motion.span
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="text-5xl"
                            >
                                🍽️
                            </motion.span>
                        </div>
                    </div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-bold text-white mt-4"
                    >
                        Restaurant Booking
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-white/80 mt-2"
                    >
                        {isLogin ? 'Войдите в аккаунт' : 'Создайте новый аккаунт'}
                    </motion.p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20"
                >
                    <AnimatePresence mode="wait">
                        <motion.form
                            key={isLogin ? 'login' : 'register'}
                            initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                            transition={{ duration: 0.3 }}
                            onSubmit={handleSubmit}
                            className="space-y-4"
                        >
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label htmlFor="registerName" className="block text-sm font-medium text-white mb-1">Имя и фамилия</label>
                                        <div className="relative group">
                                            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-white transition-colors" />
                                            <input
                                                id="registerName"
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/50 transition-all"
                                                placeholder="Иван Иванов"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="registerPhone" className="block text-sm font-medium text-white mb-1">Телефон</label>
                                        <div className="relative group">
                                            <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-white transition-colors" />
                                            <input
                                                id="registerPhone"
                                                type="tel"
                                                required
                                                value={formData.phone}
                                                onChange={(e) => handlePhoneInput(e.target.value)}
                                                className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/50 transition-all"
                                                placeholder="+375291655555"
                                            />
                                        </div>
                                        <p className="text-xs text-white/50 mt-1">Введите номер в формате: +375291655555</p>
                                    </div>
                                </motion.div>
                            )}

                            {isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-2 mb-4"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setLoginMethod('phone')}
                                        className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                                            loginMethod === 'phone'
                                                ? 'bg-white text-primary-600 shadow-lg'
                                                : 'bg-white/10 text-white hover:bg-white/20'
                                        }`}
                                    >
                                        <PhoneIcon className="w-4 h-4 inline mr-2" />
                                        По телефону
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setLoginMethod('email')}
                                        className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                                            loginMethod === 'email'
                                                ? 'bg-white text-primary-600 shadow-lg'
                                                : 'bg-white/10 text-white hover:bg-white/20'
                                        }`}
                                    >
                                        <EnvelopeIcon className="w-4 h-4 inline mr-2" />
                                        По email
                                    </button>
                                </motion.div>
                            )}

                            {(!isLogin || loginMethod === 'email') && (
                                <div>
                                    <label htmlFor="userEmail" className="block text-sm font-medium text-white mb-1">Email</label>
                                    <div className="relative group">
                                        <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-white transition-colors" />
                                        <input
                                            id="userEmail"
                                            type="email"
                                            required={isLogin && loginMethod === 'email'}
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/50 transition-all"
                                            placeholder="user@example.com"
                                        />
                                    </div>
                                </div>
                            )}

                            {isLogin && loginMethod === 'phone' && (
                                <div>
                                    <label htmlFor="loginPhone" className="block text-sm font-medium text-white mb-1">Телефон</label>
                                    <div className="relative group">
                                        <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-white transition-colors" />
                                        <input
                                            id="loginPhone"
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => handlePhoneInput(e.target.value)}
                                            className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/50 transition-all"
                                            placeholder="+375291655555"
                                        />
                                    </div>
                                    <p className="text-xs text-white/50 mt-1">Введите номер в формате: +375291655555</p>
                                </div>
                            )}

                            <div>
                                <label htmlFor="userPassword" className="block text-sm font-medium text-white mb-1">Пароль</label>
                                <div className="relative group">
                                    <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-white transition-colors" />
                                    <input
                                        id="userPassword"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-10 pr-12 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/50 transition-all"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                                    >
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-white to-gray-100 text-primary-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 group"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {isLogin ? 'Войти' : 'Зарегистрироваться'}
                                        <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </motion.button>
                        </motion.form>
                    </AnimatePresence>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={toggleFormMode}
                            className="text-white/80 hover:text-white text-sm transition-colors"
                        >
                            {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default LoginPage;