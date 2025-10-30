package com.universidad.proyventasqr.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.universidad.proyventasqr.dto.KardexDTO;
import com.universidad.proyventasqr.model.DetalleMovimiento;
import com.universidad.proyventasqr.model.Movimiento;
import com.universidad.proyventasqr.model.Producto;
import com.universidad.proyventasqr.repository.DetalleMovimientoRepository;
import com.universidad.proyventasqr.repository.ProductoRepository;
import com.universidad.proyventasqr.service.IKardexService;

@Service
public class KardexServiceImpl implements IKardexService {

    @Autowired
    private DetalleMovimientoRepository detalleMovimientoRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Override
    public List<KardexDTO> obtenerKardexPorProducto(Long productoId) {
        // Verificar que el producto existe
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + productoId));

        // Obtener todos los detalles de movimiento para este producto
        List<DetalleMovimiento> detalles = detalleMovimientoRepository.findByProductoId(productoId);

        return construirKardex(detalles);
    }

    @Override
    public List<KardexDTO> obtenerKardexPorProductoYFechas(Long productoId, String fechaInicio, String fechaFin) {
        // Verificar que el producto existe
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + productoId));

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate fechaInicioDate = LocalDate.parse(fechaInicio, formatter);
        LocalDate fechaFinDate = LocalDate.parse(fechaFin, formatter);

        // Obtener detalles filtrados por fecha
        List<DetalleMovimiento> detalles = detalleMovimientoRepository
                .findByProductoIdAndMovimientoFechaBetween(productoId, fechaInicioDate, fechaFinDate);

        return construirKardex(detalles);
    }

    /**
     * Construye el Kardex a partir de los detalles de movimiento
     */
    private List<KardexDTO> construirKardex(List<DetalleMovimiento> detalles) {
        List<KardexDTO> kardex = new ArrayList<>();
        BigDecimal saldoAcumulado = BigDecimal.ZERO;

        // Ordenar detalles por fecha
        detalles.sort(Comparator.comparing(det -> det.getMovimiento().getFecha()));

        for (DetalleMovimiento detalle : detalles) {
            Movimiento movimiento = detalle.getMovimiento();
            BigDecimal cantidad = detalle.getCantidad();

            // Calcular saldo anterior
            BigDecimal saldoAnterior = saldoAcumulado;

            // Calcular saldo posterior según el tipo de movimiento
            BigDecimal saldoPosterior;
            switch (movimiento.getTipoMov().toLowerCase()) {
                case "entrada":
                    saldoPosterior = saldoAnterior.add(cantidad);
                    break;
                case "salida":
                    saldoPosterior = saldoAnterior.subtract(cantidad);
                    break;
                case "transferencia":
                    // Para transferencias, el saldo total no cambia, solo se mueve entre almacenes
                    saldoPosterior = saldoAnterior;
                    break;
                default:
                    saldoPosterior = saldoAnterior;
                    break;
            }

            // Actualizar saldo acumulado
            saldoAcumulado = saldoPosterior;

            // Construir DTO del Kardex
            KardexDTO kardexDTO = KardexDTO.builder()
                    .movimientoId(movimiento.getId())
                    .fecha(movimiento.getFecha())
                    .tipoMovimiento(movimiento.getTipoMov())
                    .usuarioMovimiento(movimiento.getUsuarioMov())
                    .almacenOrigen(
                            movimiento.getAlmacenOrigen() != null ? movimiento.getAlmacenOrigen().getNombre() : null)
                    .almacenDestino(
                            movimiento.getAlmacenDestino() != null ? movimiento.getAlmacenDestino().getNombre() : null)
                    .cantidad(cantidad)
                    .saldoAnterior(saldoAnterior)
                    .saldoPosterior(saldoPosterior)
                    .motivo(movimiento.getMotivo())
                    .build();

            kardex.add(kardexDTO);
        }

        return kardex;
    }
}