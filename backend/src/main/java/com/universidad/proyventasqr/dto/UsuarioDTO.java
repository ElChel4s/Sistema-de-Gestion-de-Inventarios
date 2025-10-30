package com.universidad.proyventasqr.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioDTO {
    private Integer id;
    private String nombreUsuario;
    private String claveHash;
    private RolDTO rol;
    private LocalDateTime creadoEn;
}
