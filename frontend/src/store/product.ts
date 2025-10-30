import { atom } from 'jotai';
import { productsAPI } from '../lib/api';
import { generateId } from '../lib/utils';

interface BackendProduct {
  idProd: number | null;
  nombre: string;
  codigo?: string;
  descripcion?: string;
  categoria?: {
    id: number | string;
  };
  precio?: number;
  stock?: number;
  codigoQr?: string;
  creadoEn?: string;
  estado?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  categoryId: string;
  price: number;
  cost: number;
  quantity: number;
  qrCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Adaptador para convertir el formato del backend al formato del frontend
export const adaptProductFromBackend = (backendProduct: BackendProduct): Product => {
  let qrCode = backendProduct.codigoQr || '';
  
  // Si el valor parece ser un nombre de archivo o una ruta de archivo
  if (typeof qrCode === 'string') {
    if (qrCode.endsWith('.png')) {
      // Si ya es una ruta completa, la usamos tal cual
      if (qrCode.includes('/') || qrCode.includes('\\')) {
        // Extraemos solo el nombre del archivo
        const fileName = qrCode.split(/[/\\]/).pop() || '';
        qrCode = `http://localhost:8081/qrs/${fileName}`;
      } else {
        // Si es solo el nombre del archivo
        qrCode = `http://localhost:8081/qrs/${qrCode}`;
      }
    }
    // Como alternativa, podemos usar el endpoint directo (que ahora está público)
    if (backendProduct.idProd) {
      qrCode = `http://localhost:8081/api/productos/${backendProduct.idProd}/qr-imagen`;
    }
  }
  
  return {
    id: backendProduct.idProd?.toString() || '',
    name: backendProduct.nombre,
    sku: backendProduct.codigo || '',
    description: backendProduct.descripcion || '',
    categoryId: backendProduct.categoria?.id?.toString() || '',
    price: Number(backendProduct.precio || 0),
    cost: 0, // No hay equivalente en el backend
    quantity: backendProduct.stock || 0,
    qrCode,
    createdAt: backendProduct.creadoEn ? new Date(backendProduct.creadoEn) : new Date(),
    updatedAt: new Date(), // No hay equivalente en el backend
  };
};

// Adaptador para convertir el formato del frontend al formato del backend
export const adaptProductToBackend = (frontendProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, id?: string): BackendProduct => {
  return {
    idProd: id ? parseInt(id) : null,
    nombre: frontendProduct.name,
    codigo: frontendProduct.sku,
    descripcion: frontendProduct.description,
    categoria: frontendProduct.categoryId ? {
      id: parseInt(frontendProduct.categoryId)
    } : undefined,
    precio: frontendProduct.price,
    stock: frontendProduct.quantity,
    estado: 'activo',
  };
};

// Productos iniciales vacíos
const initialProducts: Product[] = [];

export const productsAtom = atom<Product[]>(initialProducts);

// CRUD operations for products that interact with the backend
export const fetchProducts = async (setProducts: (products: Product[]) => void) => {
  try {
    const productsFromApi = await productsAPI.getAll();
    // Adaptamos todos los productos del formato backend al formato frontend
    const adaptedProducts = Array.isArray(productsFromApi) 
      ? productsFromApi.map(adaptProductFromBackend)
      : [];
    setProducts(adaptedProducts);
    return adaptedProducts;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const addProduct = async (
  productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  setProducts: (products: Product[]) => void,
  currentProducts: Product[]
) => {
  try {
    // Convertimos al formato esperado por el backend
    const backendProduct = adaptProductToBackend(productData);
    
    // Enviamos al backend
    const response = await productsAPI.create(backendProduct);
    
    // Convertimos la respuesta al formato frontend
    const newProduct = adaptProductFromBackend(response);
    
    // Actualizamos el estado local
    setProducts([...currentProducts, newProduct]);
    
    return newProduct;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (
  id: string,
  productData: Partial<Product>,
  setProducts: (products: Product[]) => void,
  currentProducts: Product[]
) => {
  try {
    const existingProduct = currentProducts.find(p => p.id === id);
    
    if (!existingProduct) {
      throw new Error(`Product with id ${id} not found`);
    }
    
    // Mezclamos los datos actuales con las actualizaciones
    const updatedProductData = {
      ...existingProduct,
      ...productData,
    };
    
    // Convertimos al formato esperado por el backend
    const backendProduct = adaptProductToBackend(updatedProductData, id);
    
    // Enviamos al backend
    const response = await productsAPI.update(id, backendProduct);
    
    // Convertimos la respuesta al formato frontend
    const updatedProduct = adaptProductFromBackend(response);
    
    // Actualizamos el estado local
    const updatedProducts = currentProducts.map(product => 
      product.id === id ? updatedProduct : product
    );
    
    setProducts(updatedProducts);
    
    return updatedProduct;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
};

export const deleteProduct = async (
  id: string,
  setProducts: (products: Product[]) => void,
  currentProducts: Product[]
) => {
  try {
    // Llamamos al endpoint de eliminar (que es un PUT en el backend)
    await productsAPI.delete(id);
    
    // Actualizamos el estado local
    const filteredProducts = currentProducts.filter(product => product.id !== id);
    setProducts(filteredProducts);
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
};

export const getProduct = async (
  id: string, 
  products: Product[]
): Promise<Product | undefined> => {
  // Primero buscamos en el caché local
  const cachedProduct = products.find(p => p.id === id);
  
  if (cachedProduct) {
    return cachedProduct;
  }
  
  // Si no está en caché, lo buscamos en el backend
  try {
    const response = await productsAPI.getById(id);
    return adaptProductFromBackend(response);
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

export const getProductQRCode = async (id: string): Promise<string> => {
  try {
    return await productsAPI.getQRCode(id);
  } catch (error) {
    console.error(`Error fetching QR code for product ${id}:`, error);
    throw error;
  }
};

export const getProductsByCategory = (
  categoryId: string,
  products: Product[]
): Product[] => {
  // Filtra los productos localmente por categoría
  return products.filter(product => product.categoryId === categoryId.toString());
};

// Función asincrónica para obtener productos por categoría desde el backend
export const fetchProductsByCategory = async (
  categoryId: string
): Promise<Product[]> => {
  try {
    const productsFromApi = await productsAPI.getByCategory(categoryId);
    
    // Adaptamos todos los productos del formato backend al formato del frontend
    const adaptedProducts = Array.isArray(productsFromApi) 
      ? productsFromApi.map(adaptProductFromBackend)
      : [];
    
    return adaptedProducts;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};