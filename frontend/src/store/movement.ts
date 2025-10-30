export type MovementType = 'in' | 'out' | 'transfer';

export interface MovementProduct {
  productId: string;
  quantity: number;
}

export interface DetalleMovimiento {
  id: number;
  movimientoId: number; // Relación explícita con el movimiento padre
  producto: {
    idProd: number;
    nombre: string;
    sku?: string;
  };
  cantidad: number;
}

// NUEVO: Interfaz Movement adaptada al backend
export interface Movement {
  id: number;
  tipoMov: string;
  fecha: string;
  usuarioMov: string;
  estado: string;
  usuario?: {
    id: number;
    nombreUsuario: string;
    rol: { nombre: string };
  };
  almacenOrigen?: { idAlm: number; nombre: string };
  almacenDestino?: { idAlm: number; nombre: string };
  motivo?: string;
  detalles: DetalleMovimiento[];
}
