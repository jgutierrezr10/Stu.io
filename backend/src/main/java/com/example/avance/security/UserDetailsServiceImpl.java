package com.example.avance.security;

import com.example.avance.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return usuarioRepository.findByEmail(email)
                .map(u -> org.springframework.security.core.userdetails.User
                        .withUsername(u.getEmail())
                        .password(u.getPassword())
                        .authorities("USER")
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));
    }
}