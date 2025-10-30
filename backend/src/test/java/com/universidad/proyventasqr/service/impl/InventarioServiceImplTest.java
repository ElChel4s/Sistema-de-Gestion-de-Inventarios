package com.universidad.proyventasqr.service.impl;

import com.universidad.proyventasqr.dto.InventarioDTO;
import com.universidad.proyventasqr.model.Almacen;
import com.universidad.proyventasqr.model.Inventario;
import com.universidad.proyventasqr.model.Producto;
import com.universidad.proyventasqr.repository.InventarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.Arrays;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class InventarioServiceImplTest {
    @Mock
    private InventarioRepository inventarioRepository;

    @InjectMocks
    private InventarioServiceImpl inventarioService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testObtenerTodosLosInventarios() {
        Almacen almacen = Almacen.builder().id(1L).nombre("Central").build();
        Producto producto1 = Producto.builder().idProd(1L).nombre("Prod1").build();
        Producto producto2 = Producto.builder().idProd(2L).nombre("Prod2").build();
        Inventario inv1 = Inventario.builder().id(1).producto(producto1).almacen(almacen).cantidad(new java.math.BigDecimal("10")).actualizadoEn(java.time.LocalDateTime.now()).build();
        Inventario inv2 = Inventario.builder().id(2).producto(producto2).almacen(almacen).cantidad(new java.math.BigDecimal("20")).actualizadoEn(java.time.LocalDateTime.now()).build();
        when(inventarioRepository.findAll()).thenReturn(Arrays.asList(inv1, inv2));
        List<InventarioDTO> resultado = inventarioService.obtenerTodosLosInventarios();
        assertEquals(2, resultado.size());
        assertEquals(1L, resultado.get(0).getProducto().getIdProd());
    }

    @Test
    void testEliminarInventario() {
        doNothing().when(inventarioRepository).deleteById(1);
        inventarioService.eliminarInventario(1);
        verify(inventarioRepository, times(1)).deleteById(1);
    }
}
