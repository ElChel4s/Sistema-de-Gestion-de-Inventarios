package com.universidad.proyventasqr.controller;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.universidad.proyventasqr.dto.DetalleMovimientoDTO;
import com.universidad.proyventasqr.dto.MovimientoDTO;
import com.universidad.proyventasqr.dto.ProductoDTO;
import com.universidad.proyventasqr.dto.QRScanRequestDTO;
import com.universidad.proyventasqr.service.IDetalleMovimientoService;
import com.universidad.proyventasqr.service.IProductoService;

@RestController
@RequestMapping("/api/qr")
public class QRController {

    @Autowired
    private IProductoService productoService;

    @Autowired
    private IDetalleMovimientoService detalleMovimientoService;

    /**
     * Procesa un código QR escaneado para obtener información de un producto
     * 
     * @param qrCode El código QR escaneado (puede ser un ID o una URL)
     * @return La información del producto
     */
    @PostMapping("/scan")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE','PERSONAL')")
    public ResponseEntity<ProductoDTO> scanQR(@RequestBody String qrCode) {
        // Extraer el ID del producto del código QR
        Long productoId = extractProductId(qrCode);

        // Obtener el producto
        ProductoDTO producto = productoService.obtenerProductoPorId(productoId);

        return ResponseEntity.ok(producto);
    }

    /**
     * Procesa un código QR escaneado y agrega el producto al movimiento
     * especificado
     * 
     * @param request Datos del escaneo QR y detalles del movimiento
     * @return Los detalles del movimiento creado
     */
    @PostMapping("/add-to-movement")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE','PERSONAL')")
    public ResponseEntity<DetalleMovimientoDTO> addProductToMovimiento(@RequestBody QRScanRequestDTO request) {
        Long productoId = extractProductId(request.getQrCode());
        // Crear el detalle de movimiento usando los objetos completos
        DetalleMovimientoDTO detalleDTO = new DetalleMovimientoDTO();
        ProductoDTO productoDTO = productoService.obtenerProductoPorId(productoId);
        detalleDTO.setProducto(productoDTO);
        MovimientoDTO movimientoDTO = new MovimientoDTO();
        movimientoDTO.setId(request.getMovimientoId());
        detalleDTO.setMovimiento(movimientoDTO);
        detalleDTO.setCantidad(request.getCantidad() != null ? new java.math.BigDecimal(request.getCantidad())
                : java.math.BigDecimal.ONE);
        DetalleMovimientoDTO resultado = detalleMovimientoService.crearDetalleMovimiento(detalleDTO);
        return ResponseEntity.ok(resultado);
    }

    /**
     * Extrae el ID del producto de un código QR
     * 
     * @param qrCode El código QR (puede ser un ID directo o una URL)
     * @return El ID del producto
     */
    private Long extractProductId(String qrCode) {
        // Limpiar el código QR de espacios o caracteres no deseados
        String cleanQR = qrCode.trim();

        try {
            // Patrón para extraer el ID del producto de una URL como "/api/productos/{id}"
            Pattern pattern = Pattern.compile("/api/productos/(\\d+)");
            Matcher matcher = pattern.matcher(cleanQR);

            if (matcher.find()) {
                // Si es una URL, extraer el ID
                return Long.parseLong(matcher.group(1));
            } else if (cleanQR.matches("\\d+")) {
                // Si es solo un número, usarlo directamente como ID
                return Long.parseLong(cleanQR);
            } else {
                throw new IllegalArgumentException("Formato de QR no reconocido: " + qrCode);
            }
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("El código QR no contiene un ID de producto válido: " + qrCode);
        }
    }
}
