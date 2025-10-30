package com.universidad.proyventasqr.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.universidad.proyventasqr.model.Movimiento;


@Repository
public interface MovimientoRepository extends JpaRepository<Movimiento, Long>{
    // Eliminado método findByAlmacenId porque ya no existe el campo almacen en Movimiento
    // Si necesitas buscar por almacenOrigen o almacenDestino, crea métodos como:
    // List<Movimiento> findByAlmacenOrigenId(Long almacenOrigenId);
    // List<Movimiento> findByAlmacenDestinoId(Long almacenDestinoId);
}
