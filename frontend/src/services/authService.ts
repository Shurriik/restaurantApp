import { LoginRequest, RegisterRequest, AuthResponse, User } from '../types';

const USERS_KEY = 'restaurant_users';
const CURRENT_USER_KEY = 'restaurant_current_user';

interface StoredUser extends User {
    password?: string;
}

const getStoredUsers = (): StoredUser[] => {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    } catch (error) {
        console.error('Failed to parse users from localStorage:', error);
        return [];
    }
};

const saveUsers = (users: StoredUser[]): void => {
    try {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (error) {
        console.error('Failed to save users to localStorage:', error);
        throw new Error('Ошибка при сохранении данных пользователя');
    }
};

const generateToken = (user: User): string => {
    return btoa(JSON.stringify({
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role
    }));
};

const saveCurrentUser = (token: string, user: User): void => {
    try {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ token, user }));
    } catch (error) {
        console.error('Failed to save current user:', error);
        throw new Error('Ошибка при сохранении сессии');
    }
};

export const authService = {
    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const existingUsers = getStoredUsers();

        if (existingUsers.some((u: StoredUser) => u.email === data.email)) {
            throw new Error('Пользователь с таким email уже существует');
        }

        const newUser: User = {
            id: Date.now(),
            name: data.name,
            email: data.email,
            phone: data.phone,
            role: 'user',
            createdAt: new Date().toISOString(),
        };

        existingUsers.push(newUser);
        saveUsers(existingUsers);

        const token = generateToken(newUser);
        saveCurrentUser(token, newUser);

        return { token, user: newUser };
    },

    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const users = getStoredUsers();

        const user = users.find((u: StoredUser) =>
            u.email === data.email || u.phone === data.email
        );

        if (!user) {
            throw new Error('Неверный email/телефон или пароль');
        }

        const token = generateToken(user);
        saveCurrentUser(token, user);

        return { token, user };
    },

    logout: (): void => {
        try {
            localStorage.removeItem(CURRENT_USER_KEY);
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    },
};
