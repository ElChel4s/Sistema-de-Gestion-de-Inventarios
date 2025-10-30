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
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "almacen")
public class Almacen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_alm")
    private Long id;

    @Column(name = "nombre")
    private String nombre;

    @Column(name = "ubicacion")
    private String ubicacion;

    @Column(name = "capacidad")
    private Integer capacidad;

    @Column(name = "estado")
    private String estado;

    // Eliminada la relación obsoleta de movimientos, ya que Movimiento ya no tiene el campo almacen
    // Si se requiere relación bidireccional, agregar lo siguiente:
    // @OneToMany(mappedBy = "almacenOrigen", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // private List<Movimiento> movimientosComoOrigen;
    // @OneToMany(mappedBy = "almacenDestino", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // private List<Movimiento> movimientosComoDestino;

    @ManyToOne
    @JoinColumn(name = "responsable_id")
    private Usuario responsable;

}