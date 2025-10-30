package com.universidad.proyventasqr.model;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "detalle_movimiento")
public class DetalleMovimiento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_det")
    private Long id;
    @ManyToOne
    @JoinColumn(name = "movimiento_id", referencedColumnName = "id_mov")
    private Movimiento movimiento;
    @ManyToOne
    @JoinColumn(name = "producto_id", referencedColumnName = "id_prod")
    private Producto producto;
    @Column(name = "cantidad", precision = 10, scale = 2, nullable = false)
    private java.math.BigDecimal cantidad;


}
