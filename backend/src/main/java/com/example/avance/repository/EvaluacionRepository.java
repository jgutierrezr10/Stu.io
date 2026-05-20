package com.example.avance.repository;

import com.example.avance.model.Evaluacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluacionRepository extends JpaRepository<Evaluacion, Long> {
    List<Evaluacion> findByRamoId(Long ramoId);
    List<Evaluacion> findByRamoUsuarioIdOrderByFechaAsc(Long usuarioId);
    List<Evaluacion> findByRamoUsuarioEmailOrderByFechaAsc(String email);
}
