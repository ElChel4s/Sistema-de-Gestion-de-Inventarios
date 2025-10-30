import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  Warehouse as WarehouseIcon,
  Package
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { formatCurrency } from '../lib/utils';
import { dashboardAPI, DashboardData, DashboardProducto } from '../lib/api';

export const DashboardPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#F97316', '#8B5CF6', '#D8B4FE'];

  useEffect(() => {
    dashboardAPI.getDashboard()
      .then(data => {
        setDashboard(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Error al cargar el dashboard');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-lg">Cargando dashboard...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-600 font-semibold">{error}</div>;
  }
  if (!dashboard) {
    return <div className="p-8 text-center">No hay datos para mostrar.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel Principal</h1>
        <p className="text-gray-500">Bienvenido a tu panel de gestión de almacenes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">Total Productos</p>
                <h3 className="text-3xl font-bold mt-1">{dashboard.totalProductos}</h3>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Package size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">Almacenes</p>
                <h3 className="text-3xl font-bold mt-1">{dashboard.totalAlmacenes}</h3>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <WarehouseIcon size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">Valor del Inventario</p>
                <h3 className="text-3xl font-bold mt-1">{formatCurrency(Number(dashboard.valorTotalProductos))}</h3>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <TrendingUp size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">Compras / Ventas</p>
                <h3 className="text-2xl font-bold mt-1">{dashboard.cantidadCompras} / {dashboard.cantidadVentas}</h3>
                <div className="text-xs mt-1 opacity-80">Compras: {formatCurrency(Number(dashboard.valorCompras))}<br/>Ventas: {formatCurrency(Number(dashboard.valorVentas))}</div>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <TrendingUp size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Productos por almacén */}
      <Card>
        <CardHeader>
          <CardTitle>Productos y valor por almacén</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboard.productosPorAlmacen.map(a => ({
                  nombre: a.nombreAlmacen,
                  productos: a.cantidadProductos,
                  valor: Number(a.valorTotal)
                }))}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="nombre" type="category" />
                <Tooltip formatter={v => formatCurrency(v as number)} />
                <Legend />
                <Bar dataKey="productos" name="Productos" fill="#3B82F6" />
                <Bar dataKey="valor" name="Valor Total" fill="#F97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top productos más vendidos */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 productos más vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboard.productosMasVendidos.map((prod: DashboardProducto) => (
                  <tr key={prod.idProd}>
                    <td className="px-6 py-4 whitespace-nowrap">{prod.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{prod.stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(Number(prod.precio))}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{prod.categoria?.nombre || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Productos con bajo stock */}
      {dashboard.productosBajoStock.length > 0 && (
        <Card className="border-l-4 border-yellow-500">
          <CardHeader className="bg-yellow-50">
            <div className="flex items-center">
              <AlertTriangle size={20} className="text-yellow-600 mr-2" />
              <CardTitle className="text-yellow-800">Alerta de Stock Bajo</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Actual</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Mínimo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboard.productosBajoStock.map((prod: DashboardProducto) => (
                    <tr key={prod.idProd}>
                      <td className="px-6 py-4 whitespace-nowrap">{prod.nombre}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{prod.stock}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{prod.stockMinimo}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="danger">Stock Bajo</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas por usuario */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas por usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compras</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ventas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Traspasos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Compras</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Ventas</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboard.estadisticasPorUsuario.map(user => (
                  <tr key={user.usuarioId}>
                    <td className="px-6 py-4 whitespace-nowrap">{user.nombreUsuario}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.cantidadCompras}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.cantidadVentas}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.cantidadTraspasos}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(Number(user.valorCompras))}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(Number(user.valorVentas))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};