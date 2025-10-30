package com.universidad.proyventasqr.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventarioDTO {
    private Integer id;
    private ProductoDTO producto;
    private AlmacenDTO almacen;
    private BigDecimal cantidad;
    private LocalDateTime actualizadoEn;
}
