package com.universidad.proyventasqr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data

@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlmacenDTO {

    private Long idAlm; // Identificador del almacén
    private String nombre; // Nombre del almacén
    private String ubicacion; // Ubicación del almacén
    private Integer capacidad; // Capacidad del almacén
    private String estado; // Estado del almacén (activo, inactivo, cerrado, etc.)
    private UsuarioDTO responsable; // Nuevo: responsable del almacén

}

