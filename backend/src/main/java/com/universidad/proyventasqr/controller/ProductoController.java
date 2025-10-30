package com.universidad.proyventasqr.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.universidad.proyventasqr.dto.ProductoDTO;
import com.universidad.proyventasqr.service.IProductoService;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {
    @Autowired
    private IProductoService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE','PERSONAL')")
    public ResponseEntity<List<ProductoDTO>> obtenerTodosLosProductos() {
        List<ProductoDTO> productos = service.obtenerTodosLosProductos();
        return ResponseEntity.ok(productos);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
    public ResponseEntity<ProductoDTO> crearProducto(@RequestBody ProductoDTO productoDTO) {
        ProductoDTO guardarProd = service.crearProducto(productoDTO);
        return new ResponseEntity<>(guardarProd, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE','PERSONAL')")
    public ResponseEntity<ProductoDTO> obtenerProductoPorId(@PathVariable Long id) {
        ProductoDTO productoDTO = service.obtenerProductoPorId(id);
        return ResponseEntity.ok(productoDTO);
    }

    @GetMapping("/categoria/{catId}")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE','PERSONAL')")
    public ResponseEntity<List<ProductoDTO>> obtenerProductosPorCategoria(@PathVariable Long catId) {
        List<ProductoDTO> productos = service.obtenerProductosPorCategoria(catId);
        return ResponseEntity.ok(productos);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
    public ResponseEntity<ProductoDTO> actualizarProducto(@PathVariable Long id, @RequestBody ProductoDTO productoDTO) {
        ProductoDTO updatedProducto = service.actualizarProducto(id, productoDTO);
        return ResponseEntity.ok(updatedProducto);
    }

    // @DeleteMapping("/{id}")
    // public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
    //     service.eliminarProducto(id);
    //     return ResponseEntity.noContent().build();
    // }
    //Eliminacion logica "inactivo"
    @PutMapping("/del/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        service.eliminarProducto(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/codigo/{codigo}")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE','PERSONAL')")
    public ResponseEntity<ProductoDTO> obtenerProductoPorCodigo(@PathVariable String codigo) {
        ProductoDTO productoDTO = service.obtenerProductoPorCodigo(codigo);
        return ResponseEntity.ok(productoDTO);
    }

    /**
     * Endpoint para obtener el QR de un producto específico
     * @param id ID del producto
     * @return Imagen QR en Base64
     */
    @GetMapping("/{id}/qr")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE','PERSONAL')")
    public ResponseEntity<String> obtenerQRProducto(@PathVariable Long id) {
        ProductoDTO productoDTO = service.obtenerProductoPorId(id);
        String qrCode = productoDTO.getCodigoQr();
        
        if (qrCode == null || qrCode.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_PLAIN)
                .body(qrCode);
    }
      /**
     * Endpoint para obtener el QR de un producto específico como imagen
     * @param id ID del producto
     * @return Imagen QR en formato PNG
     */    @GetMapping("/{id}/qr-imagen")
    // Eliminada la anotación PreAuthorize para permitir acceso público
    public ResponseEntity<byte[]> obtenerImagenQRProducto(@PathVariable Long id) {
        ProductoDTO productoDTO = service.obtenerProductoPorId(id);
        String qrFileName = productoDTO.getCodigoQr();
        
        if (qrFileName == null || qrFileName.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        try {
            // Construir la ruta completa al archivo QR
            Path path;
            if (qrFileName.contains("/") || qrFileName.contains("\\")) {
                // Si ya es una ruta completa
                path = Paths.get(qrFileName);
            } else {
                // Si es solo el nombre del archivo
                path = Paths.get("qrs", qrFileName);
            }
            
            byte[] image = Files.readAllBytes(path);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .body(image);
        } catch (IOException e) {
            System.err.println("Error al leer el archivo QR: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
}
