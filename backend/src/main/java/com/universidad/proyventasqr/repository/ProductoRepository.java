package com.universidad.proyventasqr.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.universidad.proyventasqr.model.Producto;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long>{
    List<Producto> findByCategoriaId(Long catId);
    java.util.Optional<Producto> findByCodigo(String codigo);
}
