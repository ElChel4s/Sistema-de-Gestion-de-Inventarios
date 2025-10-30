package com.universidad.proyventasqr.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDTO {

    // Estadísticas generales
    private Long totalProductos;
    private Long totalAlmacenes;
    private BigDecimal valorTotalProductos;

    // Estadísticas por almacén
    private List<AlmacenStatsDTO> productosPorAlmacen;

    // Productos más vendidos
    private List<ProductoDTO> productosMasVendidos;

    // Productos con bajo stock
    private List<ProductoDTO> productosBajoStock;

    // Estadísticas de movimientos
    private Long cantidadCompras;
    private Long cantidadVentas;
    private BigDecimal valorCompras;
    private BigDecimal valorVentas;

    // Estadísticas por usuario
    private List<UsuarioStatsDTO> estadisticasPorUsuario;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AlmacenStatsDTO {
        private Long almacenId;
        private String nombreAlmacen;
        private Long cantidadProductos;
        private BigDecimal valorTotal;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UsuarioStatsDTO {
        private Long usuarioId;
        private String nombreUsuario;
        private Long cantidadCompras;
        private Long cantidadVentas;
        private Long cantidadTraspasos;
        private BigDecimal valorCompras;
        private BigDecimal valorVentas;
    }
}