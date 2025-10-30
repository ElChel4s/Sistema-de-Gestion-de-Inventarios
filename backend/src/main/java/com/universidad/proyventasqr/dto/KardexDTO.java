package com.universidad.proyventasqr.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para representar un registro del Kardex de un producto
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KardexDTO {
    private Long movimientoId;
    private LocalDate fecha;
    private String tipoMovimiento;
    private String usuarioMovimiento;
    private String almacenOrigen;
    private String almacenDestino;
    private BigDecimal cantidad;
    private BigDecimal saldoAnterior;
    private BigDecimal saldoPosterior;
    private String motivo;

}