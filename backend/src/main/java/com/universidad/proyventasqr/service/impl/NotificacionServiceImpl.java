package com.universidad.proyventasqr.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.universidad.proyventasqr.dto.NotificacionDTO;
import com.universidad.proyventasqr.service.INotificacionService;

/**
 * Implementación del servicio de alertas temporales
 * Las alertas aparecen automáticamente y desaparecen después de un tiempo
 * NO se guardan en base de datos
 */
@Service
public class NotificacionServiceImpl implements INotificacionService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate; // Para WebSocket

    @Override
    public void enviarNotificacionGlobal(NotificacionDTO notificacion) {
        // Generar ID único para la alerta
        notificacion.setId(java.util.UUID.randomUUID().toString());

        // Enviar la alerta a TODOS los usuarios conectados
        messagingTemplate.convertAndSend("/topic/alertas", notificacion);

        // Log para debugging
        System.out.println("DEBUG: Alerta temporal enviada: " + notificacion.getTitulo());
    }

    @Override
    public void notificarStockBajo(String nombreProducto, int stockActual, int stockMinimo) {
        // Crear alerta de stock bajo
        NotificacionDTO notificacion = new NotificacionDTO(
                "🚨 Stock Bajo", // Título con emoji
                "El producto '" + nombreProducto + "' tiene stock bajo. Actual: " + stockActual + ", Mínimo: "
                        + stockMinimo, // Mensaje detallado
                NotificacionDTO.TipoNotificacion.STOCK // Tipo STOCK
        );

        // Enviar alerta global
        enviarNotificacionGlobal(notificacion);
    }

    @Override
    public void notificarMovimientoCreado(String tipoMovimiento, String usuario, Long movimientoId) {
        // Crear alerta de movimiento creado
        NotificacionDTO notificacion = new NotificacionDTO(
                "📋 Nuevo Movimiento", // Título con emoji
                "Usuario '" + usuario + "' creó un movimiento de tipo '" + tipoMovimiento + "' con ID: " + movimientoId, // Mensaje
                                                                                                                         // detallado
                NotificacionDTO.TipoNotificacion.MOVIMIENTO // Tipo MOVIMIENTO
        );

        // Enviar alerta global
        enviarNotificacionGlobal(notificacion);
    }
}