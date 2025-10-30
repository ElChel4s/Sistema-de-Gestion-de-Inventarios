package com.universidad.proyventasqr.service.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.universidad.proyventasqr.dto.CategoriaDTO;
import com.universidad.proyventasqr.model.Categoria;
import com.universidad.proyventasqr.repository.CategoriaRepository;
import com.universidad.proyventasqr.service.ICategoriaService;

@Service
public class CategoriaServiceImpl implements ICategoriaService {
    
    @Autowired
    private CategoriaRepository categoriaRepository;

    public CategoriaServiceImpl(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @Override
    public List<CategoriaDTO> obtenerTodasLasCategorias() {
        return categoriaRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CategoriaDTO crearCategoria(CategoriaDTO categoriaDTO) {
        Categoria categoria = convertToEntity(categoriaDTO);
        categoria.setFecha_alta(java.time.LocalDate.now());
        categoria.setEstado("ACTIVO");
        Categoria categoriaGuardado = categoriaRepository.save(categoria);
        return convertToDTO(categoriaGuardado);
    }

    @Override
    public CategoriaDTO actualizarCategoria(Long id, CategoriaDTO categoriaDTO) {
        Categoria categoriaExiste = categoriaRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Categoria no encontrada"));
        categoriaExiste.setNombre(categoriaDTO.getNombre());
        categoriaExiste.setDescripcion(categoriaDTO.getDescripcion());
        // No sobrescribir estado ni fecha_alta
        Categoria categoriaActualizado = categoriaRepository.save(categoriaExiste);
        return convertToDTO(categoriaActualizado);
    }

    // Método para eliminar (de manera lógica) una categoria por su ID
    @Override
    public CategoriaDTO eliminarCategoria(Long id, CategoriaDTO categoriaDTO) {
        Categoria categoriaExiste = categoriaRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Categoria no encontrada"));
        categoriaExiste.setEstado("INACTIVO");
        categoriaExiste.setFecha_baja(java.time.LocalDate.now());
        categoriaExiste.setMotivoBaja(categoriaDTO.getMotivoBaja());

        Categoria categoriaInactivo = categoriaRepository.save(categoriaExiste);
        return convertToDTO(categoriaInactivo);
    }
    /* metodo para eliminar el registro permanentemente
    @Override
    public void eliminarCategoria(Long id) {
        categoriaRepository.deleteById(id);
    }*/

    @Override
    public CategoriaDTO obtenerCategoriaPorNombre(String nombreCategoria) {
        Categoria categoria = categoriaRepository.findByNombre(nombreCategoria);
        return convertToDTO(categoria);
    }

    @Override
    public List<CategoriaDTO> obtenerCategoriaAsc() {
        return categoriaRepository.findAllByOrderByNombreAsc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public CategoriaDTO obtenerCategoriaPorId(long id){
        return categoriaRepository.findById(id)
                .map(categoria -> CategoriaDTO.builder()
                        .id(categoria.getId())
                        .nombre(categoria.getNombre())
                        .descripcion(categoria.getDescripcion())
                        .estado(categoria.getEstado())
                        .fechaAlta(categoria.getFecha_alta())
                        .fechaBaja(categoria.getFecha_baja())
                        .motivoBaja(categoria.getMotivoBaja())
                        .build())
                .orElse(null);      
    }
    // Método auxiliar para convertir entidad a DTO
    public CategoriaDTO convertToDTO(Categoria categoria) {
        return CategoriaDTO.builder()
                .id(categoria.getId())
                .nombre(categoria.getNombre())
                .descripcion(categoria.getDescripcion())
                .estado(categoria.getEstado())
                .fechaBaja(categoria.getFecha_baja())
                .fechaAlta(categoria.getFecha_alta())
                .motivoBaja(categoria.getMotivoBaja())
                .build();
    }
    // Método auxiliar para convertir DTO a entidad
    private Categoria convertToEntity(CategoriaDTO categoriaDTO) {
        return Categoria.builder()
                .id(categoriaDTO.getId())
                .nombre(categoriaDTO.getNombre())
                .descripcion(categoriaDTO.getDescripcion())
                // No asignar estado ni fecha_alta aquí, se hace en crearCategoria
                .fecha_baja(categoriaDTO.getFechaBaja())
                .motivoBaja(categoriaDTO.getMotivoBaja())
                .build();
    }
     
}