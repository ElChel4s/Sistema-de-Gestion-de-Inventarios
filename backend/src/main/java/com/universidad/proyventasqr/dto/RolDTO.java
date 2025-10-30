package com.universidad.proyventasqr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RolDTO {
    private Integer id;
    private String nombre;
    private String descripcion;
}
