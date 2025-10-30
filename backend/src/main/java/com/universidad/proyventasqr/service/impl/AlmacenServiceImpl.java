package com.universidad.proyventasqr.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.universidad.proyventasqr.dto.AlmacenDTO;
import com.universidad.proyventasqr.model.Almacen;
import com.universidad.proyventasqr.model.Usuario;
import com.universidad.proyventasqr.repository.AlmacenRepository;
import com.universidad.proyventasqr.service.IAlmacenService;


@Service
public class AlmacenServiceImpl implements IAlmacenService {

    private final AlmacenRepository almacenRepository;

    @Autowired
    public AlmacenServiceImpl(AlmacenRepository almacenRepository) {
        this.almacenRepository = almacenRepository;
    }

    @Override
    public List<AlmacenDTO> obtenerTodosLosAlmacenes() {
        return almacenRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AlmacenDTO crearAlmacen(AlmacenDTO almacenDTO) {
        Almacen almacen = new Almacen();
        almacen.setNombre(almacenDTO.getNombre());
        almacen.setUbicacion(almacenDTO.getUbicacion());
        almacen.setCapacidad(almacenDTO.getCapacidad());
        almacen.setEstado(almacenDTO.getEstado());
        if (almacenDTO.getResponsable() != null && almacenDTO.getResponsable().getId() != null) {
            Usuario responsable = new Usuario();
            responsable.setId(almacenDTO.getResponsable().getId());
            almacen.setResponsable(responsable);
        } else {
            almacen.setResponsable(null);
        }
        Almacen almacenGuardado = almacenRepository.save(almacen);
        return convertToDTO(almacenGuardado);
    }

    @Override
    public AlmacenDTO actualizarAlmacen(Long id, AlmacenDTO almacenDTO) {
        Almacen almacenExistente = almacenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Almacén no encontrado"));
        almacenExistente.setNombre(almacenDTO.getNombre());
        almacenExistente.setUbicacion(almacenDTO.getUbicacion());
        almacenExistente.setCapacidad(almacenDTO.getCapacidad());
        almacenExistente.setEstado(almacenDTO.getEstado());
        if (almacenDTO.getResponsable() != null && almacenDTO.getResponsable().getId() != null) {
            Usuario responsable = new Usuario();
            responsable.setId(almacenDTO.getResponsable().getId());
            almacenExistente.setResponsable(responsable);
        } else {
            almacenExistente.setResponsable(null);
        }
        Almacen almacenActualizado = almacenRepository.save(almacenExistente);
        return convertToDTO(almacenActualizado);
    }

    @Override
    public void eliminarLogico(Long id) {
        Almacen almacen = almacenRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Almacén no encontrado"));
        almacen.setEstado("eliminado");
        almacenRepository.save(almacen);
    }

    @Override
    public void bajaAlmacen(Long id, String motivoBaja) {
        Almacen almacen = almacenRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Almacén no encontrado"));
        almacen.setEstado("baja: " + motivoBaja);
        almacenRepository.save(almacen);
    }

    @Override
    public List<AlmacenDTO> obtenerAlmacenesPorEstado(String estado) {
        return almacenRepository.findByEstado(estado).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void eliminarAlmacen(Long id) {
        almacenRepository.deleteById(id);
    }

    // Método auxiliar para convertir entidad a DTO
    private AlmacenDTO convertToDTO(Almacen almacen) {
        return AlmacenDTO.builder()
                .idAlm(almacen.getId())
                .nombre(almacen.getNombre())
                .ubicacion(almacen.getUbicacion())
                .capacidad(almacen.getCapacidad())
                .estado(almacen.getEstado())
                .responsable(almacen.getResponsable() != null ?
                    com.universidad.proyventasqr.dto.UsuarioDTO.builder()
                        .id(almacen.getResponsable().getId())
                        .nombreUsuario(almacen.getResponsable().getNombreUsuario())
                        .rol(almacen.getResponsable().getRol() != null ?
                            com.universidad.proyventasqr.dto.RolDTO.builder()
                                .id(almacen.getResponsable().getRol().getId())
                                .nombre(almacen.getResponsable().getRol().getNombre())
                                .descripcion(almacen.getResponsable().getRol().getDescripcion())
                                .build() : null)
                        .build() : null)
                .build();
    }

    // Método auxiliar para convertir DTO a entidad
    private Almacen convertToEntity(AlmacenDTO almacenDTO) {
        Almacen almacen = new Almacen();
        almacen.setId(almacenDTO.getIdAlm());
        almacen.setNombre(almacenDTO.getNombre());
        almacen.setUbicacion(almacenDTO.getUbicacion());
        almacen.setCapacidad(almacenDTO.getCapacidad());
        almacen.setEstado(almacenDTO.getEstado());
        if (almacenDTO.getResponsable() != null && almacenDTO.getResponsable().getId() != null) {
            Usuario responsable = new Usuario();
            responsable.setId(almacenDTO.getResponsable().getId());
            almacen.setResponsable(responsable);
        }
        return almacen;
    }
}
