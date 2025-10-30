// MovementDetailModal.tsx
import React from 'react';
import { Movement as MovementDTO, DetalleMovimiento as BaseDetalleMovimientoDTO } from '../store/movement';
import { Product as ProductDTO } from '../store/product';
import { Warehouse } from '../store/warehouse';
import { User } from '../store/user';
import { Button } from './ui/button';
import { X, Info, Warehouse as WarehouseIcon, User as UserIconLucide, Package as PackageIcon, Tag, ShoppingCart, AlertTriangle } from 'lucide-react';
import { formatDate } from '../lib/utils';

// Interfaz para el detalle enriquecido que usará el modal internamente
interface EnrichedDetalleMovimiento {
  id?: number; // id del DetalleMovimiento original
  movimientoId: number;
  cantidad: number;
  producto: ProductDTO; // Producto completo
}

const getMovementTypeLabel = (type: string | undefined) => {
  if (!type) return 'N/A';
  switch (type.toUpperCase()) {
    case 'ENTRADA':
    case 'IN':
      return 'Entrada';
    case 'SALIDA':
    case 'OUT':
      return 'Salida';
    case 'TRASPASO':
    case 'TRANSFER':
      return 'Traspaso';
    default: return type;
  }
};

// Helper para crear un ProductDTO placeholder en caso de error o no encontrado
const createPlaceholderProduct = (productId: string | number = "0"): ProductDTO => ({
  id: String(productId),
  name: `Producto ID ${productId} no encontrado`,
  sku: 'N/A',
  description: 'Los detalles de este producto no están disponibles.',
  categoryId: 'unknown',
  price: 0,
  cost: 0,
  quantity: 0, // Representa el stock actual, no la cantidad en el movimiento
  qrCode: '',
  createdAt: new Date(),
  updatedAt: new Date(),
});

interface MovementDetailModalProps {
  movement: MovementDTO | null;
  products: ProductDTO[];
  warehouses: Warehouse[];
  users: User[];
  onClose: () => void;
}

