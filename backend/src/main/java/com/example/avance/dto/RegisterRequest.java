package com.example.avance.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String nombre;
    private String email;
    private String password;
}