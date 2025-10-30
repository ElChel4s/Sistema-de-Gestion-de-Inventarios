package com.universidad.proyventasqr.service.impl;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.universidad.proyventasqr.dto.AlmacenDTO;
import com.universidad.proyventasqr.dto.InventarioDTO;
import com.universidad.proyventasqr.dto.ProductoDTO;
import com.universidad.proyventasqr.model.Almacen;
import com.universidad.proyventasqr.model.Inventario;
import com.universidad.proyventasqr.model.Producto;
import com.universidad.proyventasqr.repository.AlmacenRepository;
import com.universidad.proyventasqr.repository.InventarioRepository;
import com.universidad.proyventasqr.repository.ProductoRepository;
import com.universidad.proyventasqr.service.IInventarioService;

@Service
public class InventarioServiceImpl implements IInventarioService {
    private final InventarioRepository inventarioRepository;
    private final AlmacenRepository almacenRepository;
    private final ProductoRepository productoRepository;

    public InventarioServiceImpl(InventarioRepository inventarioRepository, AlmacenRepository almacenRepository, ProductoRepository productoRepository) {
        this.inventarioRepository = inventarioRepository;
        this.almacenRepository = almacenRepository;
        this.productoRepository = productoRepository;
    }

    @Override
    public List<InventarioDTO> obtenerTodosLosInventarios() {
        return inventarioRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public InventarioDTO crearInventario(InventarioDTO inventarioDTO) {
        Producto producto = productoRepository.findById(inventarioDTO.getProducto().getIdProd())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        Almacen almacen = almacenRepository.findById(inventarioDTO.getAlmacen().getIdAlm())
                .orElseThrow(() -> new RuntimeException("Almacén no encontrado"));
        Inventario inventario = convertToEntity(inventarioDTO, producto, almacen);
        Inventario guardado = inventarioRepository.save(inventario);
        return convertToDTO(guardado);
    }

    @Override
    public InventarioDTO actualizarInventario(Integer id, InventarioDTO inventarioDTO) {
        Inventario existente = inventarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventario no encontrado"));
        Producto producto = productoRepository.findById(inventarioDTO.getProducto().getIdProd())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        Almacen almacen = almacenRepository.findById(inventarioDTO.getAlmacen().getIdAlm())
                .orElseThrow(() -> new RuntimeException("Almacén no encontrado"));
        existente.setProducto(producto);
        existente.setAlmacen(almacen);
        existente.setCantidad(inventarioDTO.getCantidad());
        existente.setActualizadoEn(inventarioDTO.getActualizadoEn());
        Inventario actualizado = inventarioRepository.save(existente);
        return convertToDTO(actualizado);
    }

    @Override
    public void eliminarInventario(Integer id) {
        inventarioRepository.deleteById(id);
    }

    @Override
    public List<InventarioDTO> obtenerInventariosPorAlmacen(Long almacenId) {
        return inventarioRepository.findByAlmacen_Id(almacenId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<InventarioDTO> obtenerInventariosPorProducto(Integer productoId) {
        return inventarioRepository.findByProducto_IdProd(productoId.longValue()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void eliminarLogico(Integer id) {
        Inventario inventario = inventarioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Inventario no encontrado"));
        inventario.setCantidad(BigDecimal.ZERO); // Solo poner cantidad en cero como eliminación lógica
        inventarioRepository.save(inventario);
    }

    private InventarioDTO convertToDTO(Inventario inventario) {
        Producto producto = inventario.getProducto();
        Almacen almacen = inventario.getAlmacen();
        ProductoDTO productoDTO = producto != null ? ProductoDTO.builder()
                .idProd(producto.getIdProd())
                .nombre(producto.getNombre())
                .precio(producto.getPrecio())
                .stock(producto.getStock())
                .estado(producto.getEstado())
                .codigoQr(producto.getCodigoQr())
                .codigo(producto.getCodigo())
                .descripcion(producto.getDescripcion())
                .stockMinimo(producto.getStockMinimo())
                .creadoEn(producto.getCreadoEn())
                .categoria(producto.getCategoria() != null ? com.universidad.proyventasqr.dto.CategoriaDTO.builder().id(producto.getCategoria().getId()).nombre(producto.getCategoria().getNombre()).descripcion(producto.getCategoria().getDescripcion()).build() : null)
                .build() : null;
        AlmacenDTO almacenDTO = almacen != null ? AlmacenDTO.builder()
                .idAlm(almacen.getId())
                .nombre(almacen.getNombre())
                .ubicacion(almacen.getUbicacion())
                .capacidad(almacen.getCapacidad())
                .estado(almacen.getEstado())
                .responsable(almacen.getResponsable() != null ? com.universidad.proyventasqr.dto.UsuarioDTO.builder().id(almacen.getResponsable().getId()).nombreUsuario(almacen.getResponsable().getNombreUsuario()).rol(almacen.getResponsable().getRol() != null ? com.universidad.proyventasqr.dto.RolDTO.builder().id(almacen.getResponsable().getRol().getId()).nombre(almacen.getResponsable().getRol().getNombre()).descripcion(almacen.getResponsable().getRol().getDescripcion()).build() : null).build() : null)
                .build() : null;
        return InventarioDTO.builder()
                .id(inventario.getId())
                .producto(productoDTO)
                .almacen(almacenDTO)
                .cantidad(inventario.getCantidad())
                .actualizadoEn(inventario.getActualizadoEn())
                .build();
    }

    private Inventario convertToEntity(InventarioDTO dto, Producto producto, Almacen almacen) {
        return Inventario.builder()
                .id(dto.getId())
                .producto(producto)
                .almacen(almacen)
                .cantidad(dto.getCantidad())
                .actualizadoEn(dto.getActualizadoEn())
                .build();
    }
}
