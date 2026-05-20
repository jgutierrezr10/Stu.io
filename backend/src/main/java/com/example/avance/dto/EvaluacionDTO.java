package com.example.avance.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class EvaluacionDTO {
    private Long id;
    private String nombre;
    private Double nota;
    private Double ponderacion;
    private LocalDate fecha;
    private Long ramoId;
    private String ramoNombre;
}
