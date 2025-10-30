package com.universidad.proyventasqr.dto;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovimientoDTO implements Serializable{
    private Long id;
    private String tipoMov;
    private LocalDate fecha;
    private String usuarioMov;
    private String estado;
    private UsuarioDTO usuario;
    private AlmacenDTO almacenOrigen;
    private AlmacenDTO almacenDestino;
    private String motivo;
    private List<DetalleMovimientoDTO> detalles; // NUEVO: lista de productos/cantidades
}
