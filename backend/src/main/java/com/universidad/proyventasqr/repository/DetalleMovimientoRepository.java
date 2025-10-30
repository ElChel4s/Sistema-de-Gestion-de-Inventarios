package com.universidad.proyventasqr.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.universidad.proyventasqr.model.DetalleMovimiento;

@Repository
public interface DetalleMovimientoRepository extends JpaRepository<DetalleMovimiento, Long> {

    /**
     * Busca todos los detalles de movimiento por ID de movimiento
     */
    List<DetalleMovimiento> findByMovimientoId(Long movId);

    /**
     * Busca todos los detalles de movimiento por ID de producto
     */
    @Query("SELECT dm FROM DetalleMovimiento dm WHERE dm.producto.idProd = :productoId")
    List<DetalleMovimiento> findByProductoId(@Param("productoId") Long productoId);

    /**
     * Busca detalles de movimiento por producto y rango de fechas
     */
    @Query("SELECT dm FROM DetalleMovimiento dm WHERE dm.producto.idProd = :productoId " +
            "AND dm.movimiento.fecha BETWEEN :fechaInicio AND :fechaFin " +
            "ORDER BY dm.movimiento.fecha")
    List<DetalleMovimiento> findByProductoIdAndMovimientoFechaBetween(
            @Param("productoId") Long productoId,
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin);
}
