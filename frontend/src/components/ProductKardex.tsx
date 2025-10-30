import React, { useEffect, useState } from 'react';
import { kardexAPI, KardexDTO } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { Badge } from './ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';

interface ProductKardexProps {
  productId: number;
  productName: string;
  open: boolean;
  onClose: () => void;
}

export const ProductKardex: React.FC<ProductKardexProps> = ({ productId, productName, open, onClose }) => {
  const [kardex, setKardex] = useState<KardexDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError(null);
      kardexAPI.getByProduct(productId)
        .then(setKardex)
        .catch(err => setError(err.message || 'Error al cargar el kardex'))
        .finally(() => setLoading(false));
    }
  }, [open, productId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Kardex de: {productName}</CardTitle>
            <Button variant="outline" size="sm" onClick={onClose}>Cerrar</Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">Cargando movimientos...</div>
          ) : error ? (
            <div className="py-8 text-center text-red-600">{error}</div>
          ) : kardex.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No hay movimientos para este producto.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase">Usuario</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase">Almacén Origen</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase">Almacén Destino</th>
                    <th className="px-2 py-2 text-right font-medium text-gray-500 uppercase">Cantidad</th>
                    <th className="px-2 py-2 text-right font-medium text-gray-500 uppercase">Saldo Anterior</th>
                    <th className="px-2 py-2 text-right font-medium text-gray-500 uppercase">Saldo Posterior</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase">Motivo</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {kardex.map((mov) => (
                    <tr key={mov.movimientoId}>
                      <td className="px-2 py-2 whitespace-nowrap">{new Date(mov.fecha).toLocaleString()}</td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <Badge variant={mov.tipoMovimiento === 'entrada' ? 'success' : mov.tipoMovimiento === 'salida' ? 'danger' : 'primary'}>
                          {mov.tipoMovimiento.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">{mov.usuarioMovimiento}</td>
                      <td className="px-2 py-2 whitespace-nowrap">{mov.almacenOrigen || '-'}</td>
                      <td className="px-2 py-2 whitespace-nowrap">{mov.almacenDestino || '-'}</td>
                      <td className="px-2 py-2 whitespace-nowrap text-right">{mov.cantidad}</td>
                      <td className="px-2 py-2 whitespace-nowrap text-right">{mov.saldoAnterior}</td>
                      <td className="px-2 py-2 whitespace-nowrap text-right">{mov.saldoPosterior}</td>
                      <td className="px-2 py-2 whitespace-nowrap">{mov.motivo || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </div>
    </div>
  );
};
