// Configuración para la conexión con el backend
const API_BASE_URL = 'http://localhost:8081';

// Función base para realizar peticiones al backend
export const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('auth-token');
  
  console.log(`Realizando petición a: ${API_BASE_URL}${endpoint}`);
  console.log(`Token disponible: ${token ? 'Sí' : 'No'}`);
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Si hay token, lo añadimos al header
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      // Asegurar que se envíen las cookies
      credentials: 'include',
    });

    console.log(`Respuesta: Status ${response.status} - ${response.statusText}`);

    if (!response.ok) {
      // Solo eliminar el token si es 401 (no autenticado)
      if (response.status === 401) {
        console.warn('Error de autenticación, eliminando token...');
        localStorage.removeItem('auth-token');
      }
      
      // Intentamos obtener el mensaje de error desde el servidor
      let errorMessage;
      try {
        const errorText = await response.text();
        console.error('Texto de error:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
        } catch {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
      } catch (e) {
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
      
      // Lanzar error enriquecido para distinguir en el frontend
      const error: any = new Error(errorMessage);
      if (response.status === 401 || response.status === 403) {
        error.authError = true;
        error.status = response.status;
      }
      throw error;
    }

    // Si la respuesta es exitosa pero no tiene contenido
    if (response.status === 204) {
      console.log('Respuesta sin contenido (204)');
      return null;
    }

    const data = await response.json();
    console.log('Datos recibidos:', data);
    
    return data;
  } catch (error) {
    console.error('Error en fetchAPI:', error);
    throw error;
  }
};

// API para autenticación
export const authAPI = {
  login: async (username: string, password: string) => {
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }
};

// API para productos
export const productsAPI = {
  getAll: async () => {
    return fetchAPI('/api/productos');
  },
  
  getById: async (id: string) => {
    return fetchAPI(`/api/productos/${id}`);
  },
  
  create: async (productData: any) => {
    return fetchAPI('/api/productos', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },
  
  update: async (id: string, productData: any) => {
    return fetchAPI(`/api/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },
  
  delete: async (id: string) => {
    return fetchAPI(`/api/productos/del/${id}`, {
      method: 'PUT',
    });
  },
  
  getQRCode: async (id: string) => {
    return fetchAPI(`/api/productos/${id}/qr`);
  },
  
  getQRImage: async (id: string) => {
    return `${API_BASE_URL}/api/productos/${id}/qr-imagen`;
  },
  
  getByCategory: async (categoryId: string) => {
    return fetchAPI(`/api/productos/categoria/${categoryId}`);
  },

  getInventarioByProducto: async (productoId: string) => {
    return fetchAPI(`/api/inventarios/producto/${productoId}`);
  },

  getProductWithStockByQR: async (qrCode: string) => {
    return fetchAPI('/api/qr/scan-full', {
      method: 'POST',
      body: JSON.stringify(qrCode),
    });
  },

  getInventarioByAlmacen: async (almacenId: string) => {
    return fetchAPI(`/api/inventarios/almacen/${almacenId}`);
  },
};

// API para categorías
export const categoriesAPI = {
  getAll: async () => {
    return fetchAPI('/api/categorias');
  },
};

// API para almacenes
export const warehousesAPI = {
  getAll: async () => {
    return fetchAPI('/api/almacenes');
  },
  getById: async (id: string) => {
    return fetchAPI(`/api/almacenes/${id}`);
  },
  create: async (warehouseData: any) => {
    return fetchAPI('/api/almacenes', {
      method: 'POST',
      body: JSON.stringify(warehouseData),
    });
  },
  update: async (id: string, warehouseData: any) => {
    return fetchAPI(`/api/almacenes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(warehouseData),
    });
  },
  delete: async (id: string) => {
    return fetchAPI(`/api/almacenes/${id}`, {
      method: 'DELETE',
    });
  },
  searchByName: async (name: string) => {
    return fetchAPI(`/api/almacenes/buscar?nombre=${encodeURIComponent(name)}`);
  },
  getByEstado: async (estado: string) => {
    return fetchAPI(`/api/almacenes/estado?estado=${encodeURIComponent(estado)}`);
  },
};

