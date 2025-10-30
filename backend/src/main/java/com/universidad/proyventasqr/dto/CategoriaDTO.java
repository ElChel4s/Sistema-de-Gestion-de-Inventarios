package com.universidad.proyventasqr.dto;

import java.sql.Date;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoriaDTO {
    public Long id;
    private String nombre;
    private String descripcion;
    private String estado;
    private LocalDate fechaBaja;
    private LocalDate fechaAlta;
    private String motivoBaja;
}