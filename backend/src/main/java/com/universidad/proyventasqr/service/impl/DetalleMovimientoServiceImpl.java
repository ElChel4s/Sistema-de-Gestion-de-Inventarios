package com.universidad.proyventasqr.service.impl;


import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.universidad.proyventasqr.dto.DetalleMovimientoDTO;
import com.universidad.proyventasqr.model.Movimiento;
import com.universidad.proyventasqr.model.Producto;
import com.universidad.proyventasqr.repository.DetalleMovimientoRepository;
import com.universidad.proyventasqr.repository.MovimientoRepository;
import com.universidad.proyventasqr.repository.ProductoRepository;
import com.universidad.proyventasqr.service.IDetalleMovimientoService;

import jakarta.transaction.Transactional;

@Service
public class DetalleMovimientoServiceImpl implements IDetalleMovimientoService{

    @Autowired
    private DetalleMovimientoRepository detalleRepository;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private MovimientoRepository movimientoRepository;
    @Autowired
    private ProductoRepository productoRepository;
    DetalleMovimientoServiceImpl(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    @Override
    public DetalleMovimientoDTO crearDetalleMovimiento(DetalleMovimientoDTO detalleMovimientoDTO) {
        if(detalleMovimientoDTO.getMovimiento() == null || detalleMovimientoDTO.getMovimiento().getId() == null)
            throw new IllegalArgumentException("Debe indicar el movimiento");
        if(detalleMovimientoDTO.getProducto() == null || detalleMovimientoDTO.getProducto().getIdProd() == null)
            throw new IllegalArgumentException("Debe indicar el producto");
        Movimiento movimiento = movimientoRepository.findById(detalleMovimientoDTO.getMovimiento().getId())
            .orElseThrow(() -> new RuntimeException("Movimiento no encontrado"));
        Producto producto = productoRepository.findById(detalleMovimientoDTO.getProducto().getIdProd())
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        com.universidad.proyventasqr.model.DetalleMovimiento detalle = new com.universidad.proyventasqr.model.DetalleMovimiento();
        detalle.setMovimiento(movimiento);
        detalle.setProducto(producto);
        detalle.setCantidad(detalleMovimientoDTO.getCantidad());
        com.universidad.proyventasqr.model.DetalleMovimiento guardado = detalleRepository.save(detalle);
        return modelMapper.map(guardado, DetalleMovimientoDTO.class);
    }
    @Override
    @Transactional
    public List<DetalleMovimientoDTO> obtenerDetallePorMovimiento(Long movId) {
        return detalleRepository.findByMovimientoId(movId).stream().map(detalle -> modelMapper.map(detalle, DetalleMovimientoDTO.class)).collect(Collectors.toList());
    }
    @Override
    public DetalleMovimientoDTO actualizarDetalleMovimiento(Long id, DetalleMovimientoDTO detalleMovimientoDTO) {
        com.universidad.proyventasqr.model.DetalleMovimiento detalle = detalleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Detalle de movimiento no encontrado"));
        if(detalleMovimientoDTO.getCantidad() != null) {
            detalle.setCantidad(detalleMovimientoDTO.getCantidad());
        }
        if(detalleMovimientoDTO.getProducto() != null && detalleMovimientoDTO.getProducto().getIdProd() != null) {
            Producto producto = productoRepository.findById(detalleMovimientoDTO.getProducto().getIdProd())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
            detalle.setProducto(producto);
        }
        com.universidad.proyventasqr.model.DetalleMovimiento actualizado = detalleRepository.save(detalle);
        return modelMapper.map(actualizado, DetalleMovimientoDTO.class);
    }

    @Override
    public void eliminarDetalleMovimiento(Long id) {
        detalleRepository.deleteById(id);
    }

}
