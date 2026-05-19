package com.example.avance.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "ramos")
public class Ramo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private Integer semestre;

    @Column(nullable = false)
    private Boolean aprobado = false;

    @Column(name = "nota_decimal")
    private Double nota;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
}