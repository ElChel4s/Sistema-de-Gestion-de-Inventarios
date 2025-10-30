package com.universidad.proyventasqr.service.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.universidad.proyventasqr.dto.AlmacenDTO;
import com.universidad.proyventasqr.dto.DashboardDTO;
import com.universidad.proyventasqr.dto.DetalleMovimientoDTO;
import com.universidad.proyventasqr.dto.InventarioDTO;
import com.universidad.proyventasqr.dto.MovimientoDTO;
import com.universidad.proyventasqr.dto.ProductoDTO;
import com.universidad.proyventasqr.dto.UsuarioDTO;
import com.universidad.proyventasqr.service.IAlmacenService;
import com.universidad.proyventasqr.service.IDashboardService;
import com.universidad.proyventasqr.service.IMovimientoService;
import com.universidad.proyventasqr.service.IProductoService;
import com.universidad.proyventasqr.service.IUsuarioService;
import com.universidad.proyventasqr.service.IInventarioService;

@Service
public class DashboardServiceImpl implements IDashboardService {

    @Autowired
    private IProductoService productoService;

    @Autowired
    private IMovimientoService movimientoService;

    @Autowired
    private IAlmacenService almacenService;

    @Autowired
    private IUsuarioService usuarioService;

    @Autowired
    private IInventarioService inventarioService;

