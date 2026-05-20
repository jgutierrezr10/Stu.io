package com.example.avance.service;

import com.example.avance.dto.*;
import com.example.avance.model.Usuario;
import com.example.avance.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));

        usuarioRepository.save(usuario);

        String token = jwtService.generateToken(usuario.getEmail());
        return new AuthResponse(token, usuario.getNombre(), usuario.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        // Buscar por email o por nombre
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .or(() -> usuarioRepository.findByNombre(request.getEmail()))
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        String token = jwtService.generateToken(usuario.getEmail());
        return new AuthResponse(token, usuario.getNombre(), usuario.getEmail());
    }

    public AuthResponse actualizarCuenta(UpdateUserRequest request, String currentEmail) {
        Usuario usuario = usuarioRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Validar contraseña actual si se quiere cambiar la contraseña o el email
        if (request.getCurrentPassword() != null && !request.getCurrentPassword().isEmpty()) {
            if (!passwordEncoder.matches(request.getCurrentPassword(), usuario.getPassword())) {
                throw new RuntimeException("Contraseña actual incorrecta");
            }
            if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
                usuario.setPassword(passwordEncoder.encode(request.getNewPassword()));
            }
        } else if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
            throw new RuntimeException("Debe ingresar su contraseña actual para establecer una nueva");
        }

        if (request.getNombre() != null && !request.getNombre().isEmpty()) {
            usuario.setNombre(request.getNombre());
        }

        if (request.getEmail() != null && !request.getEmail().isEmpty() && !request.getEmail().equalsIgnoreCase(currentEmail)) {
            if (usuarioRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("El nuevo email ya está registrado");
            }
            usuario.setEmail(request.getEmail());
        }

        usuarioRepository.save(usuario);

        String nuevoToken = jwtService.generateToken(usuario.getEmail());
        return new AuthResponse(nuevoToken, usuario.getNombre(), usuario.getEmail());
    }
}