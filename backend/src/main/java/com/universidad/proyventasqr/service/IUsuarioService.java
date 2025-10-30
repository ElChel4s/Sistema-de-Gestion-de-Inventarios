package com.universidad.proyventasqr.service;

import com.universidad.proyventasqr.dto.UsuarioDTO;
import java.util.List;

public interface IUsuarioService {
    List<UsuarioDTO> obtenerTodos();
    UsuarioDTO obtenerPorId(Integer id);
    UsuarioDTO crear(UsuarioDTO usuarioDTO);
    UsuarioDTO actualizar(Integer id, UsuarioDTO usuarioDTO);
    void eliminar(Integer id);
}
