package com.universidad.proyventasqr.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.universidad.proyventasqr.model.Rol;

@Repository
public interface RolRepository extends JpaRepository<Rol, Integer> {
}