    @Override
    public DashboardDTO obtenerDatosDashboard() {
        DashboardDTO dashboard = new DashboardDTO();

        try {
            System.out.println("DEBUG: Iniciando obtención de datos del dashboard");

            // Obtener datos básicos
            List<ProductoDTO> productos = productoService.obtenerTodosLosProductos();
            List<AlmacenDTO> almacenes = almacenService.obtenerTodosLosAlmacenes();
            List<MovimientoDTO> movimientos = movimientoService.obtenerTodosLosMovimientos();

            System.out.println("DEBUG: Productos encontrados: " + productos.size());
            System.out.println("DEBUG: Almacenes encontrados: " + almacenes.size());
            System.out.println("DEBUG: Movimientos encontrados: " + movimientos.size());

            // 1. Estadísticas generales
            dashboard.setTotalProductos((long) productos.size());
            dashboard.setTotalAlmacenes((long) almacenes.size());

            // Calcular valor total de productos basado en el inventario real
            BigDecimal valorTotal = BigDecimal.ZERO;
            int productosConInventario = 0;

            // Obtener todo el inventario
            List<InventarioDTO> todoInventario = inventarioService.obtenerTodosLosInventarios();
            System.out.println("DEBUG: Inventarios encontrados: " + todoInventario.size());

            for (InventarioDTO inventario : todoInventario) {
                if (inventario.getCantidad() != null && inventario.getProducto() != null &&
                        inventario.getProducto().getPrecio() != null &&
                        inventario.getCantidad().compareTo(BigDecimal.ZERO) > 0) {

                    BigDecimal valorProducto = inventario.getProducto().getPrecio()
                            .multiply(inventario.getCantidad());
                    valorTotal = valorTotal.add(valorProducto);
                    productosConInventario++;

                    System.out.println("DEBUG: Inventario - Producto: " + inventario.getProducto().getNombre() +
                            " - Almacén: " + inventario.getAlmacen().getNombre() +
                            " - Cantidad: " + inventario.getCantidad() +
                            " - Precio: " + inventario.getProducto().getPrecio() +
                            " - Valor: " + valorProducto);
                }
            }

            dashboard.setValorTotalProductos(valorTotal);
            System.out.println("DEBUG: Productos con inventario: " + productosConInventario +
                    " - Valor total productos: " + valorTotal);

            // 2. Productos por almacén y su valor
            List<DashboardDTO.AlmacenStatsDTO> productosPorAlmacen = new ArrayList<>();
            for (AlmacenDTO almacen : almacenes) {
                DashboardDTO.AlmacenStatsDTO stats = new DashboardDTO.AlmacenStatsDTO();
                stats.setAlmacenId(almacen.getIdAlm());
                stats.setNombreAlmacen(almacen.getNombre());

                // Obtener inventario real del almacén
                List<InventarioDTO> inventariosAlmacen = inventarioService
                        .obtenerInventariosPorAlmacen(almacen.getIdAlm());

                // Contar productos únicos en este almacén
                long cantidadProductos = inventariosAlmacen.size();
                stats.setCantidadProductos(cantidadProductos);

                // Calcular valor real del inventario en este almacén
                BigDecimal valorAlmacen = BigDecimal.ZERO;
                for (InventarioDTO inventario : inventariosAlmacen) {
                    if (inventario.getCantidad() != null && inventario.getProducto() != null &&
                            inventario.getProducto().getPrecio() != null) {
                        BigDecimal valorProducto = inventario.getProducto().getPrecio()
                                .multiply(inventario.getCantidad());
                        valorAlmacen = valorAlmacen.add(valorProducto);
                    }
                }
                stats.setValorTotal(valorAlmacen);

                productosPorAlmacen.add(stats);
                System.out.println("DEBUG: Almacén " + almacen.getNombre() + " - Productos únicos: " + cantidadProductos
                        + " - Valor real: " + valorAlmacen);
            }
            dashboard.setProductosPorAlmacen(productosPorAlmacen);

            // 3. Productos más vendidos (basado en movimientos de salida)
            List<ProductoDTO> productosMasVendidos = obtenerProductosMasVendidos(movimientos);
            dashboard.setProductosMasVendidos(productosMasVendidos);
            System.out.println("DEBUG: Productos más vendidos encontrados: " + productosMasVendidos.size());

            // 4. Productos con bajo stock (solo si tienen stock mínimo definido)
            List<ProductoDTO> productosBajoStock = productos.stream()
                    .filter(p -> ("activo".equalsIgnoreCase(p.getEstado())
                            || "disponible".equalsIgnoreCase(p.getEstado())) &&
                            p.getStockMinimo() != null && p.getStock() <= p.getStockMinimo().intValue())
                    .sorted((p1, p2) -> Integer.compare(p1.getStock(), p2.getStock()))
                    .limit(10)
                    .collect(Collectors.toList());
            dashboard.setProductosBajoStock(productosBajoStock);
            System.out.println("DEBUG: Productos con bajo stock encontrados: " + productosBajoStock.size());

            // 5. Estadísticas de compras y ventas
            Map<String, Object> estadisticasMovimientos = calcularEstadisticasMovimientos(movimientos);
            dashboard.setCantidadCompras((Long) estadisticasMovimientos.get("cantidadCompras"));
            dashboard.setCantidadVentas((Long) estadisticasMovimientos.get("cantidadVentas"));
            dashboard.setValorCompras((BigDecimal) estadisticasMovimientos.get("valorCompras"));
            dashboard.setValorVentas((BigDecimal) estadisticasMovimientos.get("valorVentas"));
            System.out.println("DEBUG: Compras: " + dashboard.getCantidadCompras() + " - Ventas: "
                    + dashboard.getCantidadVentas());

            // 6. Estadísticas por usuario (usar usuarioMov si usuario es NULL)
            List<DashboardDTO.UsuarioStatsDTO> estadisticasPorUsuario = calcularEstadisticasPorUsuario(movimientos);
            dashboard.setEstadisticasPorUsuario(estadisticasPorUsuario);
            System.out.println("DEBUG: Estadísticas por usuario encontradas: " + estadisticasPorUsuario.size());

            System.out.println("DEBUG: Dashboard completado exitosamente");

        } catch (Exception e) {
            System.err.println("ERROR en Dashboard: " + e.getMessage());
            e.printStackTrace();
            // En caso de error, establecer valores por defecto
            dashboard.setTotalProductos(0L);
            dashboard.setTotalAlmacenes(0L);
            dashboard.setValorTotalProductos(BigDecimal.ZERO);
            dashboard.setProductosPorAlmacen(new ArrayList<>());
            dashboard.setProductosMasVendidos(new ArrayList<>());
            dashboard.setProductosBajoStock(new ArrayList<>());
            dashboard.setCantidadCompras(0L);
            dashboard.setCantidadVentas(0L);
            dashboard.setValorCompras(BigDecimal.ZERO);
            dashboard.setValorVentas(BigDecimal.ZERO);
            dashboard.setEstadisticasPorUsuario(new ArrayList<>());
        }

        return dashboard;
    }

