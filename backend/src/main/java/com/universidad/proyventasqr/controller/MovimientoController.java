package com.universidad.proyventasqr.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.universidad.proyventasqr.dto.MovimientoDTO;
import com.universidad.proyventasqr.service.IMovimientoService;

@RestController
@RequestMapping("/api/movimientos")
public class MovimientoController {
    @Autowired
    private IMovimientoService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE','PERSONAL')")
    public ResponseEntity<List<MovimientoDTO>> obtenerTodosLosMovimientos() {
        List<MovimientoDTO> movimientos = service.obtenerTodosLosMovimientos();
        return ResponseEntity.ok(movimientos);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE','PERSONAL')")
    public ResponseEntity<MovimientoDTO> crearMovimiento(@RequestBody MovimientoDTO movimientoDTO) {
        // Obtener el usuario autenticado
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getName();
        MovimientoDTO guardarMov = service.crearMovimientoConUsuario(movimientoDTO, username);
        return new ResponseEntity<>(guardarMov, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE','PERSONAL')")
    public ResponseEntity<MovimientoDTO> obtenerMovimientoPorId(@PathVariable Long id) {
        MovimientoDTO movimientoDTO = service.obtenerMovimientoPorId(id);
        return ResponseEntity.ok(movimientoDTO);
    }

    // @GetMapping("/almacen/{almId}")
    // @PreAuthorize("hasAnyRole('ADMIN','GERENTE','PERSONAL')")
    // public ResponseEntity<List<MovimientoDTO>>
    // obtenerMovimientosPorAlmacen(@PathVariable Long almId){
    // List<MovimientoDTO> movimientos =
    // service.obtenerMovimientosPorAlmacen(almId);
    // return ResponseEntity.ok(movimientos);
    // }
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
    public ResponseEntity<MovimientoDTO> actualizarMovimiento(@PathVariable Long id,
            @RequestBody MovimientoDTO movimientoDTO) {
        MovimientoDTO updateMov = service.actualizarMovimiento(id, movimientoDTO);
        return ResponseEntity.ok(updateMov);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
    public ResponseEntity<Void> eliminarMovimiento(@PathVariable Long id) {
        service.eliminarMovimiento(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/ticket-pdf")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE','PERSONAL')")
    public ResponseEntity<byte[]> obtenerTicketMovimientoPDF(@PathVariable Long id) {
        byte[] pdfBytes = service.generarTicketMovimientoPDF(id);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=ticket_movimiento_" + id + ".pdf")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/ids")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE','PERSONAL')")
    public ResponseEntity<List<Long>> obtenerIdsMovimientos() {
        List<MovimientoDTO> movimientos = service.obtenerTodosLosMovimientos();
        List<Long> ids = movimientos.stream()
                .map(MovimientoDTO::getId)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ids);
    }
}
