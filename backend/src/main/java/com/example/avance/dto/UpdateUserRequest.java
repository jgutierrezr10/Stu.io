package com.example.avance.dto;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private String nombre;
    private String email;
    private String currentPassword;
    private String newPassword;
}
