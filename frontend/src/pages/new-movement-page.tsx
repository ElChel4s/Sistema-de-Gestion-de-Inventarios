import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus,
  Trash,
  ArrowDown,
  ArrowUp,
  ArrowRight
} from 'lucide-react';
import { 
  MovementType,
} from '../store/movement';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { BrowserQRCodeReader } from '@zxing/browser';
import { warehousesAPI } from '../lib/api';
import { usersAPI } from '../lib/api';
import { productsAPI } from '../lib/api';
import type { Warehouse } from '../store/warehouse';
import type { UserDTO } from '../lib/api';
import type { Product } from '../store/product';

interface ProductMovement {
  productId: string;
  quantity: number;
}

// Adaptador para User
function adaptUserFromDTO(dto: UserDTO): User {
  return {
    id: dto.id ?? 0,
    nombre: dto.nombreUsuario,
    correo: '', // Si hay campo correo en el backend, mapear aquí
    rol: dto.rol?.nombre ?? '',
  };
}

export interface User {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
}

export const NewMovementPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<MovementType>('in');
  const [selectedProducts, setSelectedProducts] = useState<ProductMovement[]>([]);
  const [formData, setFormData] = useState({
    sourceWarehouseId: '',
    destinationWarehouseId: '',
    requestedBy: '',
    approvedBy: '',
    notes: '',
  });
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [qrError, setQRError] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const codeReaderRef = React.useRef<BrowserQRCodeReader | null>(null);

  useEffect(() => {
    warehousesAPI.getAll().then(setWarehouses);
    usersAPI.getAll().then((data: UserDTO[]) => setUsers(data.map(adaptUserFromDTO)));
    productsAPI.getAll().then((data) => {
      // Adaptar productos del backend al formato frontend
      import('../store/product').then(({ adaptProductFromBackend }) => {
        setProducts(Array.isArray(data) ? data.map(adaptProductFromBackend) : []);
      });
    });
  }, []);

  const handleAddProduct = () => {
    setSelectedProducts([...selectedProducts, { productId: '', quantity: 1 }]);
  };

  const handleRemoveProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, field: keyof ProductMovement, value: string | number) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: field === 'quantity' ? Number(value) : value,
    };
    setSelectedProducts(updatedProducts);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validar productos
      if (selectedProducts.length === 0) {
        alert('Debes agregar al menos un producto');
        return;
      }
      // Construir detalles para el backend
      const detalles = selectedProducts.map((item) => ({
        producto: { idProd: parseInt(item.productId) },
        cantidad: item.quantity
      }));
      // Determinar tipo de movimiento
      let tipoMov = '';
      let almacenOrigen = null;
      let almacenDestino = null;
      if (activeTab === 'in') {
        tipoMov = 'ENTRADA';
        almacenDestino = formData.sourceWarehouseId ? { idAlm: parseInt(formData.sourceWarehouseId) } : null;
      } else if (activeTab === 'out') {
        tipoMov = 'SALIDA';
        almacenOrigen = formData.sourceWarehouseId ? { idAlm: parseInt(formData.sourceWarehouseId) } : null;
      } else if (activeTab === 'transfer') {
        tipoMov = 'TRASPASO';
        almacenOrigen = formData.sourceWarehouseId ? { idAlm: parseInt(formData.sourceWarehouseId) } : null;
        almacenDestino = formData.destinationWarehouseId ? { idAlm: parseInt(formData.destinationWarehouseId) } : null;
      }
      // Construir el objeto para el backend
      const movimientoDTO = {
        tipoMov,
        almacenOrigen,
        almacenDestino,
        motivo: formData.notes,
        detalles,
      };
      // Enviar al backend
      const token = localStorage.getItem('auth-token');
      const res = await fetch('/api/movimientos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(movimientoDTO),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Error al crear el movimiento');
      }
      // Redirigir a la vista de movimientos
      navigate('/movements');
    } catch (err: any) {
      alert('Error al crear el movimiento: ' + (err.message || err));
    }
  };

  // useEffect para iniciar el escaneo cuando el modal QR se abre
  React.useEffect(() => {
    if (isQRScannerOpen && videoRef.current) {
      setQRError(null);
      const codeReader = new BrowserQRCodeReader();
      codeReaderRef.current = codeReader;
      codeReader.decodeOnceFromVideoDevice(undefined, videoRef.current)
        .then(async result => {
          if (result) {
            const qrText = result.getText();
            // Llamar al endpoint para obtener el producto real
            try {
              const response = await import('../lib/api').then(m => m.productsAPI.getProductWithStockByQR(qrText));
              if (response && response.producto && response.producto.idProd) {
                const productId = response.producto.idProd.toString();
                setSelectedProducts(prev => {
                  const idx = prev.findIndex(item => item.productId === productId);
                  if (idx !== -1) {
                    // Si ya está, solo incrementa la cantidad
                    const newProducts = [...prev];
                    newProducts[idx].quantity += 1;
                    return newProducts;
                  } else {
                    // Solo una fila: reemplazar el array por el nuevo producto
                    return [{ productId, quantity: 1 }];
                  }
                });
              } else {
                setQRError('Producto no encontrado en el sistema.');
              }
            } catch (err) {
              setQRError('Error al consultar el producto.');
            }
          }
          setIsQRScannerOpen(false);
        })
        .catch(() => {
          setQRError('Error al escanear el QR o acceso denegado.');
          setIsQRScannerOpen(false);
        });
      // Limpiar la cámara al cerrar el modal
      const videoEl = videoRef.current; // Copiar ref a variable local
      return () => {
        if (videoEl && videoEl.srcObject) {
          const tracks = (videoEl.srcObject as MediaStream).getTracks();
          tracks.forEach(track => track.stop());
          videoEl.srcObject = null;
        }
      };
    }
  }, [isQRScannerOpen, products]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Movimiento</h1>
        <p className="text-gray-500">Registra un nuevo movimiento de inventario</p>
      </div>

      {/* Movement type tabs */}
      <div className="flex space-x-1 rounded-xl bg-gray-100 p-1">
        <button
          className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium ${
            activeTab === 'in'
              ? 'bg-white text-blue-600 shadow'
              : 'text-gray-600 hover:bg-white/50'
          }`}
          onClick={() => setActiveTab('in')}
        >
          <ArrowDown size={16} />
          <span>Entrada</span>
        </button>
        <button
          className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium ${
            activeTab === 'out'
              ? 'bg-white text-blue-600 shadow'
              : 'text-gray-600 hover:bg-white/50'
          }`}
          onClick={() => setActiveTab('out')}
        >
          <ArrowUp size={16} />
          <span>Salida</span>
        </button>
        <button
          className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium ${
            activeTab === 'transfer'
              ? 'bg-white text-blue-600 shadow'
              : 'text-gray-600 hover:bg-white/50'
          }`}
          onClick={() => setActiveTab('transfer')}
        >
          <ArrowRight size={16} />
          <span>Traspaso</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Products section */}
        <Card>
          <CardHeader>
            <CardTitle>Productos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedProducts.map((product, index) => (
              <div key={index} className="flex items-end gap-4 pb-4 border-b">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Producto
                  </label>
                  <select
                    value={product.productId}
                    onChange={(e) => handleProductChange(index, 'productId', e.target.value)}
                    className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Seleccionar producto</option>
                    {products.map((p: Product) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="w-32">
                  <Input
                    label="Cantidad"
                    type="number"
                    value={product.quantity}
                    onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                    required
                    min="1"
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="mb-1"
                  onClick={() => handleRemoveProduct(index)}
                >
                  <Trash size={16} />
                </Button>
              </div>
            ))}

            <div className="flex">
              <Button
                type="button"
                variant="outline"
                onClick={handleAddProduct}
                leftIcon={<Plus size={16} />}
              >
                Agregar Producto
              </Button>
              <Button
                type="button"
                variant="outline"
                className="ml-2"
                onClick={() => setIsQRScannerOpen(true)}
              >
                Escanear QR
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Warehouse section */}
        <Card>
          <CardHeader>
            <CardTitle>Almacenes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {activeTab === 'in' ? 'Almacén Destino' : 'Almacén Origen'}
              </label>
              <select
                name="sourceWarehouseId"
                value={formData.sourceWarehouseId}
                onChange={handleInputChange}
                className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              >
                <option value="">Seleccionar almacén</option>
                {warehouses.map(warehouse => (
                  <option key={warehouse.idAlm} value={warehouse.idAlm}>
                    {warehouse.nombre}
                  </option>
                ))}
              </select>
            </div>

            {activeTab === 'transfer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Almacén Destino
                </label>
                <select
                  name="destinationWarehouseId"
                  value={formData.destinationWarehouseId}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Seleccionar almacén</option>
                  {warehouses
                    .filter(w => String(w.idAlm) !== String(formData.sourceWarehouseId))
                    .map(warehouse => (
                      <option key={warehouse.idAlm} value={warehouse.idAlm}>
                        {warehouse.nombre}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional information */}
        <Card>
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Solicitado por
              </label>
              <select
                name="requestedBy"
                value={formData.requestedBy}
                onChange={handleInputChange}
                className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              >
                <option value="">Seleccionar usuario</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aprobado por
              </label>
              <select
                name="approvedBy"
                value={formData.approvedBy}
                onChange={handleInputChange}
                className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Seleccionar usuario</option>
                {users
                  .filter(user => ['admin', 'manager'].includes(user.rol))
                  .map(user => (
                    <option key={user.id} value={user.id}>
                      {user.nombre}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/movements')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={selectedProducts.length === 0}
          >
            Crear Movimiento
          </Button>
        </div>
      </form>

      {/* Modal de escaneo QR */}
      {isQRScannerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4">Escanear QR de Producto</h2>
            <video ref={videoRef} className="w-full max-w-xs rounded border mb-4" autoPlay muted />
            <Button onClick={() => setIsQRScannerOpen(false)} variant="outline">Cerrar</Button>
            {qrError && <div className="text-red-500 mt-2">{qrError}</div>}
          </div>
        </div>
      )}
    </div>
  );
};