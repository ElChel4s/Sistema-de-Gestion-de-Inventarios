package com.universidad.proyventasqr.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "inventario")
public class Inventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Generación automática de ID
    @Column(name = "id", nullable = false) // Columna no nula
    private Integer id; // Identificador único del inventario

    @ManyToOne
    @JoinColumn(name = "producto_id", referencedColumnName = "id_prod", nullable = false)
    private Producto producto; // Relación con producto

    @ManyToOne
    @JoinColumn(name = "almacen_id", referencedColumnName = "id_alm", nullable = false)
    private Almacen almacen; // Relación con almacén

    @Column(name = "cantidad", precision = 10, scale = 2, nullable = false)
    private BigDecimal cantidad; // Cantidad disponible en inventario

    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn; // Fecha y hora de la última actualización

    // Método auxiliar para validar si la cantidad es positiva
    public boolean cantidadValida() {
        return cantidad != null && cantidad.compareTo(BigDecimal.ZERO) >= 0;
    }
}
