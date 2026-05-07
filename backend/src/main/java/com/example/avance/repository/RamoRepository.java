package com.example.avance.repository;

import com.example.avance.model.Ramo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RamoRepository extends JpaRepository<Ramo, Long> {
    List<Ramo> findByUsuarioId(Long usuarioId);
    long countByUsuarioIdAndAprobadoTrue(Long usuarioId);
}