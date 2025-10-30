package com.universidad.proyventasqr.model;

import java.time.LocalDate;
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
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Movimiento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_mov")
    private Long id;
    @Column(name = "tipo_mov")
    private String tipoMov;
    @Temporal(TemporalType.DATE)
    private LocalDate fecha;
    @Column(name = "usuario_mov")
    private String usuarioMov;
    private String estado;
    @OneToMany(mappedBy = "movimiento", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleMovimiento> productos;
    @ManyToOne
    @JoinColumn(name = "usuario_id", referencedColumnName = "id")
    private Usuario usuario;
    @ManyToOne
    @JoinColumn(name = "almacen_origen_id", referencedColumnName = "id_alm")
    private Almacen almacenOrigen;
    @ManyToOne
    @JoinColumn(name = "almacen_destino_id", referencedColumnName = "id_alm")
    private Almacen almacenDestino;
    @Column(name = "motivo")
    private String motivo;


}
