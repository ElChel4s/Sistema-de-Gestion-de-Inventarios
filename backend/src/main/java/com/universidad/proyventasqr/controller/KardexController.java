package com.universidad.proyventasqr.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.universidad.proyventasqr.dto.KardexDTO;
import com.universidad.proyventasqr.service.IKardexService;

@RestController
@RequestMapping("/api/kardex")
public class KardexController {

    @Autowired
    private IKardexService kardexService;

    /**
     * Obtiene el Kardex completo de un producto por su ID
     * 
     * @param productoId ID del producto
     * @return Lista de movimientos del Kardex
     */
    @GetMapping("/producto/{productoId}")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE','PERSONAL')")
    public ResponseEntity<List<KardexDTO>> obtenerKardexPorProducto(@PathVariable Long productoId) {
        List<KardexDTO> kardex = kardexService.obtenerKardexPorProducto(productoId);
        return ResponseEntity.ok(kardex);
    }

    /**
     * Obtiene el Kardex de un producto filtrado por fechas
     * 
     * @param productoId  ID del producto
     * @param fechaInicio Fecha de inicio (formato: yyyy-MM-dd)
     * @param fechaFin    Fecha de fin (formato: yyyy-MM-dd)
     * @return Lista de movimientos del Kardex filtrados
     */
    @GetMapping("/producto/{productoId}/filtro-fechas")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE','PERSONAL')")
    public ResponseEntity<List<KardexDTO>> obtenerKardexPorProductoYFechas(
            @PathVariable Long productoId,
            @RequestParam String fechaInicio,
            @RequestParam String fechaFin) {
        List<KardexDTO> kardex = kardexService.obtenerKardexPorProductoYFechas(productoId, fechaInicio, fechaFin);
        return ResponseEntity.ok(kardex);
    }
}