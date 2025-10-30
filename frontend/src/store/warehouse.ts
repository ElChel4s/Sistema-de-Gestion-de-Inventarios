// Solo la interfaz Warehouse, sin helpers ni imports innecesarios
export interface Warehouse {
  idAlm: number;
  nombre: string;
  ubicacion: string;
  capacidad: number;
  estado: string;
  responsable?: {
    id: number;
    nombreUsuario: string;
    rol?: {
      id: number;
      nombre: string;
      descripcion?: string;
    };
  };
}

// Eliminar datos mock y atom local. La gestión será por API.