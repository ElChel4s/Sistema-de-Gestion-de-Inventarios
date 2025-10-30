package com.universidad.proyventasqr.service;

import com.universidad.proyventasqr.dto.InventarioDTO;
import java.util.List;

public interface IInventarioService {
    List<InventarioDTO> obtenerTodosLosInventarios();

    InventarioDTO crearInventario(InventarioDTO inventarioDTO);

    InventarioDTO actualizarInventario(Integer id, InventarioDTO inventarioDTO);

    void eliminarInventario(Integer id);

    void eliminarLogico(Integer id);

    List<InventarioDTO> obtenerInventariosPorAlmacen(Long almacenId);

    List<InventarioDTO> obtenerInventariosPorProducto(Integer productoId);
}
