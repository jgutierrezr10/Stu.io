package com.example.avance.service;

import com.example.avance.model.Ramo;
import com.example.avance.model.Usuario;
import com.example.avance.repository.RamoRepository;
import com.example.avance.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RamoService {

    private final RamoRepository ramoRepository;
    private final UsuarioRepository usuarioRepository;

    public List<Ramo> getRamosByUsuario(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return ramoRepository.findByUsuarioId(usuario.getId());
    }

    public Ramo crearRamo(Ramo ramo, String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        ramo.setUsuario(usuario);
        return ramoRepository.save(ramo);
    }

    public Ramo actualizarRamo(Long id, Ramo ramoActualizado, String email) {
        Ramo ramo = ramoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ramo no encontrado"));

        if (!ramo.getUsuario().getEmail().equals(email)) {
            throw new RuntimeException("No autorizado");
        }

        ramo.setNombre(ramoActualizado.getNombre());
        ramo.setSemestre(ramoActualizado.getSemestre());
        ramo.setAprobado(ramoActualizado.getAprobado());
        ramo.setNota(ramoActualizado.getNota());

        return ramoRepository.save(ramo);
    }

    public void eliminarRamo(Long id, String email) {
        Ramo ramo = ramoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ramo no encontrado"));

        if (!ramo.getUsuario().getEmail().equals(email)) {
            throw new RuntimeException("No autorizado");
        }

        ramoRepository.delete(ramo);
    }

    public int calcularPorcentajeAvance(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        long total = ramoRepository.findByUsuarioId(usuario.getId()).size();
        if (total == 0) return 0;

        long aprobados = ramoRepository.countByUsuarioIdAndAprobadoTrue(usuario.getId());
        return (int) ((aprobados * 100) / total);
    }
}