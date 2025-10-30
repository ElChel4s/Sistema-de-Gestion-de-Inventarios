package com.universidad.proyventasqr.service;

import java.util.List;

import com.universidad.proyventasqr.dto.ProductoDTO;

public interface IProductoService {
    ProductoDTO crearProducto(ProductoDTO productoDTO);
    ProductoDTO obtenerProductoPorId(Long id);
    List<ProductoDTO> obtenerTodosLosProductos();
    List<ProductoDTO> obtenerProductosPorCategoria(Long catId);
    ProductoDTO actualizarProducto(Long id, ProductoDTO productoDTO);
    void eliminarProducto(Long id);
    ProductoDTO obtenerProductoPorCodigo(String codigo);


}
