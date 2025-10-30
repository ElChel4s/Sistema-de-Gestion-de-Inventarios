package com.universidad.proyventasqr.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.universidad.proyventasqr.dto.InventarioDTO;
import com.universidad.proyventasqr.service.IInventarioService;

@RestController
@RequestMapping("/api/inventarios")
public class InventarioController {
    private final IInventarioService inventarioService;

    @Autowired
    public InventarioController(IInventarioService inventarioService) {
        this.inventarioService = inventarioService;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
    public ResponseEntity<InventarioDTO> actualizar(@PathVariable Integer id,
            @RequestBody InventarioDTO inventarioDTO) {
        InventarioDTO actualizado = inventarioService.actualizarInventario(id, inventarioDTO);
        return ResponseEntity.ok(actualizado);
    }

    @GetMapping("/almacen/{almacenId}")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE','PERSONAL')")
    public ResponseEntity<List<InventarioDTO>> obtenerPorAlmacen(@PathVariable Long almacenId) {
        return ResponseEntity.ok(inventarioService.obtenerInventariosPorAlmacen(almacenId));
    }

    @GetMapping("/producto/{productoId}")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE','PERSONAL')")
    public ResponseEntity<List<InventarioDTO>> obtenerPorProducto(@PathVariable Integer productoId) {
        return ResponseEntity.ok(inventarioService.obtenerInventariosPorProducto(productoId));
    }

    /**
     * Obtener un inventario por su ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE','PERSONAL')")
    public ResponseEntity<InventarioDTO> obtenerPorId(@PathVariable Integer id) {
        List<InventarioDTO> todos = inventarioService.obtenerTodosLosInventarios();
        return todos.stream()
                .filter(inv -> inv.getId().equals(id))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Listar inventarios ordenados por cantidad ascendente
     */
    @GetMapping("/ordenar/cantidad")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE','PERSONAL')")
    public ResponseEntity<List<InventarioDTO>> listarOrdenadosPorCantidad(@RequestParam(defaultValue = "asc") String orden) {
        List<InventarioDTO> inventarios = inventarioService.obtenerTodosLosInventarios();
        inventarios.sort((a, b) -> {
            if (orden.equalsIgnoreCase("desc")) {
                return b.getCantidad().compareTo(a.getCantidad());
            } else {
                return a.getCantidad().compareTo(b.getCantidad());
            }
        });
        return ResponseEntity.ok(inventarios);
    }

    /**
     * Listar inventarios ordenados por nombre de producto ascendente o descendente
     */
    @GetMapping("/ordenar/nombre")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE','PERSONAL')")
    public ResponseEntity<List<InventarioDTO>> listarOrdenadosPorNombre(@RequestParam(defaultValue = "asc") String orden) {
        List<InventarioDTO> inventarios = inventarioService.obtenerTodosLosInventarios();
        inventarios.sort((a, b) -> {
            String nombreA = a.getProducto() != null && a.getProducto().getNombre() != null ? a.getProducto().getNombre() : "";
            String nombreB = b.getProducto() != null && b.getProducto().getNombre() != null ? b.getProducto().getNombre() : "";
            if (orden.equalsIgnoreCase("desc")) {
                return nombreB.compareToIgnoreCase(nombreA);
            } else {
                return nombreA.compareToIgnoreCase(nombreB);
            }
        });
        return ResponseEntity.ok(inventarios);
    }
}
