package com.universidad.proyventasqr.service;
import com.universidad.proyventasqr.dto.AlmacenDTO;

import java.util.List;

public interface IAlmacenService {

    /**
     * Obtiene todos los almacenes.
     * 
     * @return Lista de AlmacenDTO.
     */
    List<AlmacenDTO> obtenerTodosLosAlmacenes();

    /**
     * Crea un nuevo almacén.
     * 
     * @param almacenDTO DTO del almacén a crear.
     * @return AlmacenDTO creado.
     */
    AlmacenDTO crearAlmacen(AlmacenDTO almacenDTO);

    /**
     * Actualiza un almacén existente.
     * 
     * @param id         ID del almacén a actualizar.
     * @param almacenDTO DTO del almacén con los nuevos datos.
     * @return AlmacenDTO actualizado.
     *
     * @throws RuntimeException si el almacén no se encuentra.
     */
    AlmacenDTO actualizarAlmacen(Long id, AlmacenDTO almacenDTO);

    /**
     * Elimina un almacén por su ID.
     * 
     * @param id ID del almacén a eliminar.
     */
    void eliminarAlmacen(Long id);

    /**
     * Elimina lógicamente un almacén por su ID (cambia su estado a inactivo, por
     * ejemplo).
     * 
     * @param id ID del almacén a eliminar lógicamente.
     */
    void eliminarLogico(Long id);

    /**
     * Obtiene almacenes filtrados por su estado (activo, inactivo, etc.).
     * 
     * @param estado Estado de los almacenes a obtener (por ejemplo, 'activo',
     *               'inactivo').
     * @return Lista de AlmacenDTO filtrados por estado.
     */
    List<AlmacenDTO> obtenerAlmacenesPorEstado(String estado);

    /**
     * Baja lógica de un almacén con motivo.
     *
     * @param id         ID del almacén a dar de baja.
     * @param motivoBaja Motivo de la baja lógica.
     */
    void bajaAlmacen(Long id, String motivoBaja);
}

