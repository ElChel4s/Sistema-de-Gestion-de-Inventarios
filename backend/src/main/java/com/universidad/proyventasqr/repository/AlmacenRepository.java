package com.universidad.proyventasqr.repository;

import com.universidad.proyventasqr.model.Almacen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlmacenRepository extends JpaRepository<Almacen, Long> {

    /**
     * Buscar almacenes por su estado.
     * 
     * @param estado El estado del almacén (activo, inactivo, etc.).
     * @return Lista de almacenes con el estado especificado.
     */
    List<Almacen> findByEstado(String estado);
}

