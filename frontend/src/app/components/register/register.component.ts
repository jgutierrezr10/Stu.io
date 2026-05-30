import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  nombre = '';
  email = '';
  password = '';
  terminosAceptados = false;
  error = '';
  cargando = false;

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    // Validaciones
    if (!this.nombre.trim()) {
      this.error = 'El nombre es obligatorio';
      return;
    }
    if (!this.email.trim()) {
      this.error = 'El email es obligatorio';
      return;
    }
    if (!this.password || this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }
    if (!this.terminosAceptados) {
      this.error = 'Debes aceptar los términos y condiciones para continuar';
      return;
    }

    this.error = '';
    this.cargando = true;
    this.authService.register({
      nombre: this.nombre.trim(),
      email: this.email.trim(),
      password: this.password
    }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al registrarse';
        this.cargando = false;
      }
    });
  }

  verTerminos() {
    Swal.fire({
      title: 'Términos y Condiciones',
      html: `
        <div style="text-align: left; font-size: 0.95rem; line-height: 1.6;">
          <p><strong>1. Aceptación de los Términos:</strong> Al registrarte en AULA, aceptas regirte por estos términos y condiciones. Si no estás de acuerdo, por favor no utilices la plataforma.</p>
          <p><strong>2. Uso de Datos:</strong> Los datos académicos que ingreses (notas, ramos, horarios) se almacenan de forma segura y se utilizarán únicamente para proporcionarte métricas y herramientas de gestión personal. No venderemos tu información a terceros.</p>
          <p><strong>3. Responsabilidad Académica:</strong> AULA es una herramienta de apoyo no oficial. Siempre debes verificar tu información oficial directamente con el portal de tu universidad. No nos hacemos responsables por discrepancias en tu malla real.</p>
          <p><strong>4. Conducta del Usuario:</strong> Te comprometes a usar la plataforma de manera legal y ética, sin intentar vulnerar la seguridad del sistema ni afectar a otros usuarios.</p>
          <p><strong>5. Modificaciones:</strong> Nos reservamos el derecho de modificar estos términos en cualquier momento. Te notificaremos sobre cambios importantes.</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#6C63FF',
      width: '600px'
    });
  }
}