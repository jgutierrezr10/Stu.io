package com.example.avance.controller;

import com.example.avance.model.Ramo;
import com.example.avance.service.RamoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ramos")
@RequiredArgsConstructor
public class RamoController {

    private final RamoService ramoService;

    @GetMapping
    public ResponseEntity<List<Ramo>> getRamos(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ramoService.getRamosByUsuario(userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<Ramo> crearRamo(@RequestBody Ramo ramo,
                                          @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ramoService.crearRamo(ramo, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ramo> actualizarRamo(@PathVariable Long id,
                                               @RequestBody Ramo ramo,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ramoService.actualizarRamo(id, ramo, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarRamo(@PathVariable Long id,
                                             @AuthenticationPrincipal UserDetails userDetails) {
        ramoService.eliminarRamo(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/avance")
    public ResponseEntity<Map<String, Integer>> getAvance(
            @AuthenticationPrincipal UserDetails userDetails) {
        int porcentaje = ramoService.calcularPorcentajeAvance(userDetails.getUsername());
        return ResponseEntity.ok(Map.of("porcentaje", porcentaje));
    }
}