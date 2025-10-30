import { atom } from 'jotai';
import { authAPI } from '../lib/api';
import { jwtDecode } from 'jwt-decode';

export interface User {
  id: string;
  name: string;
  email: string; // nombreUsuario
  role: 'ADMIN' | 'GERENTE' | 'PERSONAL';
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Función para decodificar el token JWT
function decodeToken(token: string): { sub: string, role: string, exp?: number } {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Error decodificando token:", error);
    throw new Error("Token inválido");
  }
}

// Default auth state
const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const authAtom = atom<AuthState>(initialAuthState);

// Login action
export const login = async (username: string, password: string, setAuth: (auth: AuthState) => void) => {
  try {
    setAuth({ ...initialAuthState, isLoading: true });
    
    // Llamada a la API real
    const response = await authAPI.login(username, password);
    
    // Extraer el token
    const { token } = response;
    
    if (token) {
      // Guardar el token en localStorage
      localStorage.setItem('auth-token', token);
      
      // Decodificar el token para obtener información del usuario
      const decodedToken = decodeToken(token);
      
      // Crear objeto de usuario a partir del token
      const user: User = {
        id: decodedToken.sub,
        name: decodedToken.sub, // Usamos el username como nombre por defecto
        email: decodedToken.sub,
        role: decodedToken.role as 'ADMIN' | 'GERENTE' | 'PERSONAL',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(decodedToken.sub)}&background=random`
      };
      
      setAuth({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      // También guardamos los datos del usuario para persistencia
      localStorage.setItem('wms-user', JSON.stringify(user));
    } else {
      throw new Error('No se recibió token de autenticación');
    }
  } catch (error) {
    console.error("Error de login:", error);
    setAuth({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: error instanceof Error ? error.message : 'Error de autenticación'
    });
  }
};

// Logout action
export const logout = (setAuth: (auth: AuthState) => void) => {
  localStorage.removeItem('wms-user');
  localStorage.removeItem('auth-token');
  setAuth(initialAuthState);
};

// Check if user is already logged in
export const checkAuth = (setAuth: (auth: AuthState) => void) => {
  const token = localStorage.getItem('auth-token');
  const savedUser = localStorage.getItem('wms-user');
  
  if (token && savedUser) {
    try {
      // Verificamos que el token no esté expirado
      const decodedToken = decodeToken(token);
      const expirationTime = decodedToken.exp ? decodedToken.exp * 1000 : 0;
      
      if (expirationTime && Date.now() > expirationTime) {
        // Si el token expiró, hacemos logout
        logout(setAuth);
        return;
      }
      
      // Si el token es válido, restauramos la sesión
      const user = JSON.parse(savedUser) as User;
      setAuth({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (e) {
      // Si hay algún error, hacemos logout
      localStorage.removeItem('wms-user');
      localStorage.removeItem('auth-token');
      setAuth(initialAuthState);
    }
  }
};