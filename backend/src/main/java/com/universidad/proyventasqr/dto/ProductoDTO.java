package com.universidad.proyventasqr.dto;

import java.io.Serializable;
import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoDTO implements Serializable{
    private Long idProd;
    private String nombre;
    private BigDecimal precio;
    private int stock;
    private String estado;
    private String codigoQr;
    private String codigo;
    private String descripcion;
    private BigDecimal stockMinimo;
    private java.time.LocalDateTime creadoEn;
    @JsonProperty("categoria")
    private CategoriaDTO categoria;
}