// API para movimientos
export const movementsAPI = {
  getAll: async () => {
    return fetchAPI('/api/movimientos');
  },
  getById: async (id: string) => {
    return fetchAPI(`/api/movimientos/${id}`);
  },
  create: async (movementData: any) => {
    return fetchAPI('/api/movimientos', {
      method: 'POST',
      body: JSON.stringify(movementData),
    });
  },
  update: async (id: string, movementData: any) => {
    return fetchAPI(`/api/movimientos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(movementData),
    });
  },
  delete: async (id: string) => {
    return fetchAPI(`/api/movimientos/${id}`, {
      method: 'DELETE',
    });
  },
};

// Definición del tipo para usuario según el backend
export interface UserDTO {
  id?: number;
  nombreUsuario: string;
  claveHash?: string;
  rol: { id?: number; nombre: string; descripcion?: string };
  creadoEn?: string;
  // Extras para UI
  phone?: string;
  department?: string;
  avatar?: string;
}

// API para usuarios
export const usersAPI = {
  getAll: async (): Promise<UserDTO[]> => {
    return fetchAPI('/api/usuarios');
  },
  getById: async (id: number): Promise<UserDTO> => {
    return fetchAPI(`/api/usuarios/${id}`);
  },
  create: async (userData: UserDTO): Promise<UserDTO> => {
    return fetchAPI('/api/usuarios', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  update: async (id: number, userData: UserDTO): Promise<UserDTO> => {
    return fetchAPI(`/api/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
  delete: async (id: number): Promise<void> => {
    return fetchAPI(`/api/usuarios/${id}`, {
      method: 'DELETE',
    });
  },
};

// --- DASHBOARD API ---

// Tipos para el dashboard
export interface DashboardAlmacenStats {
  almacenId: number;
  nombreAlmacen: string;
  cantidadProductos: number;
  valorTotal: string; // BigDecimal como string
}

export interface DashboardProducto {
  idProd: number;
  nombre: string;
  precio: string; // BigDecimal como string
  stock: number;
  estado: string;
  codigoQr?: string;
  codigo?: string;
  descripcion?: string;
  stockMinimo?: string;
  creadoEn?: string;
  categoria?: {
    id: number;
    nombre: string;
    descripcion?: string;
    estado?: string;
    fechaBaja?: string;
    fechaAlta?: string;
    motivoBaja?: string;
  };
}

export interface DashboardUsuarioStats {
  usuarioId: number;
  nombreUsuario: string;
  cantidadCompras: number;
  cantidadVentas: number;
  cantidadTraspasos: number;
  valorCompras: string;
  valorVentas: string;
}

export interface DashboardData {
  totalProductos: number;
  totalAlmacenes: number;
  valorTotalProductos: string;
  productosPorAlmacen: DashboardAlmacenStats[];
  productosMasVendidos: DashboardProducto[];
  productosBajoStock: DashboardProducto[];
  cantidadCompras: number;
  cantidadVentas: number;
  valorCompras: string;
  valorVentas: string;
  estadisticasPorUsuario: DashboardUsuarioStats[];
}

export const dashboardAPI = {
  getDashboard: async (): Promise<DashboardData> => {
    return fetchAPI('/api/dashboard');
  },
};

// --- KARDEX API ---
export interface KardexDTO {
  movimientoId: number;
  fecha: string; // ISO string
  tipoMovimiento: string;
  usuarioMovimiento: string;
  almacenOrigen?: string;
  almacenDestino?: string;
  cantidad: string; // BigDecimal como string
  saldoAnterior: string; // BigDecimal como string
  saldoPosterior: string; // BigDecimal como string
  motivo?: string;
}

export const kardexAPI = {
  getByProduct: async (productoId: number): Promise<KardexDTO[]> => {
    return fetchAPI(`/api/kardex/producto/${productoId}`);
  },
};
