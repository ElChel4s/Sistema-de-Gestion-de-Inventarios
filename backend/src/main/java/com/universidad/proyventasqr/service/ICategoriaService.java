package com.universidad.proyventasqr.service;

import java.util.List;

import com.universidad.proyventasqr.dto.CategoriaDTO;

public interface ICategoriaService {

    /**
     * Obtiene todas las categorias
     * @return Lista de CategoriasDTO
     */
    List<CategoriaDTO> obtenerTodasLasCategorias();

    /**
     * Crea una nueva categoria.
     * @param categoriaDTO DTO de la categoria a crear.
     * @return CategoriaDTO creado
     */
    CategoriaDTO crearCategoria(CategoriaDTO categoriaDTO);

    /**
     * Actualiza una categoria existente.
     * @param id ID de la categoria a actualizar.
     * @param categoriaDTO DTO de la categoria con los nuevos datos.
     * @return CategoriaDTO actualizado.
     *
     * @throws RuntimeException si la categoria no se encuentra.
     */
    CategoriaDTO actualizarCategoria(Long id, CategoriaDTO categoriaDTO);

    /**
     * Elimina una categoria por su ID.
     * @param id  ID de la categoria a eliminar.
     */
    //void eliminarCategoria(Long id);
    // Método para eliminar (de manera logica) una categoria por su ID
    CategoriaDTO eliminarCategoria(Long id, CategoriaDTO categoriaDTO);

    /**
     * Obtiene una categoria por su nombre 
     * @param nombre
     * @return 
     */
    CategoriaDTO obtenerCategoriaPorNombre(String nombreCategoria);

    /**
     * Obtiene todas las categorias ordenadas de forma ascendente
     * @return Lista de CategoriasDTO
     */
    List<CategoriaDTO> obtenerCategoriaAsc();

    /**
     * Obtiene un estudiante por su ID con bloqueo pesimista.
     * @param id ID del estudiante a obtener.
     * @return
     */
    CategoriaDTO obtenerCategoriaPorId(long id);
}