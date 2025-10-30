import React, { useState, useRef, useEffect } from 'react';
import { useAtom } from 'jotai';
import { 
  Plus, 
  Package,
  Tag,
  BarChart2,
  Edit,
  Trash,
  Search
} from 'lucide-react';
import { 
  productsAtom,
  Product,
  fetchProducts,
  updateProduct,
  deleteProduct,
  adaptProductToBackend
} from '../store/product';
import { categoriesAtom } from '../store/category';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { formatCurrency } from '../lib/utils';
import { BrowserQRCodeReader } from '@zxing/browser';
import { productsAPI } from '../lib/api';
import { ProductKardex } from '../components/ProductKardex';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useAtom(productsAtom);
  const [categories] = useAtom(categoriesAtom);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    categoryId: '',
    price: 0,
    cost: 0,
    quantity: 0,
  });
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [qrError, setQRError] = useState<string | null>(null);
  const [showDetailsProduct, setShowDetailsProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState<{id: string, qr: string} | null>(null);
  const [showKardex, setShowKardex] = useState<{id: number, name: string} | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);

  // Obtener productos desde el backend al cargar el componente
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        await fetchProducts(setProducts);
      } catch (err) {
        console.error('Error al cargar los productos:', err);
        setError('Error al cargar los productos. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [setProducts]);

  const filteredProducts = products.filter(
    product => 
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (product: Product | null = null) => {
    if (product) {
      setCurrentProduct(product);
      setFormData({
        name: product.name,
        sku: product.sku,
        description: product.description,
        categoryId: product.categoryId,
        price: product.price,
        cost: product.cost,
        quantity: product.quantity,
      });
    } else {
      setCurrentProduct(null);
      setFormData({
        name: '',
        sku: '',
        description: '',
        categoryId: '',
        price: 0,
        cost: 0,
        quantity: 0,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['price', 'cost', 'quantity'].includes(name) ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validar que se haya seleccionado una categoría
      if (!formData.categoryId) {
        setError("La categoría es obligatoria");
        return;
      }
      
      setLoading(true);
      
      if (currentProduct) {
        await updateProduct(currentProduct.id, {...formData}, setProducts, products);
      } else {
        const productData = {
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        // Adaptamos el producto al formato que espera el backend
        const backendProduct = adaptProductToBackend(productData);
        // Aseguramos que el objeto categoría esté correcto
        if (formData.categoryId) {
          backendProduct.categoria = {
            id: parseInt(formData.categoryId)
          };
        }
        const created = await productsAPI.create(backendProduct);
        await fetchProducts(setProducts);
        // Mostrar QR del producto creado
        if (created && created.idProd) {
          setShowQRModal({id: created.idProd.toString(), qr: created.codigoQr});
        }
      }
      closeModal();
    } catch (err) {
      console.error('Error al guardar el producto:', err);
      setError('Error al guardar el producto. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        setLoading(true);
        await deleteProduct(id, setProducts, products);
      } catch (err) {
        console.error('Error al eliminar el producto:', err);
        setError('Error al eliminar el producto. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Interfaz para el inventario
  interface InventarioItem {
    id: number;
    producto: {
      idProd: string | number;
      nombre: string;
    };
    almacen: {
      id: string | number;
      nombre: string;
      ubicacion: string;
    };
    cantidad: string | number;
    actualizadoEn: string;
  }

  // Estado para almacenar el inventario del producto escaneado
  const [scannedProductInventory, setScannedProductInventory] = useState<InventarioItem[]>([]);

  // useEffect para iniciar el escaneo cuando el modal QR se abre
  useEffect(() => {
    if (isQRScannerOpen && videoRef.current) {
      setQRError(null);
      setScannedProduct(null);
      setScannedProductInventory([]);
      
      const codeReader = new BrowserQRCodeReader();
      codeReaderRef.current = codeReader;
      
      // Guardar una referencia al elemento de video actual
      const videoElement = videoRef.current;
      
      codeReader.decodeOnceFromVideoDevice(undefined, videoElement)
        .then(async result => {
          if (result) {
            const qrCode = result.getText();
            try {
              // Usar el nuevo endpoint para obtener producto + stock por almacén
              const response = await productsAPI.getProductWithStockByQR(qrCode);
              if (response && response.producto) {
                setScannedProduct({
                  id: response.producto.idProd?.toString() || '',
                  name: response.producto.nombre,
                  sku: response.producto.codigo || '',
                  description: response.producto.descripcion || '',
                  categoryId: response.producto.categoria?.id?.toString() || '',
                  price: Number(response.producto.precio || 0),
                  cost: 0, // No hay equivalente en backend
                  quantity: response.producto.stock || 0,
                  // Propiedad de imagen eliminada
                  qrCode: response.producto.codigoQr,
                  createdAt: response.producto.creadoEn ? new Date(response.producto.creadoEn) : new Date(),
                  updatedAt: new Date(),
                });
                setScannedProductInventory(
                  Array.isArray(response.stockPorAlmacen) ? response.stockPorAlmacen.map((item: InventarioItem) => ({
                    id: item.id,
                    producto: {
                      idProd: item.producto?.idProd,
                      nombre: item.producto?.nombre,
                    },
                    almacen: {
                      id: item.almacen?.id,
                      nombre: item.almacen?.nombre,
                      ubicacion: item.almacen?.ubicacion,
                    },
                    cantidad: item.cantidad,
                    actualizadoEn: item.actualizadoEn,
                  })) : []
                );
              } else {
                setQRError('Producto no encontrado en el sistema.');
              }
            } catch (err) {
              console.error('Error al obtener producto:', err);
              setQRError('Producto no encontrado en el sistema.');
            }
          }
          setIsQRScannerOpen(false);
        })
        .catch((err) => {
          console.error('Error al escanear:', err);
          setQRError('Error al escanear el QR o acceso denegado.');
          setIsQRScannerOpen(false);
        });
      
      // Limpiar la cámara al cerrar el modal
      return () => {
        // Detener manualmente el stream de video si existe
        if (videoElement && videoElement.srcObject) {
          const tracks = (videoElement.srcObject as MediaStream).getTracks();
          tracks.forEach(track => track.stop());
          videoElement.srcObject = null;
        }
      };
    }
  }, [isQRScannerOpen]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500">Gestiona tu inventario de productos</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => openModal()}
            leftIcon={<Plus size={16} />}
            disabled={loading}
          >
            Agregar Producto
          </Button>
          <Button 
            onClick={() => setIsQRScannerOpen(true)}
            leftIcon={<BarChart2 size={16} />}
            variant="outline"
            disabled={loading}
          >
            Escanear QR
          </Button>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </span>
        </div>
      )}

      {/* Search and filters */}
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

      {/* Estado de carga */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Cargando productos...</span>
        </div>
      ) : (
        /* Products grid */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {/* Imagen eliminada, solo contenido textual */}
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{product.name}</CardTitle>
                    <Badge variant="secondary">{product.sku}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-gray-500 text-sm line-clamp-2">
                    {product.description || 'Sin descripción'}
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-gray-400" />
                      <span>{product.quantity} unid.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-gray-400" />
                      <span>
                        {categories.find(c => String(c.id) === String(product.categoryId))?.nombre || 'Sin categoría'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xl font-bold text-primary">
                      {formatCurrency(product.price)}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setShowDetailsProduct(product)}
                      >
                        Ver QR
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowKardex({id: Number(product.id), name: product.name})}
                      >
                        Ver Kardex
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => openModal(product)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No se encontraron productos.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal para agregar/editar producto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">{currentProduct ? 'Editar Producto' : 'Agregar Producto'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <Input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  placeholder="Nombre del producto"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <Input 
                  type="text" 
                  name="sku" 
                  value={formData.sku} 
                  onChange={handleInputChange} 
                  placeholder="Código SKU"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descripción del producto"
                  className="w-full p-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                  <Input 
                    type="number" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleInputChange} 
                    placeholder="Precio"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo</label>
                  <Input 
                    type="number" 
                    name="cost" 
                    value={formData.cost} 
                    onChange={handleInputChange} 
                    placeholder="Costo"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                  <Input 
                    type="number" 
                    name="quantity" 
                    value={formData.quantity} 
                    onChange={handleInputChange} 
                    placeholder="Cantidad en stock"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  onClick={closeModal} 
                  variant="outline"
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar Producto'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para escanear QR */}
      {isQRScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">Escanear QR del Producto</h2>
            <div className="flex justify-center mb-4">
              <video ref={videoRef} className="w-full h-auto rounded-lg" />
            </div>
            {qrError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {qrError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                onClick={() => setIsQRScannerOpen(false)} 
                variant="outline"
                disabled={loading}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para mostrar detalles del producto escaneado */}
      {scannedProduct && !isQRScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Información del Producto Escaneado</h2>
            
            {/* Información general del producto */}
            <div className="mb-6">
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded-lg border shadow-sm">
                  <Package size={32} className="text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold">{scannedProduct.name}</h3>
                    <Badge variant="secondary" className="text-sm">{scannedProduct.sku}</Badge>
                  </div>
                  
                  <div className="mt-2">
                    <Badge variant="secondary" className="mr-2 bg-blue-50">
                      {categories.find(c => c.id === scannedProduct.categoryId)?.nombre || 'Sin categoría'}
                    </Badge>
                    <Badge variant="outline" className="bg-green-50">
                      {scannedProduct.quantity} en stock
                    </Badge>
                  </div>

                  <div className="mt-2 text-xl font-bold text-primary">
                    {formatCurrency(scannedProduct.price)}
                  </div>

                  {scannedProduct.cost && (
                    <div className="mt-1 text-sm text-gray-500">
                      Costo: {formatCurrency(scannedProduct.cost)}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Detalles del producto en forma de tabla */}
              <div className="mt-4 bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-medium mb-3">Detalles del Producto</h4>
                
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <div className="text-gray-500">ID Producto:</div>
                  <div className="font-medium">{scannedProduct.id}</div>
                  
                  <div className="text-gray-500">Código de Producto:</div>
                  <div className="font-medium">{scannedProduct.sku}</div>
                  
                  <div className="text-gray-500">SKU:</div>
                  <div className="font-medium">{scannedProduct.sku}</div>
                  
                  <div className="text-gray-500">Categoría:</div>
                  <div className="font-medium">
                    {categories.find(c => c.id === scannedProduct.categoryId)?.nombre || 'Sin categoría'}
                  </div>
                  
                  <div className="text-gray-500">Stock Global:</div>
                  <div className="font-medium">{scannedProduct.quantity} unidades</div>
                  
                  {scannedProduct.createdAt && (
                    <>
                      <div className="text-gray-500">Creado:</div>
                      <div className="font-medium">
                        {new Date(scannedProduct.createdAt).toLocaleString()}
                      </div>
                    </>
                  )}
                  
                  {scannedProduct.updatedAt && (
                    <>
                      <div className="text-gray-500">Actualizado:</div>
                      <div className="font-medium">
                        {new Date(scannedProduct.updatedAt).toLocaleString()}
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Descripción del producto */}
              <div className="mt-4">
                <h4 className="font-medium mb-2">Descripción:</h4>
                <div className="text-sm text-gray-600 bg-white p-3 rounded border">
                  {scannedProduct.description ? (
                    <p>{scannedProduct.description}</p>
                  ) : (
                    <p className="text-gray-400">Sin descripción disponible</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Inventario por almacén */}
            <div>
              <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                <h4 className="font-semibold">Inventario por Almacén</h4>
                <Badge variant="outline" className="text-xs">{scannedProductInventory.length} ubicaciones</Badge>
              </div>
              
              {scannedProductInventory && scannedProductInventory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Almacén</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actualizado</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {scannedProductInventory.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap text-sm">{item.almacen.nombre}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">{item.almacen.ubicacion || 'N/A'}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                            <span className="px-2 py-1 rounded bg-blue-50 text-blue-700">
                              {item.cantidad} unid.
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {item.actualizadoEn ? new Date(item.actualizadoEn).toLocaleString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                      
                      {/* Total row */}
                      <tr className="bg-gray-50">
                        <td colSpan={2} className="px-3 py-2 text-sm font-medium">Total</td>
                        <td className="px-3 py-2 text-sm font-bold">
                          <span className="px-2 py-1 rounded bg-green-50 text-green-700">
                            {scannedProductInventory.reduce((sum, item) => 
                              sum + (typeof item.cantidad === 'number' ? item.cantidad : Number(item.cantidad) || 0), 0
                            )} unid.
                          </span>
                        </td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center border rounded-md bg-gray-50">
                  <Package className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No hay datos de inventario disponibles para este producto.</p>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="mt-6 flex justify-between">
              <div>
                <Button 
                  onClick={() => openModal(scannedProduct)}
                  variant="secondary"
                  size="sm"
                >
                  <Edit className="h-4 w-4 mr-2" /> Editar Producto
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    setIsQRScannerOpen(true);
                    setScannedProduct(null);
                    setScannedProductInventory([]);
                  }} 
                  variant="outline"
                  size="sm"
                >
                  Escanear Otro
                </Button>
                
                <Button 
                  onClick={() => {
                    setScannedProduct(null);
                    setScannedProductInventory([]);
                  }} 
                  variant="primary"
                  size="sm"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para mostrar detalles del producto (QR) */}
      {showDetailsProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">Detalles del Producto</h2>
            <div className="mb-4">
              {showDetailsProduct.qrCode ? (
                showDetailsProduct.qrCode.startsWith('http') ? (
                  // URL directa a la imagen
                  <img
                    src={showDetailsProduct.qrCode}
                    alt="Código QR del producto"
                    className="mx-auto"
                    style={{ width: 256, height: 256 }}
                  />
                ) : (
                  // Formato Base64
                  <img
                    src={`data:image/png;base64,${showDetailsProduct.qrCode}`}
                    alt="Código QR del producto"
                    className="mx-auto"
                    style={{ width: 256, height: 256 }}
                  />
                )
              ) : (
                <div className="text-center text-gray-500">No hay QR disponible</div>
              )}
              {/* Mostrar también la URL o ID codificado en el QR */}
              <p className="text-center mt-2 text-sm text-gray-500">
                ID Producto: {showDetailsProduct.id}
              </p>
            </div>
            <div className="text-center">
              <Button 
                onClick={() => setShowDetailsProduct(null)} 
                variant="outline"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para mostrar QR del producto creado */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">Producto creado correctamente</h2>
            <div className="mb-4 text-center">
              <img src={showQRModal.qr.startsWith('http') ? showQRModal.qr : `data:image/png;base64,${showQRModal.qr}`} alt="QR Producto" className="mx-auto" style={{ width: 256, height: 256 }} />
              <p className="mt-2 text-sm text-gray-500">ID Producto: {showQRModal.id}</p>
            </div>
            <div className="text-center">
              <Button onClick={() => setShowQRModal(null)} variant="outline">Cerrar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para mostrar el Kardex del producto */}
      {showKardex && (
        <ProductKardex
          productId={showKardex.id}
          productName={showKardex.name}
          open={!!showKardex}
          onClose={() => setShowKardex(null)}
        />
      )}
    </div>
  );
};
