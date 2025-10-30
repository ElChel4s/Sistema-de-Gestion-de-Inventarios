package com.universidad.proyventasqr.service;

import java.util.List;

import com.universidad.proyventasqr.dto.KardexDTO;

public interface IKardexService {

    /**
     * Obtiene el Kardex completo de un producto
     * 
     * @param productoId ID del producto
     * @return Lista de movimientos del Kardex
     */
    List<KardexDTO> obtenerKardexPorProducto(Long productoId);

    /**
     * Obtiene el Kardex de un producto con filtros de fecha
     * 
     * @param productoId  ID del producto
     * @param fechaInicio Fecha de inicio del filtro
     * @param fechaFin    Fecha de fin del filtro
     * @return Lista de movimientos del Kardex filtrados
     */
    List<KardexDTO> obtenerKardexPorProductoYFechas(Long productoId, String fechaInicio, String fechaFin);
    
}