package com.example.avance.controller;

import com.example.avance.dto.EvaluacionDTO;
import com.example.avance.service.EvaluacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evaluaciones")
@RequiredArgsConstructor
public class EvaluacionController {

    private final EvaluacionService evaluacionService;

    @GetMapping
    public ResponseEntity<List<EvaluacionDTO>> getEvaluaciones(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(evaluacionService.getEvaluacionesByUsuario(userDetails.getUsername()));
    }

    @GetMapping("/ramo/{ramoId}")
    public ResponseEntity<List<EvaluacionDTO>> getEvaluacionesByRamo(
            @PathVariable Long ramoId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(evaluacionService.getEvaluacionesByRamo(ramoId, userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<EvaluacionDTO> crearEvaluacion(
            @RequestBody EvaluacionDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(evaluacionService.crearEvaluacion(dto, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EvaluacionDTO> actualizarEvaluacion(
            @PathVariable Long id,
            @RequestBody EvaluacionDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(evaluacionService.actualizarEvaluacion(id, dto, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarEvaluacion(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        evaluacionService.eliminarEvaluacion(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