    /**
     * Calcula los productos más vendidos basado en movimientos de salida
     */
    private List<ProductoDTO> obtenerProductosMasVendidos(List<MovimientoDTO> movimientos) {
        Map<Long, BigDecimal> ventasPorProducto = new HashMap<>();

        for (MovimientoDTO movimiento : movimientos) {
            // Considerar movimientos de salida (ventas, transferencias, etc.)
            if ("venta".equalsIgnoreCase(movimiento.getTipoMov()) ||
                    "salida".equalsIgnoreCase(movimiento.getTipoMov()) ||
                    "transferencia".equalsIgnoreCase(movimiento.getTipoMov())) {

                if (movimiento.getDetalles() != null) {
                    for (DetalleMovimientoDTO detalle : movimiento.getDetalles()) {
                        if (detalle.getProducto() != null && detalle.getCantidad() != null) {
                            Long productoId = detalle.getProducto().getIdProd();
                            BigDecimal cantidad = detalle.getCantidad();

                            ventasPorProducto.put(productoId,
                                    ventasPorProducto.getOrDefault(productoId, BigDecimal.ZERO).add(cantidad));
                        }
                    }
                }
            }
        }

        // Ordenar por cantidad vendida y obtener los top 10
        return ventasPorProducto.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                .limit(10)
                .map(entry -> {
                    try {
                        return productoService.obtenerProductoPorId(entry.getKey());
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(p -> p != null)
                .collect(Collectors.toList());
    }

    /**
     * Calcula estadísticas de compras y ventas
     */
    private Map<String, Object> calcularEstadisticasMovimientos(List<MovimientoDTO> movimientos) {
        Map<String, Object> estadisticas = new HashMap<>();
        long cantidadCompras = 0;
        long cantidadVentas = 0;
        BigDecimal valorCompras = BigDecimal.ZERO;
        BigDecimal valorVentas = BigDecimal.ZERO;

        System.out.println("DEBUG: Procesando " + movimientos.size() + " movimientos para estadísticas generales");

        for (MovimientoDTO movimiento : movimientos) {
            System.out.println("DEBUG: Movimiento ID: " + movimiento.getId() + " - Tipo: " + movimiento.getTipoMov()
                    + " - Detalles: " + (movimiento.getDetalles() != null ? movimiento.getDetalles().size() : "NULL"));

            if ("compra".equalsIgnoreCase(movimiento.getTipoMov()) ||
                    "entrada".equalsIgnoreCase(movimiento.getTipoMov())) {
                cantidadCompras++;
                System.out.println("DEBUG: Compra detectada - ID: " + movimiento.getId());

                // Calcular valor de compras
                if (movimiento.getDetalles() != null) {
                    for (DetalleMovimientoDTO detalle : movimiento.getDetalles()) {
                        System.out.println("DEBUG: Detalle - Producto: "
                                + (detalle.getProducto() != null ? detalle.getProducto().getNombre() : "NULL") +
                                " - Cantidad: " + detalle.getCantidad() +
                                " - Precio: "
                                + (detalle.getProducto() != null ? detalle.getProducto().getPrecio() : "NULL"));

                        if (detalle.getProducto() != null && detalle.getCantidad() != null &&
                                detalle.getProducto().getPrecio() != null) {
                            BigDecimal valor = detalle.getProducto().getPrecio().multiply(detalle.getCantidad());
                            valorCompras = valorCompras.add(valor);
                            System.out.println(
                                    "DEBUG: Valor compra calculado: " + valor + " - Total acumulado: " + valorCompras);
                        } else {
                            System.out.println("DEBUG: Detalle sin datos suficientes para calcular valor");
                        }
                    }
                } else {
                    System.out.println("DEBUG: Movimiento sin detalles");
                }
            } else if ("venta".equalsIgnoreCase(movimiento.getTipoMov()) ||
                    "salida".equalsIgnoreCase(movimiento.getTipoMov())) {
                cantidadVentas++;
                System.out.println("DEBUG: Venta detectada - ID: " + movimiento.getId());

                // Calcular valor de ventas
                if (movimiento.getDetalles() != null) {
                    for (DetalleMovimientoDTO detalle : movimiento.getDetalles()) {
                        System.out.println("DEBUG: Detalle - Producto: "
                                + (detalle.getProducto() != null ? detalle.getProducto().getNombre() : "NULL") +
                                " - Cantidad: " + detalle.getCantidad() +
                                " - Precio: "
                                + (detalle.getProducto() != null ? detalle.getProducto().getPrecio() : "NULL"));

                        if (detalle.getProducto() != null && detalle.getCantidad() != null &&
                                detalle.getProducto().getPrecio() != null) {
                            BigDecimal valor = detalle.getProducto().getPrecio().multiply(detalle.getCantidad());
                            valorVentas = valorVentas.add(valor);
                            System.out.println(
                                    "DEBUG: Valor venta calculado: " + valor + " - Total acumulado: " + valorVentas);
                        } else {
                            System.out.println("DEBUG: Detalle sin datos suficientes para calcular valor");
                        }
                    }
                } else {
                    System.out.println("DEBUG: Movimiento sin detalles");
                }
            }
        }

        System.out.println("DEBUG: Resumen - Compras: " + cantidadCompras + " - Ventas: " + cantidadVentas +
                " - Valor Compras: " + valorCompras + " - Valor Ventas: " + valorVentas);

        estadisticas.put("cantidadCompras", cantidadCompras);
        estadisticas.put("cantidadVentas", cantidadVentas);
        estadisticas.put("valorCompras", valorCompras);
        estadisticas.put("valorVentas", valorVentas);

        return estadisticas;
    }

    /**
     * Calcula estadísticas por usuario
     */
    private List<DashboardDTO.UsuarioStatsDTO> calcularEstadisticasPorUsuario(List<MovimientoDTO> movimientos) {
        Map<String, DashboardDTO.UsuarioStatsDTO> estadisticasPorUsuario = new HashMap<>();

        System.out.println("DEBUG: Procesando " + movimientos.size() + " movimientos para estadísticas por usuario");

        for (MovimientoDTO movimiento : movimientos) {
            String nombreUsuario = null;
            Long usuarioId = null;

            // Intentar obtener usuario del objeto Usuario primero
            if (movimiento.getUsuario() != null) {
                usuarioId = movimiento.getUsuario().getId().longValue();
                nombreUsuario = movimiento.getUsuario().getNombreUsuario();
                System.out.println("DEBUG: Movimiento ID: " + movimiento.getId() + " - Tipo: " + movimiento.getTipoMov()
                        + " - Usuario: " + nombreUsuario);
            } else if (movimiento.getUsuarioMov() != null && !movimiento.getUsuarioMov().trim().isEmpty()) {
                // Si no hay usuario asociado, usar el campo usuarioMov
                nombreUsuario = movimiento.getUsuarioMov();
                usuarioId = (long) nombreUsuario.hashCode(); // Usar hash como ID temporal
                System.out.println("DEBUG: Movimiento ID: " + movimiento.getId() + " - Tipo: " + movimiento.getTipoMov()
                        + " - UsuarioMov: " + nombreUsuario);
            } else {
                System.out.println("DEBUG: Movimiento sin usuario asociado ni usuarioMov");
                continue; // Saltar movimientos sin usuario
            }

            DashboardDTO.UsuarioStatsDTO stats = estadisticasPorUsuario.get(nombreUsuario);
            if (stats == null) {
                stats = new DashboardDTO.UsuarioStatsDTO();
                stats.setUsuarioId(usuarioId);
                stats.setNombreUsuario(nombreUsuario);
                stats.setCantidadCompras(0L);
                stats.setCantidadVentas(0L);
                stats.setCantidadTraspasos(0L);
                stats.setValorCompras(BigDecimal.ZERO);
                stats.setValorVentas(BigDecimal.ZERO);
                estadisticasPorUsuario.put(nombreUsuario, stats);
                System.out.println("DEBUG: Nuevo usuario creado: " + nombreUsuario);
            }

            String tipoMov = movimiento.getTipoMov();
            if (tipoMov != null) {
                System.out.println("DEBUG: Procesando tipo de movimiento: " + tipoMov);

                if ("compra".equalsIgnoreCase(tipoMov) || "entrada".equalsIgnoreCase(tipoMov)) {
                    stats.setCantidadCompras(stats.getCantidadCompras() + 1);
                    System.out.println("DEBUG: Compra registrada para usuario: " + nombreUsuario);

                    // Calcular valor de compras
                    if (movimiento.getDetalles() != null) {
                        for (DetalleMovimientoDTO detalle : movimiento.getDetalles()) {
                            if (detalle.getProducto() != null && detalle.getCantidad() != null &&
                                    detalle.getProducto().getPrecio() != null) {
                                BigDecimal valor = detalle.getProducto().getPrecio().multiply(detalle.getCantidad());
                                stats.setValorCompras(stats.getValorCompras().add(valor));
                                System.out.println("DEBUG: Valor compra agregado: " + valor + " para producto: "
                                        + detalle.getProducto().getNombre());
                            }
                        }
                    }
                } else if ("venta".equalsIgnoreCase(tipoMov) || "salida".equalsIgnoreCase(tipoMov)) {
                    stats.setCantidadVentas(stats.getCantidadVentas() + 1);
                    System.out.println("DEBUG: Venta registrada para usuario: " + nombreUsuario);

                    // Calcular valor de ventas
                    if (movimiento.getDetalles() != null) {
                        for (DetalleMovimientoDTO detalle : movimiento.getDetalles()) {
                            if (detalle.getProducto() != null && detalle.getCantidad() != null &&
                                    detalle.getProducto().getPrecio() != null) {
                                BigDecimal valor = detalle.getProducto().getPrecio().multiply(detalle.getCantidad());
                                stats.setValorVentas(stats.getValorVentas().add(valor));
                                System.out.println("DEBUG: Valor venta agregado: " + valor + " para producto: "
                                        + detalle.getProducto().getNombre());
                            }
                        }
                    }
                } else if ("transferencia".equalsIgnoreCase(tipoMov) || "traspaso".equalsIgnoreCase(tipoMov)) {
                    stats.setCantidadTraspasos(stats.getCantidadTraspasos() + 1);
                    System.out.println("DEBUG: Traspaso registrado para usuario: " + nombreUsuario);
                }
            }
        }

        // Convertir a lista y ordenar por cantidad total de movimientos
        List<DashboardDTO.UsuarioStatsDTO> resultado = estadisticasPorUsuario.values().stream()
                .sorted((u1, u2) -> {
                    long total1 = u1.getCantidadCompras() + u1.getCantidadVentas() + u1.getCantidadTraspasos();
                    long total2 = u2.getCantidadCompras() + u2.getCantidadVentas() + u2.getCantidadTraspasos();
                    return Long.compare(total2, total1); // Orden descendente
                })
                .collect(Collectors.toList());

        System.out.println("DEBUG: Total de usuarios con estadísticas: " + resultado.size());
        for (DashboardDTO.UsuarioStatsDTO usuario : resultado) {
            System.out.println("DEBUG: Usuario " + usuario.getNombreUsuario() + " - Compras: "
                    + usuario.getCantidadCompras() + " - Ventas: " + usuario.getCantidadVentas() + " - Traspasos: "
                    + usuario.getCantidadTraspasos());
        }

        return resultado;
    }
}