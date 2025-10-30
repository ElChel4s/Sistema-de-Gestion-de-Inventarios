import { atom } from 'jotai';

export interface Category {
  id: number;
  nombre: string;
  descripcion: string;
  estado?: string;
  fechaAlta?: string;
  fechaBaja?: string;
  motivoBaja?: string;
}

// Atom para las categorías, inicialmente vacío
export const categoriesAtom = atom<Category[]>([]);

// Cargar categorías desde el backend
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const token = localStorage.getItem('auth-token');
    console.log('Token de autenticación:', token ? 'Presente' : 'Ausente');
    
    // Utilizamos URL relativa para que funcione con el proxy de Vite
    const res = await fetch('/api/categorias', {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    });
    
    console.log('Respuesta de API categorías:', res.status, res.statusText);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error en respuesta:', errorText);
      throw new Error(`Error al cargar categorías: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('Datos de categorías recibidos:', data);
    
    // Aseguramos que los campos coincidan con el modelo frontend
    return Array.isArray(data)
      ? data.map((cat: any) => ({
          id: cat.id,
          nombre: cat.nombre,
          descripcion: cat.descripcion,
          estado: cat.estado,
          fechaAlta: cat.fechaAlta || cat.fecha_alta,
          fechaBaja: cat.fechaBaja || cat.fecha_baja,
          motivoBaja: cat.motivoBaja,
        }))
      : [];
  } catch (error) {
    console.error('Error en fetchCategories:', error);
    throw error;
  }
};

// Crear categoría
export const addCategory = async (
  category: Omit<Category, 'id'>,
  setCategories: (categories: Category[]) => void,
  currentCategories: Category[]
) => {
  const token = localStorage.getItem('auth-token');
  const res = await fetch('/api/categorias', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(category),
  });
  if (!res.ok) throw new Error('Error al crear categoría');
  const nuevaCategoria = await res.json();
  setCategories([...currentCategories, nuevaCategoria]);
};

// Actualizar categoría
export const updateCategory = async (
  id: number,
  categoryData: Partial<Category>,
  setCategories: (categories: Category[]) => void,
  currentCategories: Category[]
) => {
  const token = localStorage.getItem('auth-token');
  const res = await fetch(`/api/categorias/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(categoryData),
  });
  if (!res.ok) throw new Error('Error al actualizar categoría');
  const categoriaActualizada = await res.json();
  setCategories(currentCategories.map(cat => cat.id === id ? categoriaActualizada : cat));
};

// Eliminar categoría (PUT /{id}/baja)
export const deleteCategory = async (
  id: number,
  setCategories: (categories: Category[]) => void,
  currentCategories: Category[]
) => {
  const token = localStorage.getItem('auth-token');
  const res = await fetch(`/api/categorias/${id}/baja`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error('Error al eliminar categoría');
  setCategories(currentCategories.filter(cat => cat.id !== id));
};

// Obtener una categoría por id (opcional)
export const getCategory = (
  id: number,
  categories: Category[]
): Category | undefined => {
  return categories.find(category => category.id === id);
};