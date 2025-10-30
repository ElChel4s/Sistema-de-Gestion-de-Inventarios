package com.universidad.proyventasqr.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.universidad.proyventasqr.model.Categoria;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    // Metodo para encontrar una categoria por su nombre 
    Categoria findByNombre(String nombre);

    // Metodo para ordenar las categorias de forma ascendente
    List<Categoria> findAllByOrderByNombreAsc();
}