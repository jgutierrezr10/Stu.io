import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  nombreUsuario: string = '';
  mostrarModalCuenta: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      this.nombreUsuario = JSON.parse(usuarioStr).nombre;
    }
  }

  abrirMiCuenta() {
    this.mostrarModalCuenta = true;
  }

  cerrarMiCuenta() {
    this.mostrarModalCuenta = false;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}
