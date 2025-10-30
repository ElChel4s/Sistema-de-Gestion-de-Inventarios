import { atom } from 'jotai';
import { generateId } from '../lib/utils';

export type UserRole = 'admin' | 'manager' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock data
const initialUsers: User[] = [
  {
    id: '1',
    name: 'Administrador',
    email: 'admin@example.com',
    role: 'admin',
    avatar: 'https://i.pravatar.cc/150?img=68',
    phone: '555-123-4567',
    department: 'TI',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    name: 'Gerente de Almacén',
    email: 'manager@example.com',
    role: 'manager',
    avatar: 'https://i.pravatar.cc/150?img=33',
    phone: '555-234-5678',
    department: 'Operaciones',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
  },
  {
    id: '3',
    name: 'Miembro del Personal',
    email: 'staff@example.com',
    role: 'staff',
    avatar: 'https://i.pravatar.cc/150?img=23',
    phone: '555-345-6789',
    department: 'Logística',
    createdAt: new Date('2023-02-01'),
    updatedAt: new Date('2023-02-01'),
  },
];

export const usersAtom = atom<User[]>(initialUsers);

// CRUD operations for users
export const addUser = (
  user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  setUsers: (users: User[]) => void,
  currentUsers: User[]
) => {
  const newUser: User = {
    ...user,
    id: generateId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  setUsers([...currentUsers, newUser]);
};

export const updateUser = (
  id: string,
  userData: Partial<User>,
  setUsers: (users: User[]) => void,
  currentUsers: User[]
) => {
  const updatedUsers = currentUsers.map(user => 
    user.id === id 
      ? { ...user, ...userData, updatedAt: new Date() } 
      : user
  );
  
  setUsers(updatedUsers);
};

export const deleteUser = (
  id: string,
  setUsers: (users: User[]) => void,
  currentUsers: User[]
) => {
  const filteredUsers = currentUsers.filter(user => user.id !== id);
  setUsers(filteredUsers);
};

export const getUser = (
  id: string,
  users: User[]
): User | undefined => {
  return users.find(user => user.id === id);
};

export const getUsersByRole = (
  role: UserRole,
  users: User[]
): User[] => {
  return users.filter(user => user.role === role);
};