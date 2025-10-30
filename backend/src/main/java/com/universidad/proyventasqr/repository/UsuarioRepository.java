package com.universidad.proyventasqr.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.universidad.proyventasqr.model.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    boolean existsByNombreUsuario(String nombreUsuario);
    Optional<Usuario> findByNombreUsuario(String nombreUsuario);
}
