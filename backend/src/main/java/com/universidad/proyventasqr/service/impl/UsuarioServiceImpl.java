package com.universidad.proyventasqr.service.impl;

import com.universidad.proyventasqr.dto.RolDTO;
import com.universidad.proyventasqr.dto.UsuarioDTO;
import com.universidad.proyventasqr.model.Rol;
import com.universidad.proyventasqr.model.Usuario;
import com.universidad.proyventasqr.repository.RolRepository;
import com.universidad.proyventasqr.repository.UsuarioRepository;
import com.universidad.proyventasqr.service.IUsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsuarioServiceImpl implements IUsuarioService {
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private RolRepository rolRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public List<UsuarioDTO> obtenerTodos() {
        return usuarioRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public UsuarioDTO obtenerPorId(Integer id) {
        Usuario usuario = usuarioRepository.findById(id).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return convertToDTO(usuario);
    }

    @Override
    public UsuarioDTO crear(UsuarioDTO usuarioDTO) {
        if(usuarioRepository.existsByNombreUsuario(usuarioDTO.getNombreUsuario()))
            throw new RuntimeException("El nombre de usuario ya existe");
        Usuario usuario = convertToEntity(usuarioDTO);
        usuario.setClaveHash(passwordEncoder.encode(usuarioDTO.getClaveHash()));
        usuario.setCreadoEn(LocalDateTime.now());
        Usuario guardado = usuarioRepository.save(usuario);
        return convertToDTO(guardado);
    }

    @Override
    public UsuarioDTO actualizar(Integer id, UsuarioDTO usuarioDTO) {
        Usuario usuario = usuarioRepository.findById(id).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.setNombreUsuario(usuarioDTO.getNombreUsuario());
        if (!usuarioDTO.getClaveHash().equals(usuario.getClaveHash())) {
            usuario.setClaveHash(passwordEncoder.encode(usuarioDTO.getClaveHash()));
        }
        if(usuarioDTO.getRol() != null && usuarioDTO.getRol().getId() != null) {
            Rol rol = rolRepository.findById(usuarioDTO.getRol().getId()).orElseThrow(() -> new RuntimeException("Rol no encontrado"));
            usuario.setRol(rol);
        }
        Usuario actualizado = usuarioRepository.save(usuario);
        return convertToDTO(actualizado);
    }

    @Override
    public void eliminar(Integer id) {
        usuarioRepository.deleteById(id);
    }

    private UsuarioDTO convertToDTO(Usuario usuario) {
        Rol rol = usuario.getRol();
        RolDTO rolDTO = rol != null ? RolDTO.builder().id(rol.getId()).nombre(rol.getNombre()).descripcion(rol.getDescripcion()).build() : null;
        return UsuarioDTO.builder()
                .id(usuario.getId())
                .nombreUsuario(usuario.getNombreUsuario())
                .claveHash(usuario.getClaveHash())
                .rol(rolDTO)
                .creadoEn(usuario.getCreadoEn())
                .build();
    }

    private Usuario convertToEntity(UsuarioDTO dto) {
        Usuario usuario = new Usuario();
        usuario.setId(dto.getId());
        usuario.setNombreUsuario(dto.getNombreUsuario());
        usuario.setClaveHash(dto.getClaveHash());
        if(dto.getRol() != null && dto.getRol().getId() != null) {
            Rol rol = rolRepository.findById(dto.getRol().getId()).orElseThrow(() -> new RuntimeException("Rol no encontrado"));
            usuario.setRol(rol);
        }
        usuario.setCreadoEn(dto.getCreadoEn());
        return usuario;
    }
}
