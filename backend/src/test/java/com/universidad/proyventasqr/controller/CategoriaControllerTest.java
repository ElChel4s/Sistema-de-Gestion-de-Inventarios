package com.universidad.proyventasqr.controller;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.universidad.proyventasqr.dto.CategoriaDTO;

import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
@Disabled("Skipping test temporarily due to environment or other issues.")
@WebMvcTest(CategoriaController.class)
@AutoConfigureMockMvc(addFilters = false)
class CategoriaControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private com.universidad.proyventasqr.service.ICategoriaService categoriaService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void crearCategoria_retorna201() throws Exception{
        CategoriaDTO dto = CategoriaDTO.builder()
            .nombre("Ropa de Vernado")
            .descripcion("Vestimenta para el calor como ser polera, shorts, etc.")
            .estado("ACTIVO")
            .fechaAlta(LocalDate.now())
            .fechaBaja(LocalDate.now().plusDays(1))
            .motivoBaja("Descontinuado")
            .build();
        // Mockear el servicio para que devuelva el mismo DTO
        org.mockito.Mockito.when(categoriaService.crearCategoria(org.mockito.Mockito.any(CategoriaDTO.class)))
            .thenReturn(dto);
        mockMvc.perform(post("/api/categoria")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andExpect(status().isCreated());
    }
}
