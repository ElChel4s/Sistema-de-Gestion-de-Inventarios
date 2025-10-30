package com.universidad.proyventasqr.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import com.universidad.proyventasqr.model.Categoria;

@DataJpaTest
class CategoriaRepositoryIT {
    @Autowired
    private CategoriaRepository repo;

    @Test
    void guardarYBuscarCategoria() {
        Categoria categoria = Categoria.builder()
            .nombre("Accesorios de cocina")
            .descripcion("todo tipo de accesorios como olla, sartenes, etc.")
            .estado("ACTIVO")
            .fecha_alta(LocalDate.now())
            .build();
        repo.save(categoria);
        assertThat(repo.findByNombre("Accesorios de cocina")).isNotNull();
    }
}
