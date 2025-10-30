package com.universidad.proyventasqr.service.impl;

import com.universidad.proyventasqr.dto.AlmacenDTO;
import com.universidad.proyventasqr.model.Almacen;
import com.universidad.proyventasqr.repository.AlmacenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.Arrays;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AlmacenServiceImplTest {
    @Mock
    private AlmacenRepository almacenRepository;

    @InjectMocks
    private AlmacenServiceImpl almacenService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testObtenerTodosLosAlmacenes() {
        Almacen a1 = Almacen.builder().id(1L).nombre("Central").capacidad(100).estado("activo").build();
        Almacen a2 = Almacen.builder().id(2L).nombre("Secundario").capacidad(50).estado("activo").build();
        when(almacenRepository.findAll()).thenReturn(Arrays.asList(a1, a2));
        List<AlmacenDTO> resultado = almacenService.obtenerTodosLosAlmacenes();
        assertEquals(2, resultado.size());
        assertEquals("Central", resultado.get(0).getNombre());
    }

    @Test
    void testEliminarAlmacen() {
        doNothing().when(almacenRepository).deleteById(1L);
        almacenService.eliminarAlmacen(1L);
        verify(almacenRepository, times(1)).deleteById(1L);
    }

    @Test
    void testActualizarAlmacen() {
        Almacen almacenExistente = Almacen.builder().id(1L).nombre("Central").ubicacion("Calle 1").capacidad(100).estado("activo").build();
        AlmacenDTO almacenDTO = AlmacenDTO.builder().idAlm(1L).nombre("Central Actualizado").ubicacion("Calle 2").capacidad(200).estado("activo").build();
        when(almacenRepository.findById(1L)).thenReturn(java.util.Optional.of(almacenExistente));
        when(almacenRepository.save(any(Almacen.class))).thenReturn(almacenExistente);
        AlmacenServiceImpl service = new AlmacenServiceImpl(almacenRepository);
        AlmacenDTO actualizado = service.actualizarAlmacen(1L, almacenDTO);
        assertEquals("Central Actualizado", actualizado.getNombre());
        assertEquals(200, actualizado.getCapacidad());
    }

    @Test
    void testEliminarLogico() {
        Almacen almacen = Almacen.builder().id(1L).nombre("Central").estado("activo").build();
        when(almacenRepository.findById(1L)).thenReturn(java.util.Optional.of(almacen));
        when(almacenRepository.save(any(Almacen.class))).thenReturn(almacen);
        AlmacenServiceImpl service = new AlmacenServiceImpl(almacenRepository);
        service.eliminarLogico(1L);
        verify(almacenRepository, times(1)).save(any(Almacen.class));
    }

    @Test
    void testEliminarAlmacenConInventariosRelacionados() {
        // Simula excepción por restricción de llave foránea
        doThrow(new org.springframework.dao.DataIntegrityViolationException("Restricción de llave foránea")).when(almacenRepository).deleteById(5L);
        Exception exception = assertThrows(org.springframework.dao.DataIntegrityViolationException.class, () -> {
            almacenService.eliminarAlmacen(5L);
        });
        assertTrue(exception.getMessage().contains("Restricción de llave foránea"));
    }
}
