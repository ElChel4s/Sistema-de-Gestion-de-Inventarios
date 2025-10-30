package com.universidad.proyventasqr.service;

import java.util.List;

import com.universidad.proyventasqr.dto.MovimientoDTO;

public interface IMovimientoService {
    MovimientoDTO crearMovimiento(MovimientoDTO movimientoDTO);

    MovimientoDTO crearMovimientoConUsuario(MovimientoDTO movimientoDTO, String username);

    MovimientoDTO obtenerMovimientoPorId(Long id);

    List<MovimientoDTO> obtenerTodosLosMovimientos();

    // List<MovimientoDTO> obtenerMovimientosPorAlmacen(Long almId);
    // Si necesitas filtrar por almacenOrigen o almacenDestino, define métodos como:
    // List<MovimientoDTO> obtenerMovimientosPorAlmacenOrigen(Long almacenOrigenId);
    // List<MovimientoDTO> obtenerMovimientosPorAlmacenDestino(Long
    // almacenDestinoId);
    MovimientoDTO actualizarMovimiento(Long id, MovimientoDTO movimientoDTO);

    void eliminarMovimiento(Long id);

    byte[] generarTicketMovimientoPDF(Long movimientoId);
}
