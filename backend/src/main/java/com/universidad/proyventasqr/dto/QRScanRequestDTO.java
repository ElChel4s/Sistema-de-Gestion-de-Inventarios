package com.universidad.proyventasqr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para procesar una solicitud de escaneo de QR
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QRScanRequestDTO {
    private String qrCode;         // El código QR escaneado (puede ser el ID o la URL completa)
    private Long movimientoId;     // ID del movimiento al que se va a agregar el producto
    private Integer cantidad;      // Cantidad del producto a añadir
    private String tipo;           // Tipo de movimiento (entrada, salida, traslado)
}
