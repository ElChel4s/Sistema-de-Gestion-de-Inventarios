import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  Users,
  User,
  Phone,
  Building,
  Mail
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { usersAPI } from '../lib/api';

// Definición del tipo de usuario según backend
export type UserRole = 'admin' | 'manager' | 'staff';
export interface UserType {
  id: number;
  nombreUsuario: string;
  claveHash?: string;
  rol: { id: number; nombre: UserRole; descripcion?: string };
  creadoEn?: string;
  // Extras para UI
  phone?: string;
  department?: string;
  avatar?: string;
}

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    nombreUsuario: '',
    claveHash: '',
    rol: 'staff' as UserRole,
    phone: '',
    department: '',
    avatar: '',
  });

  // Cargar usuarios del backend
  useEffect(() => {
    usersAPI.getAll().then(setUsers);
  }, []);

  const filteredUsers = users.filter(
    user => 
      user.nombreUsuario.toLowerCase().includes(search.toLowerCase()) ||
      user.department?.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'primary';
      case 'manager':
        return 'success';
      case 'staff':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'manager':
        return 'Gerente';
      case 'staff':
        return 'Personal';
      default:
        return role;
    }
  };

  const openModal = (user: UserType | null = null) => {
    if (user) {
      setCurrentUser(user);
      setFormData({
        nombreUsuario: user.nombreUsuario,
        claveHash: '', // Nunca mostrar el hash real
        rol: user.rol?.nombre || 'staff',
        phone: user.phone || '',
        department: user.department || '',
        avatar: user.avatar || '',
      });
    } else {
      setCurrentUser(null);
      setFormData({
        nombreUsuario: '',
        claveHash: '',
        rol: 'staff',
        phone: '',
        department: '',
        avatar: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
      if (currentUser) {
        // Actualizar usuario
        const updated = await usersAPI.update(currentUser.id, {
          ...formData,
          rol: { nombre: formData.rol },
        });
        setUsers(users.map(u => (u.id === updated.id ? updated : u)));
      } else {
        // Crear usuario
        const created = await usersAPI.create({
          ...formData,
          rol: { nombre: formData.rol },
        });
        setUsers([...users, created]);
      }
      closeModal();
    } catch (err) {
      alert('Error al guardar usuario: ' + (err as any).message);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await usersAPI.delete(id);
        setUsers(users.filter(u => u.id !== id));
      } catch (err) {
        alert('Error al eliminar usuario: ' + (err as any).message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-500">Gestiona los usuarios del sistema</p>
        </div>
        <Button 
          onClick={() => openModal()}
          leftIcon={<Plus size={16} />}
        >
          Agregar Usuario
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
            placeholder="Buscar usuarios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user) => (
          <Card 
            key={user.id} 
            className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-4">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombreUsuario)}&background=random`}
                  alt={user.nombreUsuario}
                  className="h-12 w-12 rounded-full"
                />
                <div>
                  <CardTitle className="text-xl">{user.nombreUsuario}</CardTitle>
                  <Badge variant={getRoleBadgeVariant(user.rol?.nombre || 'staff')}>
                    {getRoleLabel(user.rol?.nombre || 'staff')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {/* Puedes mostrar más campos si los agregas al modelo */}
                {user.department && (
                  <div className="flex items-center text-gray-600">
                    <Building size={16} className="mr-2" />
                    <span>{user.department}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  leftIcon={<Edit size={16} />}
                  onClick={() => openModal(user)}
                >
                  Editar
                </Button>
                <Button 
                  variant="danger" 
                  className="flex-1"
                  leftIcon={<Trash size={16} />}
                  onClick={() => handleDelete(user.id)}
                >
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Modal for adding/editing user */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {currentUser ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Nombre de usuario"
                  name="nombreUsuario"
                  value={formData.nombreUsuario}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Contraseña"
                  name="claveHash"
                  type="password"
                  value={formData.claveHash}
                  onChange={handleInputChange}
                  required={!currentUser}
                  placeholder={currentUser ? 'Dejar en blanco para no cambiar' : ''}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol
                  </label>
                  <select
                    name="rol"
                    value={formData.rol}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    <option value="admin">Administrador</option>
                    <option value="manager">Gerente</option>
                    <option value="staff">Personal</option>
                  </select>
                </div>
                <Input
                  label="Departamento"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                />
                <Input
                  label="URL del Avatar"
                  name="avatar"
                  type="url"
                  value={formData.avatar}
                  onChange={handleInputChange}
                  placeholder="https://ejemplo.com/avatar.jpg"
                />
                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {currentUser ? 'Actualizar' : 'Agregar'} Usuario
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-10">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No se encontraron usuarios</h3>
          <p className="text-gray-500 mt-1">
            {search ? 'Intenta ajustar tus términos de búsqueda' : 'Agrega tu primer usuario para comenzar'}
          </p>
          {!search && (
            <Button 
              className="mt-4"
              onClick={() => openModal()}
              leftIcon={<Plus size={16} />}
            >
              Agregar Usuario
            </Button>
          )}
        </div>
      )}
    </div>
  );
};