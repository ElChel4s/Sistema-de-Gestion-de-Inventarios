package com.universidad.proyventasqr.dto;

import java.time.LocalDateTime;

/**
 * DTO simplificado para alertas temporales
 * Las alertas aparecen automáticamente y desaparecen después de un tiempo
 */
public class NotificacionDTO {

    // ID único de la alerta
    private String id;

    // Título de la alerta (ej: "🚨 Stock Bajo", "📋 Nuevo Movimiento")
    private String titulo;

    // Mensaje detallado de la alerta
    private String mensaje;

    // Tipo de alerta para categorizar
    private TipoNotificacion tipo;

    // Fecha y hora de creación (para ordenar)
    private LocalDateTime fechaCreacion;

    /**
     * Tipos de alertas simplificados
     */
    public enum TipoNotificacion {
        STOCK, // Alertas relacionadas con stock bajo
        MOVIMIENTO // Alertas relacionadas con movimientos de inventario
    }

    // Constructor vacío requerido por Spring
    public NotificacionDTO() {
        this.fechaCreacion = LocalDateTime.now();
    }

    // Constructor principal simplificado
    public NotificacionDTO(String titulo, String mensaje, TipoNotificacion tipo) {
        this.titulo = titulo;
        this.mensaje = mensaje;
        this.tipo = tipo;
        this.fechaCreacion = LocalDateTime.now();
    }

    // Constructor completo
    public NotificacionDTO(String id, String titulo, String mensaje, TipoNotificacion tipo,
            LocalDateTime fechaCreacion) {
        this.id = id;
        this.titulo = titulo;
        this.mensaje = mensaje;
        this.tipo = tipo;
        this.fechaCreacion = fechaCreacion;
    }

    // Getters y Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public TipoNotificacion getTipo() {
        return tipo;
    }

    public void setTipo(TipoNotificacion tipo) {
        this.tipo = tipo;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}