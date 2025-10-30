package com.universidad.proyventasqr.service.impl;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.google.zxing.WriterException;
import com.universidad.proyventasqr.dto.ProductoDTO;
import com.universidad.proyventasqr.model.Categoria;
import com.universidad.proyventasqr.model.Producto;
import com.universidad.proyventasqr.repository.CategoriaRepository;
import com.universidad.proyventasqr.repository.ProductoRepository;
import com.universidad.proyventasqr.service.IProductoService;
import com.universidad.proyventasqr.util.QRGeneratorUtil;

import jakarta.transaction.Transactional;

@Service
public class ProductoServiceImpl implements IProductoService {
    @Autowired
    private ProductoRepository productoRepository;
    @Autowired
    private CategoriaRepository categoriaRepository;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private QRGeneratorUtil qrGeneratorUtil;

    @Override
    public List<ProductoDTO> obtenerTodosLosProductos() {
        return productoRepository.findAll().stream().map(producto -> modelMapper.map(producto, ProductoDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductoDTO crearProducto(ProductoDTO productoDTO) {
        if (productoDTO.getCategoria() == null || productoDTO.getCategoria().getId() == null) {
            throw new IllegalArgumentException("La categoría es obligatoria");
        }
        Categoria categoria = categoriaRepository.findById(productoDTO.getCategoria().getId())
                .orElseThrow(() -> new RuntimeException(
                        "La Categoría con ID: " + productoDTO.getCategoria().getId() + " no existe"));
        Producto producto = modelMapper.map(productoDTO, Producto.class);
        producto.setCategoria(categoria);
        producto.setCodigo(productoDTO.getCodigo());
        producto.setDescripcion(productoDTO.getDescripcion());
        producto.setStockMinimo(productoDTO.getStockMinimo());
        if (productoDTO.getCreadoEn() == null) {
            producto.setCreadoEn(java.time.LocalDateTime.now());
        } else {
            producto.setCreadoEn(productoDTO.getCreadoEn());
        }
        
        // Guardar primero para obtener ID
        Producto guardaProducto = productoRepository.save(producto);
        
        try {
            // Generar QR con ID del producto
            String baseUrl = "/api/productos/" + guardaProducto.getIdProd();
            
            // Generar QR como Base64
            String qrBase64 = qrGeneratorUtil.generateQRCodeAsBase64(baseUrl, 200, 200);
            
            // También guardar el QR como archivo
            String qrFilePath = qrGeneratorUtil.generateQRCodeAndSaveToFile(
                baseUrl, 
                200, 
                200, 
                "producto_" + guardaProducto.getIdProd()
            );
              // Actualizar el producto con el código QR (guardamos una ruta relativa)
            // Solo guardamos el nombre del archivo, no la ruta completa
            String relativePath = "producto_" + guardaProducto.getIdProd() + ".png";
            guardaProducto.setCodigoQr(relativePath);
            guardaProducto = productoRepository.save(guardaProducto);
            
            // Actualizar el DTO respuesta con ambos valores
            ProductoDTO resultado = modelMapper.map(guardaProducto, ProductoDTO.class);
            // Por ahora enviamos el QR como base64 para visualización inmediata
            resultado.setCodigoQr(qrBase64);
            return resultado;
        } catch (WriterException | IOException e) {
            // En caso de error, retornar el producto sin QR
            System.err.println("Error generando el código QR: " + e.getMessage());
            return modelMapper.map(guardaProducto, ProductoDTO.class);
        }
    }    @Override
    public ProductoDTO obtenerProductoPorId(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El Producto con ID: " + id + " no existe"));
        ProductoDTO productoDTO = modelMapper.map(producto, ProductoDTO.class);
        
        // Si el producto tiene un código QR guardado como ruta de archivo
        if (producto.getCodigoQr() != null && !producto.getCodigoQr().isEmpty()) {
            // Simplemente devolvemos el nombre del archivo, que el frontend
            // construirá la URL completa con la ruta base
            productoDTO.setCodigoQr(producto.getCodigoQr());
        }
        
        return productoDTO;
    }

    @Override
    @Transactional
    public List<ProductoDTO> obtenerProductosPorCategoria(Long catId) {
        return productoRepository.findByCategoriaId(catId).stream()
                .map(producto -> modelMapper.map(producto, ProductoDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductoDTO actualizarProducto(Long id, ProductoDTO productoDTO) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El Producto con ID: " + id + " no existe"));

        if (!producto.getCategoria().getId().equals(productoDTO.getCategoria().getId())) {
            Categoria nuevaCategoria = categoriaRepository.findById(productoDTO.getCategoria().getId())
                    .orElseThrow(() -> new RuntimeException(
                            "la Categoría con id: " + productoDTO.getCategoria().getId() + " no existe"));
            producto.setCategoria(nuevaCategoria);
        }

        producto.setNombre(productoDTO.getNombre());
        producto.setPrecio(productoDTO.getPrecio());
        producto.setStock(productoDTO.getStock());
        producto.setEstado(productoDTO.getEstado());
        producto.setCodigoQr(productoDTO.getCodigoQr());
        producto.setCodigo(productoDTO.getCodigo());
        producto.setDescripcion(productoDTO.getDescripcion());
        producto.setStockMinimo(productoDTO.getStockMinimo());
        // No se actualiza creadoEn para mantener la fecha original

        Producto updatedProducto = productoRepository.save(producto);
        return modelMapper.map(updatedProducto, ProductoDTO.class);
    }

    @Override
    @Transactional
    public void eliminarProducto(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El producto con ID: " + id + " no existe"));
        producto.setEstado("inactivo");
        productoRepository.save(producto);
    }

    @Override
    public ProductoDTO obtenerProductoPorCodigo(String codigo) {
        Producto producto = productoRepository.findByCodigo(codigo)
                .orElseThrow(() -> new RuntimeException("El producto con código: " + codigo + " no existe"));
        return modelMapper.map(producto, ProductoDTO.class);
    }

}
