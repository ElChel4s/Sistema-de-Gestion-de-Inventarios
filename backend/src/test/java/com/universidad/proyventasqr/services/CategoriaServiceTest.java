package com.universidad.proyventasqr.services;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import java.util.Optional;

import com.universidad.proyventasqr.dto.CategoriaDTO;
import com.universidad.proyventasqr.model.Categoria;
import com.universidad.proyventasqr.repository.CategoriaRepository;
import com.universidad.proyventasqr.service.impl.CategoriaServiceImpl;
class CategoriaServiceTest {
    @Test
    void obtenerCategoriaPorId_devuelveDTO() {
        CategoriaRepository repo = mock(CategoriaRepository.class);
        CategoriaServiceImpl service = new CategoriaServiceImpl(repo);
        Categoria categoria = Categoria.builder().id(1L).nombre("Ropa de Invierno").build();
        when(repo.findById(1L)).thenReturn(Optional.of(categoria));
        CategoriaDTO dto = service.obtenerCategoriaPorId(1L);
        assertThat(dto.getNombre()).isEqualTo("Ropa de Invierno");
    }
}
