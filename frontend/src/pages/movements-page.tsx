import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  MoveRight,
  Package,
  Warehouse as WarehouseIcon,
  User,
  Calendar,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Info,
  Filter,
  X
} from 'lucide-react';
import './movements.css'; // Estilos personalizados para animaciones
import { 
  Movement,
  MovementType,
} from '../store/movement';
import { productsAPI } from '../lib/api';
import { warehousesAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { formatDate } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { BrowserQRCodeReader } from '@zxing/browser';
import { movementsAPI } from '../lib/api';
import { Product } from '../store/product';
import type { Warehouse } from '../store/warehouse';
import { usersAPI } from '../lib/api';

// Tipos mínimos para evitar 'any'
type UserType = { id: string; name: string; role?: string };

export const MovementsPage: React.FC = () => {
  const [movements, setMovements] = React.useState<Movement[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [warehouses, setWarehouses] = React.useState<Warehouse[]>([]);
  const [users, setUsers] = useState([]); // Agrego el estado para usuarios
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMovement, setCurrentMovement] = useState<Movement | null>(null);
  const [filterType, setFilterType] = useState<MovementType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<Movement['status'] | 'all'>('all');
  const [showNotesId, setShowNotesId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'in' as MovementType,
    sourceWarehouseId: '',
    destinationWarehouseId: '',
    status: 'pending' as Movement['status'],
    requestedBy: '',
    approvedBy: '',
    notes: '',
    products: [] as Array<{productId: string, quantity: number}>
  });
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [qrError, setQRError] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const codeReaderRef = React.useRef<BrowserQRCodeReader | null>(null);
  const navigate = useNavigate();

  // Cargar movimientos desde el backend al montar
  React.useEffect(() => {
    const loadMovements = async () => {
      try {
        const data = await movementsAPI.getAll();
        setMovements(Array.isArray(data) ? data : []);
      } catch {
        setMovements([]);
      }
    };
    loadMovements();
  }, []);

  // Cargar productos, almacenes y usuarios desde sus APIs en useEffect inicial
  React.useEffect(() => {
    // Cargar productos
    productsAPI.getAll().then(setProducts);
    // Cargar almacenes
    warehousesAPI.getAll().then(setWarehouses);
    // Cargar usuarios
    if (typeof usersAPI !== 'undefined' && usersAPI.getAll) {
      usersAPI.getAll().then(setUsers);
    }
  }, []);

  const filteredMovements = movements.filter(
    movement => {
      const matchesSearch = search === '' || 
        (movement.detalles && movement.detalles[0]?.producto?.nombre && 
          movement.detalles[0]?.producto.nombre.toLowerCase().includes(search.toLowerCase())) ||
        (movement.detalles && movement.detalles[0]?.producto?.idProd && 
          products.find(p => p.id === String(movement.detalles[0]?.producto?.idProd))?.name?.toLowerCase().includes(search.toLowerCase()));
      
      const matchesType = filterType === 'all' || mapToMovementType(movement.tipoMov) === filterType;
      const matchesStatus = filterStatus === 'all' || movement.estado === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    }
  );

  const mapToMovementType = (tipoMov: string): MovementType => {
    // Convertimos a minúsculas para comparar insensible a mayúsculas
    const tipo = tipoMov ? tipoMov.toLowerCase() : '';
    
    if (tipo === 'entrada' || tipo === 'in') return 'in';
    if (tipo === 'salida' || tipo === 'out') return 'out';
    if (tipo === 'transferencia' || tipo === 'traspaso' || tipo === 'transfer') return 'transfer';
    
    // Si no coincide con ninguno, asumimos entrada como valor predeterminado
    return 'in';
  };

  const getMovementTypeIcon = (type: string) => {
    const mappedType = mapToMovementType(type);
    switch (mappedType) {
      case 'in':
        return <ArrowDown size={16} className="text-green-500" />;
      case 'out':
        return <ArrowUp size={16} className="text-red-500" />;
      case 'transfer':
        return <ArrowRight size={16} className="text-blue-500" />;
    }
  };

  const getMovementTypeLabel = (type: string) => {
    const mappedType = mapToMovementType(type);
    switch (mappedType) {
      case 'in':
        return 'Entrada';
      case 'out':
        return 'Salida';
      case 'transfer':
        return 'Transferencia';
    }
  };
  
  const getMovementTypeBadgeClass = (type: string) => {
    const mappedType = mapToMovementType(type);
    switch (mappedType) {
      case 'in':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'out':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'transfer':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeVariant = (status: Movement['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: Movement['status']) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const openModal = (movement: Movement | null = null) => {
    if (movement) {
      setCurrentMovement(movement);
      // Crear productos a partir de los detalles del movimiento
      const productItems = movement.detalles && movement.detalles.length > 0 
        ? movement.detalles.map(detalle => ({
            productId: detalle.producto?.idProd,
            quantity: detalle.cantidad || 1
          }))
        : [];
        
      setFormData({
        type: movement.tipoMov,
        sourceWarehouseId: movement.almacenOrigen?.idAlm || movement.almacenOrigen || '',
        destinationWarehouseId: movement.almacenDestino?.idAlm || movement.almacenDestino || '',
        status: movement.estado,
        requestedBy: movement.usuario?.id || movement.usuario || '',
        approvedBy: movement.aprobadoPor || '',
        notes: movement.motivo || '',
        products: productItems
      });
    } else {
      setCurrentMovement(null);
      setFormData({
        type: 'in',
        sourceWarehouseId: '',
        destinationWarehouseId: '',
        status: 'pending',
        requestedBy: '',
        approvedBy: '',
        notes: '',
        products: []
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSubmit = { ...formData };
    if (currentMovement) {
      await movementsAPI.update(currentMovement.id, dataToSubmit);
    } else {
      await movementsAPI.create(dataToSubmit);
    }
    // Refrescar lista
    const updated = await movementsAPI.getAll();
    setMovements(Array.isArray(updated) ? updated : []);
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este movimiento?')) {
      await movementsAPI.delete(id);
      const updated = await movementsAPI.getAll();
      setMovements(Array.isArray(updated) ? updated : []);
    }
  };

  const resetFilters = () => {
    setFilterType('all');
    setFilterStatus('all');
    setSearch('');
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
            const qrCode = result.getText();
            // Intentar extraer el ID del producto del QR (puede ser ID o URL)
            let productId = qrCode;
            // Si es una URL tipo /api/productos/3, extraer el número
            const match = qrCode.match(/(\d+)$/);
            if (match) productId = match[1];
            // Buscar el producto en la lista global
            const found = products.find(p => p.id === productId);
            if (found) {
              // Si ya está en la lista, incrementa cantidad
              setFormData(prev => {
                const idx = prev.products.findIndex(item => item.productId === productId);
                if (idx !== -1) {
                  const newProducts = [...prev.products];
                  newProducts[idx].quantity += 1;
                  return { ...prev, products: newProducts };
                } else {
                  return { ...prev, products: [...prev.products, { productId, quantity: 1 }] };
                }
              });
            } else {
              setQRError('Producto no encontrado.');
            }
          }
          setIsQRScannerOpen(false);
        })
        .catch(() => {
          setQRError('Error al escanear el QR o acceso denegado.');
          setIsQRScannerOpen(false);
        });
      // Limpiar la cámara al cerrar el modal
      return () => {
        codeReader.reset?.(); // Usar optional chaining para evitar error si reset no existe
      };
    }
  }, [isQRScannerOpen, products]);

  // --- FUNCIÓN PARA DESCARGAR EL TICKET PDF ---
  const downloadTicketPDF = async (movementId: string | number) => {
    const token = localStorage.getItem('auth-token');
    try {
      const response = await fetch(`http://localhost:8081/api/movimientos/${movementId}/ticket-pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!response.ok) {
        alert('No se pudo generar el ticket PDF');
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket_movimiento_${movementId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error al descargar el ticket PDF');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Movimientos</h1>
          <p className="text-gray-500">Gestiona los movimientos de inventario</p>
        </div>
        <Button 
          onClick={() => navigate('/movements/new')}
          leftIcon={<Plus size={16} />}
        >
          Nuevo Movimiento
        </Button>
      </div>

      {/* Buscador y filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Buscar por producto o notas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as MovementType | 'all')}
              className="rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">Todos los tipos</option>
              <option value="in">Entrada</option>
              <option value="out">Salida</option>
              <option value="transfer">Transferencia</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as Movement['status'] | 'all')}
              className="rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
            
            {(search || filterType !== 'all' || filterStatus !== 'all') && (
              <Button 
                variant="outline" 
                onClick={resetFilters}
                size="sm"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Vista de escritorio - Tabla */}
      <div className="hidden lg:block">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Motivo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Almacén de Origen
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Almacén de Destino
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Realiado por
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMovements.map((movement) => {
                const product = (movement.detalles && movement.detalles.length > 0)
                  ? products.find(p => p.id === String(movement.detalles[0]?.producto?.idProd))
                  : null;
                // Asegurarnos de obtener el almacén de origen correctamente
                const sourceWarehouse = typeof movement.almacenOrigen === 'object' 
                  ? movement.almacenOrigen 
                  : warehouses.find(w => w.idAlm === movement.almacenOrigen);
                
                // Asegurarnos de obtener el almacén de destino correctamente
                const destinationWarehouse = typeof movement.almacenDestino === 'object'
                  ? movement.almacenDestino
                  : movement.almacenDestino ? warehouses.find(w => w.idAlm === movement.almacenDestino) : null;
                const requestedByUser = users.find(u => u.id === (movement.usuario?.id || movement.usuario));
                const approvedByUser = movement.aprobadoPor 
                  ? users.find(u => u.id === (movement.aprobadoPor?.id || movement.aprobadoPor))
                  : null;

                return (
                  <tr 
                    key={movement.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        #{movement.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Badge className={`inline-flex items-center ${getMovementTypeBadgeClass(movement.tipoMov)}`}>
                          {getMovementTypeIcon(movement.tipoMov)}
                          <span className="ml-1">{getMovementTypeLabel(movement.tipoMov)}</span>
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2">
                        {movement.motivo || 'Sin motivo especificado'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {sourceWarehouse?.nombre || 'Desconocido'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {mapToMovementType(movement.tipoMov) === 'transfer' || mapToMovementType(movement.tipoMov) === 'in'
                          ? destinationWarehouse?.nombre || 'Desconocido'
                          : '—' // Solo en movimientos de salida no hay almacén de destino
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 lowercase first-letter:uppercase">
                        {movement.estado || 'desconocido'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {requestedByUser?.nombreUsuario || movement.usuarioMov || 'Desconocido'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movement.fecha ? formatDate(movement.fecha) : 'Sin fecha'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700"
                          title="Ver información detallada"
                          onClick={() => setShowNotesId(movement.id)}
                        >
                          <Info size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700"
                          onClick={() => openModal(movement)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(movement.id)}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vista móvil - Tarjetas */}
      <div className="lg:hidden space-y-4">
        {filteredMovements.map((movement) => {
          const product = (movement.detalles && movement.detalles.length > 0)
            ? products.find(p => p.id === String(movement.detalles[0]?.producto?.idProd))
            : null;
          // Asegurarnos de obtener el almacén de origen correctamente
          const sourceWarehouse = typeof movement.almacenOrigen === 'object' 
            ? movement.almacenOrigen 
            : warehouses.find(w => w.idAlm === movement.almacenOrigen);
          
          // Asegurarnos de obtener el almacén de destino correctamente
          const destinationWarehouse = typeof movement.almacenDestino === 'object'
            ? movement.almacenDestino
            : movement.almacenDestino ? warehouses.find(w => w.idAlm === movement.almacenDestino) : null;
          const requestedByUser = users.find(u => u.id === (movement.usuario?.id || movement.usuario));
          const approvedByUser = movement.aprobadoPor 
            ? users.find(u => u.id === (movement.aprobadoPor?.id || movement.aprobadoPor))
            : null;

          return (
            <Card 
              key={movement.id} 
              className="overflow-hidden hover:shadow-md transition-shadow duration-300 border border-gray-200"
            >
              <CardHeader className="py-3 px-4 bg-gray-50 flex flex-row items-center justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="primary">
                    <span className="flex items-center">
                      {getMovementTypeIcon(movement.tipoMov)}
                      <span className="ml-1">{getMovementTypeLabel(movement.tipoMov)}</span>
                    </span>
                  </Badge>
                  <Badge variant={getStatusBadgeVariant(movement.estado)}>
                    {getStatusLabel(movement.estado)}
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar size={14} className="mr-1" />
                  {movement.fecha ? formatDate(movement.fecha) : 'Sin fecha'}
                </div>
              </CardHeader>
              
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  {/* Columna izquierda */}
                  <div className="space-y-3">
                    {/* Product info */}
                    <div className="flex items-start space-x-2">
                      <Package size={16} className="text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">
                          {(movement.detalles && movement.detalles.length > 1)
                            ? `${movement.detalles.length} productos`
                            : product?.name || 'Producto no encontrado'}
                        </div>
                        {movement.detalles && movement.detalles.length === 1 && (
                          <div className="text-xs text-gray-500">
                            Cantidad: {movement.detalles && movement.detalles[0]?.cantidad}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Warehouse origen info */}
                    <div className="flex items-start space-x-2">
                      <WarehouseIcon size={16} className="text-gray-400 mt-0.5" />
                      <div className="text-sm">
                        <div className="text-xs text-gray-500">Almacén Origen</div>
                        <div className="font-medium">
                          {sourceWarehouse?.nombre || 'Desconocido'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Warehouse destino info (mostrar solo si es transferencia, o vacío) */}
                    <div className="flex items-start space-x-2">
                      <WarehouseIcon size={16} className="text-gray-400 mt-0.5" />
                      <div className="text-sm">
                        <div className="text-xs text-gray-500">Almacén Destino</div>
                        <div className="font-medium">
                          {mapToMovementType(movement.tipoMov) === 'transfer' 
                            ? destinationWarehouse?.nombre || 'Desconocido'
                            : '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Columna derecha */}
                  <div className="space-y-3">
                    {/* Solicitado por */}
                    <div className="flex items-start space-x-2">
                      <User size={16} className="text-gray-400 mt-0.5" />
                      <div className="text-sm">
                        <div className="text-xs text-gray-500">Solicitado por</div>
                        <div className="font-medium">{requestedByUser?.nombreUsuario || 'Usuario no encontrado'}</div>
                      </div>
                    </div>

                    {/* Aprobado por (si existe) */}
                    {approvedByUser && (
                      <div className="flex items-start space-x-2">
                        <User size={16} className="text-gray-400 mt-0.5" />
                        <div className="text-sm">
                          <div className="text-xs text-gray-500">Aprobado por</div>
                          <div className="font-medium">{approvedByUser?.nombreUsuario || 'Desconocido'}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notas (si existen) */}
                {movement.motivo && (
                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded-md">
                    <div className="font-medium mb-1">Notas:</div>
                    {movement.motivo}
                  </div>
                )}

                {/* Acciones */}
                <div className="flex gap-2 pt-1">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 h-8 border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-100"
                    onClick={() => setShowNotesId(movement.id)}
                    leftIcon={<Info size={14} />}
                  >
                    Detalles
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 h-8"
                    onClick={() => openModal(movement)}
                    leftIcon={<Edit size={14} />}
                  >
                    Editar
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                    onClick={() => handleDelete(movement.id)}
                    leftIcon={<Trash size={14} />}
                  >
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Estado vacío */}
      {filteredMovements.length === 0 && (
        <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-gray-200">
          <MoveRight size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No se encontraron movimientos</h3>
          <p className="text-gray-500 mt-1">
            {search || filterType !== 'all' || filterStatus !== 'all' 
              ? 'Intenta ajustar tus filtros de búsqueda' 
              : 'Registra tu primer movimiento para comenzar'}
          </p>
          {(!search && filterType === 'all' && filterStatus === 'all') && (
            <Button 
              className="mt-4"
              onClick={() => navigate('/movements/new')}
              leftIcon={<Plus size={16} />}
            >
              Nuevo Movimiento
            </Button>
          )}
          {(search || filterType !== 'all' || filterStatus !== 'all') && (
            <Button 
              variant="outline"
              className="mt-4"
              onClick={resetFilters}
              leftIcon={<Filter size={16} />}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      )}

      {/* Modal para agregar/editar movimiento */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-backdrop animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full modal-content animate-slideIn">
            <div className="flex justify-between items-center border-b p-5">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                {currentMovement ? (
                  <>
                    <Edit className="mr-2 h-5 w-5 text-blue-500" />
                    Editar Movimiento
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-5 w-5 text-green-500" />
                    Nuevo Movimiento
                  </>
                )}
              </h2>
              <button 
                onClick={closeModal}
                className="rounded-full p-1 hover:bg-gray-100 transition-colors"
                aria-label="Cerrar">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tipo de movimiento - Sección destacada */}
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <MoveRight className="mr-2 h-5 w-5 text-blue-500" />
                      Tipo de Movimiento
                    </label>
                    <div className="flex gap-3">
                      <label className={`
                        flex-1 flex items-center justify-center gap-2 rounded-md border p-3 cursor-pointer transition-all
                        ${formData.type === 'in' ? 'bg-green-50 border-green-200 text-green-700 ring-2 ring-green-200' : 'border-gray-200 hover:bg-gray-50'}
                      `}>
                        <input 
                          type="radio" 
                          name="type" 
                          value="in"
                          checked={formData.type === 'in'}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <ArrowDown className="h-5 w-5" />
                        <span className="font-medium">Entrada</span>
                      </label>
                      
                      <label className={`
                        flex-1 flex items-center justify-center gap-2 rounded-md border p-3 cursor-pointer transition-all
                        ${formData.type === 'out' ? 'bg-red-50 border-red-200 text-red-700 ring-2 ring-red-200' : 'border-gray-200 hover:bg-gray-50'}
                      `}>
                        <input 
                          type="radio" 
                          name="type" 
                          value="out"
                          checked={formData.type === 'out'}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <ArrowUp className="h-5 w-5" />
                        <span className="font-medium">Salida</span>
                      </label>
                      
                      <label className={`
                        flex-1 flex items-center justify-center gap-2 rounded-md border p-3 cursor-pointer transition-all
                        ${formData.type === 'transfer' ? 'bg-blue-50 border-blue-200 text-blue-700 ring-2 ring-blue-200' : 'border-gray-200 hover:bg-gray-50'}
                      `}>
                        <input 
                          type="radio" 
                          name="type" 
                          value="transfer"
                          checked={formData.type === 'transfer'}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <ArrowRight className="h-5 w-5" />
                        <span className="font-medium">Transferencia</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">

                  {/* Sección mejorada de productos múltiples */}
                  <div className="space-y-4 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <Package className="mr-2 h-4 w-4 text-gray-500" />
                        Productos
                      </label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              products: [
                                ...prev.products, 
                                { productId: '', quantity: 1 }
                              ]
                            }));
                          }}
                        >
                          <Plus size={14} className="mr-1" />
                          Añadir Producto
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 text-xs bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                          onClick={() => setIsQRScannerOpen(true)}
                        >
                          Escanear QR
                        </Button>
                      </div>
                    </div>
                    
                    {/* Lista de productos seleccionados */}
                    {formData.products.length > 0 ? (
                      <div className="space-y-3">
                        {formData.products.map((item, index) => {
                          const selectedProduct = products.find(p => p.id === item.productId);
                          
                          return (
                            <div key={index} className="border border-gray-200 rounded-lg p-3 bg-white">
                              <div className="flex justify-between mb-3">
                                <h5 className="font-medium text-sm flex items-center">
                                  Producto {index + 1}
                                </h5>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      products: prev.products.filter((_, i) => i !== index)
                                    }));
                                  }}
                                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {/* Selector de producto */}
                                <div className="md:col-span-2">
                                  <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Seleccionar producto
                                  </label>
                                  <select
                                    value={item.productId}
                                    onChange={(e) => {
                                      const newProducts = [...formData.products];
                                      newProducts[index].productId = e.target.value;
                                      
                                      // Actualizar también el campo legacy si es el primer producto
                                      const updatedFormData = {
                                        ...formData,
                                        products: newProducts
                                      };
                                      
                                      if (index === 0) {
                                        updatedFormData.productId = e.target.value;
                                      }
                                      
                                      setFormData(updatedFormData);
                                    }}
                                    className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm"
                                    required
                                  >
                                    <option value="">Seleccionar producto</option>
                                    {products.map(product => (
                                      <option key={product.id} value={product.id}>
                                        {product.name} - SKU: {product.sku} (Stock: {product.quantity})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                
                                {/* Cantidad */}
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Cantidad
                                  </label>
                                  <div className="flex rounded-md">
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        const newProducts = [...formData.products];
                                        newProducts[index].quantity = Math.max(1, newProducts[index].quantity - 1);
                                        
                                        // Actualizar también el campo legacy si es el primer producto
                                        const updatedFormData = {
                                          ...formData,
                                          products: newProducts
                                        };
                                        
                                        if (index === 0) {
                                          updatedFormData.quantity = newProducts[index].quantity;
                                        }
                                        
                                        setFormData(updatedFormData);
                                      }}
                                      className="px-2 py-1 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md hover:bg-gray-200 transition-colors"
                                    >
                                      <span className="sr-only">Disminuir</span>
                                      <span className="text-gray-500 font-bold">-</span>
                                    </button>
                                    <input
                                      type="number"
                                      value={item.quantity}
                                      onChange={(e) => {
                                        const value = parseInt(e.target.value) || 1;
                                        const newProducts = [...formData.products];
                                        newProducts[index].quantity = value;
                                        
                                        // Actualizar también el campo legacy si es el primer producto
                                        const updatedFormData = {
                                          ...formData,
                                          products: newProducts
                                        };
                                        
                                        if (index === 0) {
                                          updatedFormData.quantity = value;
                                        }
                                        
                                        setFormData(updatedFormData);
                                      }}
                                      className="flex-1 rounded-none border border-gray-300 shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm text-center"
                                      required
                                      min="1"
                                    />
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        const newProducts = [...formData.products];
                                        newProducts[index].quantity = newProducts[index].quantity + 1;
                                        
                                        // Actualizar también el campo legacy si es el primer producto
                                        const updatedFormData = {
                                          ...formData,
                                          products: newProducts
                                        };
                                        
                                        if (index === 0) {
                                          updatedFormData.quantity = newProducts[index].quantity;
                                        }
                                        
                                        setFormData(updatedFormData);
                                      }}
                                      className="px-2 py-1 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 transition-colors"
                                    >
                                      <span className="sr-only">Aumentar</span>
                                      <span className="text-gray-500 font-bold">+</span>
                                    </button>
                                  </div>
                                  
                                  {item.productId && formData.type !== 'in' && (() => {
                                    const selectedProduct = products.find(p => p.id === item.productId);
                                    if (item.quantity > (selectedProduct?.quantity || 0)) {
                                      return (
                                        <div className="text-xs text-red-600 mt-1 animate-fadeIn">
                                          Excede el stock ({selectedProduct?.quantity || 0})
                                        </div>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>
                              </div>
                              
                              {/* Detalles del producto */}
                              {selectedProduct && (
                                <div className="mt-3 bg-blue-50 rounded-md p-3 border border-blue-100 expand-animation">
                                  <div className="flex items-start space-x-3">
                                    {selectedProduct.image && (
                                      <div className="overflow-hidden rounded-md border border-gray-200">
                                        <img 
                                          src={selectedProduct.image} 
                                          alt={selectedProduct.name} 
                                          className="h-14 w-14 object-cover image-hover"
                                        />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <div className="flex justify-between items-start">
                                        <h5 className="font-medium text-sm">{selectedProduct.name}</h5>
                                        <Badge variant="outline" className="text-xs">{selectedProduct.sku}</Badge>
                                      </div>
                                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{selectedProduct.description}</p>
                                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                                        <span className="flex items-center bg-white px-2 py-1 rounded-md border border-gray-200">
                                          <span className="text-gray-500 mr-1">Precio:</span> 
                                          <span className="font-medium">${selectedProduct.price.toFixed(2)}</span>
                                        </span>
                                        <span className="flex items-center bg-white px-2 py-1 rounded-md border border-gray-200">
                                          <span className="text-gray-500 mr-1">Stock:</span>
                                          <span className="font-medium">{selectedProduct.quantity}</span>
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div 
                        className="border border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            products: [...prev.products, { productId: '', quantity: 1 }],
                          }));
                        }}
                      >
                        <Package className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-gray-500">Haz click para añadir un producto</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <WarehouseIcon className="mr-2 h-4 w-4 text-gray-500" />
                      Almacén de {formData.type === 'transfer' ? 'Origen' : 'Movimiento'}
                    </label>
                    <select
                      name="sourceWarehouseId"
                      value={formData.sourceWarehouseId}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border border-gray-300 shadow-sm py-2.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm transition-all duration-200 form-input-hover"
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

                  {formData.type === 'transfer' && (
                    <div className="space-y-2 expand-animation">
                      <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <ArrowRight className="mr-2 h-4 w-4 text-blue-500" />
                        Almacén de Destino
                      </label>
                      <select
                        name="destinationWarehouseId"
                        value={formData.destinationWarehouseId}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border border-gray-300 shadow-sm py-2.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm transition-all duration-200 form-input-hover"
                        required
                      >
                        <option value="">Seleccionar almacén</option>
                        {warehouses
                          .filter(w => w.idAlm !== formData.sourceWarehouseId)
                          .map(warehouse => (
                            <option key={warehouse.idAlm} value={warehouse.idAlm}>
                              {warehouse.nombre}
                            </option>
                          ))}
                      </select>
                      {formData.sourceWarehouseId && !formData.destinationWarehouseId && (
                        <p className="text-xs text-blue-600 mt-1 animate-fadeIn">
                          Debes seleccionar un almacén de destino diferente al de origen
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <Info className="mr-2 h-4 w-4 text-gray-500" />
                      Estado
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border border-gray-300 shadow-sm py-2.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm transition-all duration-200"
                      required
                    >
                      <option value="pending">Pendiente</option>
                      <option value="completed">Completado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <User className="mr-2 h-4 w-4 text-gray-500" />
                      Solicitado por
                    </label>
                    <select
                      name="requestedBy"
                      value={formData.requestedBy}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border border-gray-300 shadow-sm py-2.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm transition-all duration-200"
                      required
                    >
                      <option value="">Seleccionar usuario</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <User className="mr-2 h-4 w-4 text-gray-500" />
                      Aprobado por
                    </label>
                    <select
                      name="approvedBy"
                      value={formData.approvedBy}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border border-gray-300 shadow-sm py-2.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm transition-all duration-200"
                    >
                      <option value="">Seleccionar usuario</option>
                      {users
                        .filter(user => ['admin', 'manager'].includes(user.role))
                        .map(user => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                
                <div className="mt-8 pt-4 border-t border-gray-100">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <Info className="mr-2 h-5 w-5 text-blue-500" />
                      Notas
                    </label>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        className="block w-full rounded-md border border-gray-200 shadow-inner py-2.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm transition-all duration-200 form-input-hover"
                        placeholder="Escribe notas adicionales aquí..."
                      />
                      <div className="flex justify-between text-xs text-gray-500 px-2 pt-2">
                        <span>Información adicional sobre este movimiento</span>
                        <span>{formData.notes.length} caracteres</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 mt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                    className="px-5 py-2 hover:bg-gray-100 transition-colors"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 transition-colors shadow-sm hover:shadow pulse-animation"
                  >
                    {currentMovement ? 'Actualizar Movimiento' : 'Crear Movimiento'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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

      {/* Modal de información detallada */}
      {showNotesId && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-backdrop animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full modal-content animate-scaleIn">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="font-medium text-lg flex items-center">
                <Info className="mr-2 h-5 w-5 text-blue-500" />
                Información del Movimiento
              </h3>
              <button
                onClick={() => setShowNotesId(null)}
                className="rounded-full p-1 hover:bg-gray-100 transition-colors"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5">
              {(() => {
                const movement = filteredMovements.find(m => m.id === showNotesId);
                if (!movement) return null;

                // --- INICIO DE CAMBIO: Añadir logs ---
                if (movement) {
                  console.log(`[DEBUG] Movimiento seleccionado (ID: ${showNotesId}):`, JSON.stringify(movement, null, 2));
                  console.log(`[DEBUG] Detalles crudos del movimiento (ID: ${showNotesId}):`, JSON.stringify(movement.detalles, null, 2));
                }
                // --- FIN DE CAMBIO ---

                const detallesConProductos = movement?.detalles?.map(detalle => {
                  try {
                    // Si el producto ya está completo, lo usamos directamente
                    if (detalle.producto && detalle.producto.nombre) {
                      return {
                        ...detalle,
                        // Asegurarnos que tenga el ID del movimiento
                        movimientoId: detalle.movimientoId || movement.id,
                        // Asegurarse de que cantidad sea un número para la visualización
                        cantidad: typeof detalle.cantidad === 'string' ? parseFloat(detalle.cantidad) : detalle.cantidad
                      };
                    }
                    
                    // Si solo tenemos el ID, buscamos el producto completo
                    const productId = detalle.producto?.idProd || detalle.producto;
                    const productoCompleto = products.find(p => 
                      p.id === String(productId) || 
                      p.idProd === productId
                    );
                    
                    if (productoCompleto) {
                      return {
                        ...detalle,
                        movimientoId: detalle.movimientoId || movement.id,
                        cantidad: typeof detalle.cantidad === 'string' ? parseFloat(detalle.cantidad) : detalle.cantidad,
                        producto: {
                          idProd: productId,
                          nombre: productoCompleto.name || productoCompleto.nombre,
                          codigo: productoCompleto.code || productoCompleto.sku || productoCompleto.codigo
                        }
                      };
                    }
                    
                    // Si no encontramos el producto, devolvemos lo que tenemos
                    return {
                      ...detalle,
                      movimientoId: detalle.movimientoId || movement.id,
                      cantidad: typeof detalle.cantidad === 'string' ? parseFloat(detalle.cantidad) : detalle.cantidad,
                      producto: {
                        idProd: productId,
                        nombre: 'Producto no encontrado',
                        codigo: 'N/A'
                      }
                    };
                  } catch (error) {
                    console.error('Error procesando detalle:', detalle, error);
                    return {
                      ...detalle,
                      movimientoId: detalle.movimientoId || movement.id,
                      cantidad: 0,
                      producto: {
                        idProd: detalle.producto || 0,
                        nombre: 'Error en datos',
                        codigo: 'Error'
                      }
                    };
                  }
                }) || [];
                
                // Asegurarnos de obtener el almacén de origen correctamente
                const sourceWarehouse = movement?.almacenOrigen && typeof movement.almacenOrigen === 'object'
                  ? movement.almacenOrigen
                  : warehouses.find(w => w.idAlm === movement?.almacenOrigen);
                
                // Asegurarnos de obtener el almacén de destino correctamente
                const destinationWarehouse = movement?.almacenDestino && typeof movement.almacenDestino === 'object'
                  ? movement.almacenDestino
                  : movement?.almacenDestino ? warehouses.find(w => w.idAlm === movement.almacenDestino) : null;
                
                const requestedByUser = users.find(u => u.id === (movement?.usuario?.id || movement?.usuario));
                
                if (!movement) return <div>No se encontró información del movimiento</div>;
                
                // Debug: Ver la estructura de los datos en la consola
                console.log('Movement details:', {
                  movement,
                  detalles: movement.detalles,
                  detallesConProductos,
                  products
                });
                
                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Columna izquierda */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 mb-2">Información General</h4>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-xs text-gray-500 block">ID</span>
                              <span className="font-medium">#{movement.id}</span>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500 block">Tipo</span>
                              <span className="font-medium">
                                {getMovementTypeLabel(movement.tipoMov)}
                              </span>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500 block">Fecha</span>
                              <span className="text-sm">{movement.fecha ? formatDate(movement.fecha) : 'Sin fecha'}</span>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500 block">Estado</span>
                              <span className="text-sm uppercase">{movement.estado || 'No disponible'}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-xs text-gray-500 block">Motivo</span>
                              <span className="text-sm">{movement.motivo || 'Sin motivo especificado'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-gray-500 mb-2">Almacenes</h4>
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-4">
                            <div>
                              <span className="text-xs text-gray-500 block">Origen</span>
                              <div className="flex items-center mt-1">
                                <WarehouseIcon className="h-4 w-4 mr-1" />
                                <span className="font-medium">{sourceWarehouse?.nombre || 'Desconocido'}</span>
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-xs text-gray-500 block">Destino</span>
                              <div className="flex items-center mt-1">
                                <WarehouseIcon className="h-4 w-4 mr-1" />
                                <span className="font-medium">
                                  {mapToMovementType(movement.tipoMov) === 'transfer' 
                                    ? destinationWarehouse?.nombre || 'Desconocido'
                                    : '—'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Columna derecha */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-500 mb-2">
                            Detalles del Movimiento ({detallesConProductos?.length || 0} productos)
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <p className="text-xs text-gray-500 mb-3">
                              Cada detalle muestra la relación entre un producto y este movimiento (ID: #{movement.id}).
                            </p>
                            {detallesConProductos && detallesConProductos.length > 0 ? (
                              <div>
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
                                      <th className="pb-2 font-medium">ID Detalle</th>
                                      <th className="pb-2 font-medium">ID Mov.</th>
                                      <th className="pb-2 font-medium">ID Prod.</th>
                                      <th className="pb-2 font-medium">Producto</th>
                                      <th className="pb-2 font-medium text-right">Cantidad</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {detallesConProductos.map((detalle, index) => (
                                      <tr key={detalle.id || index} className="border-b border-gray-100 last:border-0">
                                        <td className="py-2 align-top">
                                          #{detalle.id || `${index + 1}`}
                                        </td>
                                        <td className="py-2 align-top">
                                          #{detalle.movimientoId || movement.id}
                                        </td>
                                        <td className="py-2 align-top">
                                          #{detalle.producto?.idProd || 'N/A'}
                                        </td>
                                        <td className="py-2 align-top">
                                          <div className="font-medium">
                                            {detalle.producto?.nombre || 'Producto desconocido'}
                                          </div>
                                          {detalle.producto?.codigo && (
                                            <div className="text-xs text-gray-500 mt-1">
                                              Código: {detalle.producto.codigo}
                                            </div>
                                          )}
                                        </td>
                                        <td className="py-2 text-right align-top">
                                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                            {detalle.cantidad || '0'}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="text-gray-500 italic">No hay productos asociados a este movimiento</div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-semibold text-gray-500 mb-2">Responsables</h4>
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="mb-2">
                              <span className="text-xs text-gray-500 block">Solicitado por</span>
                              <div className="flex items-center mt-1">
                                <User className="h-4 w-4 mr-1" />
                                <span className="font-medium">
                                  {requestedByUser?.nombreUsuario || movement.usuarioMov || 'admin'}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500 uppercase block mt-1">
                                {requestedByUser?.rol?.nombre || 'ADMIN'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>                    </div>                            {/* Resumen del movimiento */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-500 mb-2">Resumen del Movimiento</h4>
                              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                  <div>
                                    <span className="text-xs text-gray-500 block">ID Movimiento</span>
                                    <span className="font-medium text-blue-600 flex items-center">
                                      #{movement.id}
                                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                        Principal
                                      </span>
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500 block">Total productos</span>
                                    <span className="font-medium">{detallesConProductos?.length || 0}</span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500 block">Total unidades</span>
                                    <span className="font-medium">
                                      {detallesConProductos?.reduce((total, det) => total + (Number(det.cantidad) || 0), 0) || 0}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                    
                    {/* Notas */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-2">Notas</h4>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        {movement.motivo ? (
                          <span className="text-gray-700">{movement.motivo}</span>
                        ) : (
                          <span className="text-gray-400 italic">Sin notas</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="border-t p-4 flex justify-end gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const movement = filteredMovements.find(m => m.id === showNotesId);
                  if (movement) downloadTicketPDF(movement.id);
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                Generar Ticket PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNotesId(null)}
                className="px-5 py-2 hover:bg-gray-100 transition-colors"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};