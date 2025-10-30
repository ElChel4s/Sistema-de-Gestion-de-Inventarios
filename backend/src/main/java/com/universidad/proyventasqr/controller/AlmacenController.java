package com.universidad.proyventasqr.controller;

import com.universidad.proyventasqr.dto.AlmacenDTO;
import com.universidad.proyventasqr.dto.InventarioDTO;
import com.universidad.proyventasqr.dto.MotivoBajaRequest;
import com.universidad.proyventasqr.service.IAlmacenService;
import com.universidad.proyventasqr.service.IInventarioService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;



@RestController
@RequestMapping("/api/almacenes")
public class AlmacenController {

    private final IAlmacenService almacenService;
    private final IInventarioService inventarioService;

    @Autowired
    public AlmacenController(IAlmacenService almacenService, IInventarioService inventarioService) {
        this.almacenService = almacenService;
        this.inventarioService = inventarioService;
    }

    /**
     * Obtener todos los almacenes.
     * 
     * @return ResponseEntity con lista de almacenes.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE','PERSONAL')")
    public ResponseEntity<List<AlmacenDTO>> obtenerTodosLosAlmacenes() {
        List<AlmacenDTO> almacenes = almacenService.obtenerTodosLosAlmacenes();
        return ResponseEntity.ok(almacenes);
    }

    /**
     * Crear un nuevo almacén.
     * 
     * @param almacenDTO El DTO del almacén a crear.
     * @return ResponseEntity con el almacén creado.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
    public ResponseEntity<AlmacenDTO> crearAlmacen(@RequestBody AlmacenDTO almacenDTO) {
        AlmacenDTO nuevoAlmacen = almacenService.crearAlmacen(almacenDTO);
        return ResponseEntity.status(201).body(nuevoAlmacen);
    }

    /**
     * Actualizar un almacén existente.
     * 
     * @param id         El ID del almacén a actualizar.
     * @param almacenDTO Los nuevos datos del almacén.
     * @return ResponseEntity con el almacén actualizado.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
    public ResponseEntity<AlmacenDTO> actualizarAlmacen(@PathVariable Long id, @RequestBody AlmacenDTO almacenDTO) {
        AlmacenDTO almacenActualizado = almacenService.actualizarAlmacen(id, almacenDTO);
        return ResponseEntity.ok(almacenActualizado);
    }

    /**
     * Eliminar un almacén.
     * 
     * @param id El ID del almacén a eliminar.
     * @return ResponseEntity vacío con código 204 si es exitoso.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
    public ResponseEntity<Void> eliminarAlmacen(@PathVariable Long id) {
        almacenService.eliminarAlmacen(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Obtener almacenes filtrados por su estado (activo/inactivo).
     * 
     * @param estado El estado del almacén (activo/inactivo).
     * @return ResponseEntity con lista de almacenes filtrados.
     */
    @GetMapping("/estado")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE','PERSONAL')")
    public ResponseEntity<List<AlmacenDTO>> obtenerAlmacenesPorEstado(@RequestParam String estado) {
        List<AlmacenDTO> almacenes = almacenService.obtenerAlmacenesPorEstado(estado);
        return ResponseEntity.ok(almacenes);
    }

    /**
     * Listar almacenes ordenados por nombre ascendente o descendente
     */
    @GetMapping("/orden")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE','PERSONAL')")
    public ResponseEntity<List<AlmacenDTO>> listarOrdenados(@RequestParam(defaultValue = "asc") String orden) {
        List<AlmacenDTO> almacenes = almacenService.obtenerTodosLosAlmacenes();
        almacenes.sort((a, b) -> orden.equalsIgnoreCase("desc") ? b.getNombre().compareToIgnoreCase(a.getNombre())
                : a.getNombre().compareToIgnoreCase(b.getNombre()));
        return ResponseEntity.ok(almacenes);
    }

    /**
     * Listar almacenes por nombre (contiene, no exacto)
     */
    @GetMapping("/buscar")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE','PERSONAL')")
    public ResponseEntity<List<AlmacenDTO>> buscarPorNombre(@RequestParam String nombre) {
        List<AlmacenDTO> almacenes = almacenService.obtenerTodosLosAlmacenes();
        List<AlmacenDTO> filtrados = almacenes.stream()
                .filter(a -> a.getNombre().toLowerCase().contains(nombre.toLowerCase()))
                .toList();
        return ResponseEntity.ok(filtrados);
    }

    /**
     * Eliminar lógico de almacén (cambia estado a 'eliminado')
     */
    @DeleteMapping("/logico/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
    public ResponseEntity<Void> eliminarLogico(@PathVariable Long id) {
        almacenService.eliminarLogico(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Desactivar (eliminación lógica) un almacén con motivo de baja
     */
    @PutMapping("/baja/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
    public ResponseEntity<Void> bajaAlmacen(@PathVariable Long id, @RequestBody MotivoBajaRequest motivo) {
        almacenService.bajaAlmacen(id, motivo.getMotivoBaja());
        return ResponseEntity.noContent().build();
    }

    /**
     * Obtener un almacén por su ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE','PERSONAL')")
    public ResponseEntity<AlmacenDTO> obtenerPorId(@PathVariable Long id) {
        List<AlmacenDTO> almacenes = almacenService.obtenerTodosLosAlmacenes();
        return almacenes.stream()
                .filter(a -> a.getIdAlm().equals(id))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Listar almacenes ordenados por capacidad ascendente o descendente
     */
    @GetMapping("/ordenar/capacidad")
    public ResponseEntity<List<AlmacenDTO>> listarOrdenadosPorCapacidad(
            @RequestParam(defaultValue = "asc") String orden) {
        List<AlmacenDTO> almacenes = almacenService.obtenerTodosLosAlmacenes();
        almacenes.sort((a, b) -> {
            if (orden.equalsIgnoreCase("desc")) {
                return b.getCapacidad().compareTo(a.getCapacidad());
            } else {
                return a.getCapacidad().compareTo(b.getCapacidad());
            }
        });
        return ResponseEntity.ok(almacenes);
    }

    /**
     * Listar almacenes ordenados por nombre ascendente o descendente
     */
    @GetMapping("/ordenar/nombre")
    public ResponseEntity<List<AlmacenDTO>> listarOrdenadosPorNombre(@RequestParam(defaultValue = "asc") String orden) {
        List<AlmacenDTO> almacenes = almacenService.obtenerTodosLosAlmacenes();
        almacenes.sort((a, b) -> {
            String nombreA = a.getNombre() != null ? a.getNombre() : "";
            String nombreB = b.getNombre() != null ? b.getNombre() : "";
            if (orden.equalsIgnoreCase("desc")) {
                return nombreB.compareToIgnoreCase(nombreA);
            } else {
                return nombreA.compareToIgnoreCase(nombreB);
            }
        });
        return ResponseEntity.ok(almacenes);
    }

    /**
     * Eliminar un almacén y todos sus inventarios asociados por su ID (borrado
     * físico en cascada)
     */
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminarAlmacenYCascada(@PathVariable Long id) {
        // Eliminar todos los inventarios asociados primero
        List<InventarioDTO> inventarios = inventarioService.obtenerInventariosPorAlmacen(id);
        for (InventarioDTO inv : inventarios) {
            inventarioService.eliminarInventario(inv.getId());
        }
        // Ahora sí eliminar el almacén
        almacenService.eliminarAlmacen(id);
        return ResponseEntity.noContent().build();
    }

}

