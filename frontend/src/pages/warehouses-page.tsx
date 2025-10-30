import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash, 
  Search, 
  MapPin, 
  User,
  MoreVertical,
  PackageCheck
} from 'lucide-react';
import { warehousesAPI } from '../lib/api';
import { Warehouse } from '../store/warehouse';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useNavigate } from 'react-router-dom';

export const WarehousesPage: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentWarehouse, setCurrentWarehouse] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    capacidad: 0,
    estado: 'activo',
    responsable: undefined as Warehouse['responsable']
  });
  const navigate = useNavigate();

  useEffect(() => {
    warehousesAPI.getAll().then(setWarehouses);
  }, []);

  const filteredWarehouses = warehouses.filter(
    warehouse => 
      warehouse.nombre.toLowerCase().includes(search.toLowerCase()) ||
      warehouse.ubicacion.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (warehouse: Warehouse | null = null) => {
    if (warehouse) {
      setCurrentWarehouse(warehouse);
      setFormData({
        nombre: warehouse.nombre,
        ubicacion: warehouse.ubicacion,
        capacidad: warehouse.capacidad,
        estado: warehouse.estado,
        responsable: warehouse.responsable
      });
    } else {
      setCurrentWarehouse(null);
      setFormData({
        nombre: '',
        ubicacion: '',
        capacidad: 0,
        estado: 'activo',
        responsable: undefined
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacidad' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentWarehouse) {
      await warehousesAPI.update(currentWarehouse.idAlm.toString(), formData);
    } else {
      await warehousesAPI.create(formData);
    }
    const updated = await warehousesAPI.getAll();
    setWarehouses(updated);
    closeModal();
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Seguro que deseas eliminar este almacén?')) {
      await warehousesAPI.delete(id.toString());
      setWarehouses(await warehousesAPI.getAll());
    }
  };

  // Calcular porcentaje de uso (mock, ya que no hay campo en backend)
  const calculateUsage = (used: number, total: number) => {
    if (!total) return 0;
    return Math.round((used / total) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Almacenes</h1>
          <p className="text-gray-500">Gestiona tus almacenes y centros de distribución.</p>
        </div>
        <Button 
          onClick={() => openModal()}
          leftIcon={<Plus size={16} />}
        >
          Añadir Almacén
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Buscar almacenes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Warehouses list */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredWarehouses.map((warehouse) => {
          // No hay campo de capacidad usada en backend, solo mostrar capacidad
          return (
            <Card key={warehouse.idAlm} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="h-2 bg-blue-600"></div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{warehouse.nombre}</CardTitle>
                  <div className="relative">
                    <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-600 text-sm">
                  <MapPin size={16} />
                  <span>Ubicación: {warehouse.ubicacion}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 text-sm">
                  <User size={16} />
                  <span>Encargado: {warehouse.responsable?.nombreUsuario || 'Sin asignar'}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 text-sm">
                  <PackageCheck size={16} />
                  <span>Capacidad: {warehouse.capacidad} unidades</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 text-sm">
                  <Badge variant={warehouse.estado === 'activo' ? 'success' : 'secondary'}>
                    {warehouse.estado}
                  </Badge>
                </div>
                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => openModal(warehouse)}
                    leftIcon={<Edit size={14} />}
                  >
                    Editar
                  </Button>
                  <Button 
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(warehouse.idAlm)}
                    leftIcon={<Trash size={14} />}
                  >
                    Eliminar
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/warehouses/${warehouse.idAlm}`)}
                    leftIcon={<PackageCheck size={14} />}
                  >
                    Inventario
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal for Add/Edit Warehouse */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>{currentWarehouse ? 'Editar Almacén' : 'Añadir Nuevo Almacén'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre del Almacén</label>
                  <Input 
                    id="nombre" 
                    name="nombre" 
                    value={formData.nombre} 
                    onChange={handleInputChange} 
                    placeholder="Ej: Almacén Principal"
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700">Ubicación</label>
                  <Input 
                    id="ubicacion" 
                    name="ubicacion" 
                    value={formData.ubicacion} 
                    onChange={handleInputChange} 
                    placeholder="Ej: Calle Falsa 123, Ciudad"
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="capacidad" className="block text-sm font-medium text-gray-700">Capacidad Total (unidades)</label>
                  <Input 
                    id="capacidad" 
                    name="capacidad" 
                    type="number" 
                    value={formData.capacidad} 
                    onChange={handleInputChange} 
                    placeholder="0"
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="estado" className="block text-sm font-medium text-gray-700">Estado</label>
                  <select
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="cerrado">Cerrado</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button type="button" variant="outline" onClick={closeModal}>Cancelar</Button>
                  <Button type="submit">{currentWarehouse ? 'Guardar Cambios' : 'Crear Almacén'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};