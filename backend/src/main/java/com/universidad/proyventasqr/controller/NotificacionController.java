package com.universidad.proyventasqr.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.universidad.proyventasqr.dto.NotificacionDTO;
import com.universidad.proyventasqr.service.INotificacionService;

/**
 * Controlador para alertas temporales
 * Solo alertas de stock bajo y movimientos
 * NO se guardan en base de datos
 */
@RestController
@RequestMapping("/api/alertas")
public class NotificacionController {

    @Autowired
    private INotificacionService notificacionService;

    // ========== ALERTAS DE STOCK BAJO ==========

    /**
     * Alerta básica de stock bajo
     */
    @PostMapping("/stock-bajo")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> enviarAlertaStockBajo() {
        notificacionService.notificarStockBajo("Producto de Prueba", 2, 5);
        return ResponseEntity.ok().build();
    }

    /**
     * Alerta de stock bajo con datos personalizados
     */
    @PostMapping("/stock-bajo-personalizado")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> enviarAlertaStockBajoPersonalizado(
            @RequestParam String nombreProducto,
            @RequestParam int stockActual,
            @RequestParam int stockMinimo) {
        notificacionService.notificarStockBajo(nombreProducto, stockActual, stockMinimo);
        return ResponseEntity.ok().build();
    }

    // ========== ALERTAS DE MOVIMIENTOS ==========

    /**
     * Alerta básica de movimiento
     */
    @PostMapping("/movimiento")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> enviarAlertaMovimiento() {
        notificacionService.notificarMovimientoCreado("ENTRADA", "admin", 999L);
        return ResponseEntity.ok().build();
    }

    /**
     * Alerta de movimiento con datos personalizados
     */
    @PostMapping("/movimiento-personalizado")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> enviarAlertaMovimientoPersonalizado(
            @RequestParam String tipoMovimiento,
            @RequestParam String usuario,
            @RequestParam Long movimientoId) {
        notificacionService.notificarMovimientoCreado(tipoMovimiento, usuario, movimientoId);
        return ResponseEntity.ok().build();
    }

    // ========== ENDPOINT WEBSOCKET ==========

    /**
     * Endpoint WebSocket para procesar alertas
     */
    @MessageMapping("/alerta")
    @SendTo("/topic/alertas")
    public NotificacionDTO procesarAlerta(NotificacionDTO alerta) {
        // Generar ID único si no tiene
        if (alerta.getId() == null) {
            alerta.setId(java.util.UUID.randomUUID().toString());
        }
        return alerta;
    }
}