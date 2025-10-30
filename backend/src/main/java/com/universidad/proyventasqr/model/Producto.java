package com.universidad.proyventasqr.model;

import java.math.BigDecimal;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "producto")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_prod")
    private Long idProd;
    private String nombre;
    @Column(precision = 10, scale = 2)
    private BigDecimal precio;
    private int stock;
    private String estado;
    @Column(name = "codigo_qr")
    private String codigoQr;
    @ManyToOne
    @JoinColumn(name = "cat_id")
    private Categoria categoria;
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleMovimiento> movimientos;
    @Column(name = "codigo", length = 50)
    private String codigo;
    @Column(name = "descripcion")
    private String descripcion;
    @Column(name = "stock_minimo", precision = 10, scale = 2)
    private BigDecimal stockMinimo;
    @Column(name = "creado_en")
    private java.time.LocalDateTime creadoEn;
}
