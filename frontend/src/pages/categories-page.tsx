import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  Tag,
  Package,
  Palette
} from 'lucide-react';
import {
  categoriesAtom,
  Category,
  addCategory,
  updateCategory,
  deleteCategory,
  fetchCategories
} from '../store/category';
import { productsAtom, getProductsByCategory } from '../store/product';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useAtom(categoriesAtom);
  const [products] = useAtom(productsAtom);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
  });

  // Estados para manejar errores y carga
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar categorías al montar
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    fetchCategories()
      .then(data => {
        console.log('Categorías obtenidas:', data);
        setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al obtener categorías:', err);
        setError(err.message || 'Error al cargar categorías');
        setCategories([]);
        setLoading(false);
      });
  }, [setCategories]);

  const filteredCategories = categories.filter(
    category => 
      category.nombre.toLowerCase().includes(search.toLowerCase()) ||
      category.descripcion.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (category: Category | null = null) => {
    if (category) {
      setCurrentCategory(category);
      setFormData({
        nombre: category.nombre,
        descripcion: category.descripcion,
      });
    } else {
      setCurrentCategory(null);
      setFormData({
        nombre: '',
        descripcion: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCategory) {
      await updateCategory(currentCategory.id, formData, setCategories, categories);
    } else {
      await addCategory(formData, setCategories, categories);
    }
    closeModal();
  };

  const handleDelete = async (id: number) => {
    // Usar la nueva versión de getProductsByCategory que filtra los productos localmente
    const categoryProducts = getProductsByCategory(id.toString(), products);
    if (categoryProducts.length > 0) {
      alert('No se puede eliminar la categoría porque tiene productos asociados');
      return;
    }
    if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      await deleteCategory(id, setCategories, categories);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-500">Gestiona las categorías de tus productos</p>
        </div>
        <Button 
          onClick={() => openModal()}
          leftIcon={<Plus size={16} />}
        >
          Agregar Categoría
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Buscar categorías..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map((category) => {
          // Usar la nueva versión de getProductsByCategory que filtra los productos localmente
          const categoryProducts = getProductsByCategory(category.id.toString(), products);
          return (
            <Card 
              key={category.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
              style={{ borderTop: `4px solid #3B82F6` }} // color fijo o puedes randomizar
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{category.nombre}</CardTitle>
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#3B82F6' }} // color fijo
                  >
                    <Tag size={20} className="text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm">{category.descripcion}</p>
                <div className="flex items-center space-x-2">
                  <Package size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {categoryProducts.length} productos
                  </span>
                </div>
                {/* Status badge */}
                <Badge
                  variant={categoryProducts.length > 0 ? 'success' : 'secondary'}
                >
                  {categoryProducts.length > 0 ? 'En uso' : 'Sin productos'}
                </Badge>
                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    leftIcon={<Edit size={16} />}
                    onClick={() => openModal(category)}
                  >
                    Editar
                  </Button>
                  <Button 
                    variant="danger" 
                    className="flex-1"
                    leftIcon={<Trash size={16} />}
                    onClick={() => handleDelete(category.id)}
                    disabled={categoryProducts.length > 0}
                  >
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal for adding/editing category */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {currentCategory ? 'Editar Categoría' : 'Agregar Nueva Categoría'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Nombre de la Categoría"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows={3}
                    className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {currentCategory ? 'Actualizar' : 'Agregar'} Categoría
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900">Cargando categorías...</h3>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="text-center py-10 px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h3 className="text-lg font-medium">Error al cargar categorías</h3>
            <p className="mt-1">{error}</p>
            <p className="mt-3">Verifica tu conexión y que hayas iniciado sesión correctamente.</p>
          </div>
          <Button 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Intentar nuevamente
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredCategories.length === 0 && (
        <div className="text-center py-10">
          <Tag size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No se encontraron categorías</h3>
          <p className="text-gray-500 mt-1">
            {search ? 'Intenta ajustar tus términos de búsqueda' : 'Agrega tu primera categoría para comenzar'}
          </p>
          {!search && (
            <Button 
              className="mt-4"
              onClick={() => openModal()}
              leftIcon={<Plus size={16} />}
            >
              Agregar Categoría
            </Button>
          )}
        </div>
      )}
    </div>
  );
};