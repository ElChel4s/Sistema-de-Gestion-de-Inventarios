import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Search, 
  Package,
  AlertTriangle,
  BarChart2
} from 'lucide-react';
import { warehousesAPI } from '../lib/api';
import { productsAPI } from '../lib/api';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { formatCurrency } from '../lib/utils';
import { Warehouse } from '../store/warehouse';

interface InventarioItem {
  id: number;
  producto: {
    idProd: string | number;
    nombre: string;
    codigo: string;
    precio?: number;
  };
  almacen: {
    id: string | number;
    nombre: string;
    ubicacion: string;
  };
  cantidad: string | number;
  actualizadoEn: string;
}

export const WarehouseInventoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [inventory, setInventory] = useState<InventarioItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Obtener datos del almacén
        const almacenes: Warehouse[] = await warehousesAPI.getAll();
        setWarehouse(almacenes.find((w) => String(w.idAlm) === String(id)) || null);
        // Obtener inventario real de este almacén
        const inv = await productsAPI.getInventarioByAlmacen(id!);
        setInventory(Array.isArray(inv) ? inv : []);
      } catch {
        setWarehouse(null);
        setInventory([]);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  if (!warehouse && !loading) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-gray-900">Almacén no encontrado</h2>
      </div>
    );
  }

  // Filtrar inventario por búsqueda
  const filteredInventory = inventory.filter(item =>
    (item.producto?.nombre?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (item.producto?.codigo?.toLowerCase() || '').includes(search.toLowerCase())
  );

  const totalValue = inventory.reduce((sum, item) => sum + (Number(item.cantidad) * Number(item.producto?.precio || 0)), 0);
  const totalItems = inventory.reduce((sum, item) => sum + Number(item.cantidad), 0);
  const lowStockItems = inventory.filter(item => Number(item.cantidad) < 10).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{warehouse?.nombre || 'Almacén'}</h1>
        <p className="text-gray-500">Inventario actual y estadísticas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Valor Total</p>
                <h3 className="text-2xl font-bold text-blue-900 mt-1">
                  {formatCurrency(totalValue)}
                </h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart2 size={24} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Items</p>
                <h3 className="text-2xl font-bold text-green-900 mt-1">
                  {totalItems}
                </h3>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Package size={24} className="text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Stock Bajo</p>
                <h3 className="text-2xl font-bold text-yellow-900 mt-1">
                  {lowStockItems}
                </h3>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertTriangle size={24} className="text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Inventory table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Unitario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-full">
                        <Package className="text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.producto?.nombre}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.producto?.codigo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.cantidad}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(Number(item.producto?.precio) || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(Number(item.cantidad) * (Number(item.producto?.precio) || 0))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant={
                        Number(item.cantidad) > 20 ? 'success' :
                        Number(item.cantidad) > 10 ? 'warning' :
                        'danger'
                      }
                    >
                      {Number(item.cantidad) > 20 ? 'Stock Alto' :
                       Number(item.cantidad) > 10 ? 'Stock Medio' :
                       'Stock Bajo'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty state */}
      {filteredInventory.length === 0 && !loading && (
        <div className="text-center py-10">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No se encontraron productos</h3>
          <p className="text-gray-500 mt-1">
            {search ? 'Intenta ajustar tus términos de búsqueda' : 'Este almacén no tiene productos en inventario'}
          </p>
        </div>
      )}
      {loading && (
        <div className="text-center py-10 text-gray-500">Cargando inventario...</div>
      )}
    </div>
  );
};