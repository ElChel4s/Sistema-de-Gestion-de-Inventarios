package com.universidad.proyventasqr.service;

import com.universidad.proyventasqr.dto.NotificacionDTO;

/**
 * Interfaz del servicio de alertas temporales
 * Las alertas aparecen automáticamente y desaparecen después de un tiempo
 */
public interface INotificacionService {

    /**
     * Envía una alerta global a TODOS los usuarios conectados
     * La alerta aparecerá automáticamente y desaparecerá después de un tiempo
     * 
     * @param notificacion - La alerta a enviar
     */
    void enviarNotificacionGlobal(NotificacionDTO notificacion);

    /**
     * Crea y envía una alerta de stock bajo
     * 
     * @param nombreProducto - Nombre del producto con stock bajo
     * @param stockActual    - Stock actual del producto
     * @param stockMinimo    - Stock mínimo configurado
     */
    void notificarStockBajo(String nombreProducto, int stockActual, int stockMinimo);

    /**
     * Crea y envía una alerta cuando se crea un movimiento
     * 
     * @param tipoMovimiento - Tipo de movimiento (ENTRADA/SALIDA)
     * @param usuario        - Usuario que creó el movimiento
     * @param movimientoId   - ID del movimiento creado
     */
    void notificarMovimientoCreado(String tipoMovimiento, String usuario, Long movimientoId);
}