export const MovementDetailModal: React.FC<MovementDetailModalProps> = ({
  movement,
  products,
  warehouses,
  users,
  onClose
}) => {
  if (!movement) return null;

  const enrichedDetalles: EnrichedDetalleMovimiento[] = movement.detalles?.map((detalleInput: BaseDetalleMovimientoDTO): EnrichedDetalleMovimiento | null => {
    try {
      let productoFinal: ProductDTO;
      const cantidadNum = typeof detalleInput.cantidad === 'string' ? parseFloat(detalleInput.cantidad) : detalleInput.cantidad;

      let productIdToSearch: string | number | undefined;

      if (detalleInput.producto) {
        if (typeof detalleInput.producto === 'object' && detalleInput.producto.idProd !== undefined) {
          productIdToSearch = detalleInput.producto.idProd; // idProd es number
        } else if (typeof detalleInput.producto === 'string' || typeof detalleInput.producto === 'number') {
          productIdToSearch = detalleInput.producto; // El producto es directamente un ID
        } else if (typeof detalleInput.producto === 'object' && (detalleInput.producto as ProductDTO).id !== undefined) { // Si es un objeto con 'id' (posiblemente ProductDTO parcial/malformado)
          productIdToSearch = (detalleInput.producto as ProductDTO).id;
        }
      }

      if (productIdToSearch === undefined) {
        console.warn('No se pudo determinar el ID del producto para el detalle:', detalleInput);
        productoFinal = createPlaceholderProduct(detalleInput.producto?.idProd || 'Desconocido');
      } else {
        const productoCompleto = products.find(p => String(p.id) === String(productIdToSearch));
        if (productoCompleto) {
          productoFinal = productoCompleto;
        } else {
          productoFinal = createPlaceholderProduct(productIdToSearch);
        }
      }
      
      return {
        id: detalleInput.id,
        movimientoId: detalleInput.movimientoId || movement.id,
        cantidad: isNaN(cantidadNum) ? 0 : cantidadNum,
        producto: productoFinal,
      };

    } catch (error) {
      console.error('Error procesando detalle en Modal:', detalleInput, error);
      return {
        id: detalleInput.id,
        movimientoId: detalleInput.movimientoId || movement.id,
        cantidad: typeof detalleInput.cantidad === 'number' ? detalleInput.cantidad : 0,
        producto: createPlaceholderProduct(detalleInput.producto?.idProd || 'Error'),
      };
    }
  }).filter(Boolean) as EnrichedDetalleMovimiento[] || [];


  const origenId = typeof movement.almacenOrigen === 'object' 
    ? movement.almacenOrigen?.idAlm 
    : movement.almacenOrigen;
  const sourceWarehouse = origenId !== undefined && origenId !== null 
    ? warehouses.find(w => String(w.idAlm) === String(origenId)) 
    : null;

  const destinoId = typeof movement.almacenDestino === 'object'
    ? movement.almacenDestino?.idAlm
    : movement.almacenDestino;
  const destinationWarehouse = destinoId !== undefined && destinoId !== null 
    ? warehouses.find(w => String(w.idAlm) === String(destinoId)) 
    : null;
  
  let userIdToCompare: string | number | undefined;
  if (movement.usuario) {
      userIdToCompare = typeof movement.usuario === 'object' ? movement.usuario.id : movement.usuario;
  } else if (movement.usuarioMov) {
      userIdToCompare = movement.usuarioMov;
  }
  const requestedByUser = userIdToCompare !== undefined
      ? users.find(u => String(u.id) === String(userIdToCompare))
      : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-backdrop animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full modal-content animate-scaleIn max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center border-b p-5 sticky top-0 bg-white z-10">
          <h3 className="font-semibold text-xl flex items-center text-gray-800">
            <Info className="mr-3 h-6 w-6 text-blue-600" />
            Detalle del Movimiento
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-gray-200 transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Sección de Información General */}
          <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
            <h4 className="text-base font-medium text-slate-700 mb-3 flex items-center">
              <Tag className="w-5 h-5 mr-2 text-slate-500"/>
              Información General
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
              <div>
                <span className="text-xs text-slate-500 block">ID Movimiento</span>
                <span className="font-medium text-slate-800">#{movement.id}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Tipo</span>
                <span className="font-medium text-slate-800">
                  {getMovementTypeLabel(movement.tipoMov)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Fecha</span>
                <span className="text-slate-800">{movement.fecha ? formatDate(movement.fecha) : 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Estado</span>
                <span className="font-medium text-slate-800 uppercase">{movement.estado || 'N/A'}</span>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <span className="text-xs text-slate-500 block">Motivo</span>
                <p className="text-slate-800 leading-relaxed">{movement.motivo || 'Sin motivo especificado.'}</p>
              </div>
            </div>
          </div>

          {/* Sección de Almacenes y Usuario */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
              <h4 className="text-base font-medium text-slate-700 mb-3 flex items-center">
                <WarehouseIcon className="w-5 h-5 mr-2 text-slate-500"/>
                Almacenes Involucrados
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">Almacén Origen</span>
                  <span className="font-medium text-slate-800">{sourceWarehouse?.nombre || 'N/A'}</span>
                  {sourceWarehouse && <span className="text-xs text-slate-400 ml-2">ID: {sourceWarehouse.idAlm}</span>}
                </div>
                {movement.tipoMov?.toUpperCase() !== 'SALIDA' && (
                  <div>
                    <span className="text-xs text-slate-500 block">Almacén Destino</span>
                    <span className="font-medium text-slate-800">{destinationWarehouse?.nombre || 'N/A'}</span>
                    {destinationWarehouse && <span className="text-xs text-slate-400 ml-2">ID: {destinationWarehouse.idAlm}</span>}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
              <h4 className="text-base font-medium text-slate-700 mb-3 flex items-center">
                <UserIconLucide className="w-5 h-5 mr-2 text-slate-500"/>
                Usuario
              </h4>
              <div className="text-sm">
                <span className="text-xs text-slate-500 block">Solicitado por</span>
                <span className="font-medium text-slate-800">{requestedByUser?.name || movement.usuarioMov || 'Desconocido'}</span>
                {requestedByUser && <span className="text-xs text-slate-400 ml-2">ID: {requestedByUser.id}</span>}
              </div>
            </div>
          </div>
          
          {/* Sección de Productos */}
          <div>
            <h4 className="text-base font-medium text-slate-700 mb-3 flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2 text-slate-500"/>
              Productos ({enrichedDetalles.length || 0})
            </h4>
            {enrichedDetalles.length > 0 ? (
              <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-100">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Producto</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">SKU/Código</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Cantidad</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {enrichedDetalles.map((detalle, index) => (
                      <tr key={detalle.id || detalle.producto.id || index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900">{detalle.producto.name}</div>
                          <div className="text-xs text-slate-500">ID: {detalle.producto.id}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">{detalle.producto.sku || 'N/A'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700 text-right font-medium">{detalle.cantidad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 border border-dashed border-slate-300 rounded-md">
                <PackageIcon className="mx-auto h-10 w-10 text-slate-400 mb-2" />
                No hay productos detallados en este movimiento.
              </div>
            )}
             {movement.detalles === null && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-700 flex items-start">
                    <AlertTriangle className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0" />
                    <span>Los detalles de los productos para este movimiento (ID: {movement.id}) no pudieron ser cargados (recibido: null). Esto usualmente indica un problema con los datos provenientes del servidor.</span>
                </div>
            )}
          </div>
        </div>

        <div className="border-t p-4 bg-slate-50 sticky bottom-0">
          <Button 
            onClick={onClose} 
            variant="outline"
            className="w-full sm:w-auto"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};
