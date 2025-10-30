package com.universidad.proyventasqr.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.Set;

import jakarta.validation.Validator;
import jakarta.validation.Validation;

import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;

public class CategoriaTest {
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void categoriaSinEstadoNoEsValido() {
        Categoria categoria = Categoria.builder()
            .nombre("Ropa de Invierno")
            .descripcion("Prendas de vestir para combatir el frio")
            //.estado("8")
            //.estado("ACTIVO")
            .build();
        Set<ConstraintViolation<Categoria>> violations = validator.validate(categoria);
        violations.forEach(v -> System.out.println(v.getPropertyPath() + ":" + v.getMessage()));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().contains("estado"));
    }
}
