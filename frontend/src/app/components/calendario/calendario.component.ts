import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Navbar } from '../shared/navbar/navbar';
import { RamoService } from '../../services/ramo.service';
import { EvaluacionService } from '../../services/evaluacion.service';
import { Ramo } from '../../models/ramo.model';
import { Evaluacion } from '../../models/evaluacion.model';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Navbar],
  templateUrl: './calendario.component.html',
  styleUrl: './calendario.component.css'
})
export class CalendarioComponent implements OnInit {
  ramos: Ramo[] = [];
  evaluaciones: Evaluacion[] = [];

  // Filtros
  ramoSeleccionado: number = 0; // 0 significa "Todos"
  filtroTemporal: 'todas' | 'proximas' | 'pasadas' | 'sin_fecha' = 'proximas';

  // Edición rápida de fecha
  editandoEvId: number | null = null;
  fechaEdicion: string = '';

  loading = true;
  todayStr = '';

  constructor(
    private ramoService: RamoService,
    private evaluacionService: EvaluacionService
  ) {
    // Obtener hoy en formato YYYY-MM-DD en hora local
    const hoy = new Date();
    const tzOffset = hoy.getTimezoneOffset() * 60000; // offset en ms
    this.todayStr = (new Date(hoy.getTime() - tzOffset)).toISOString().split('T')[0];
  }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading = true;
    this.ramoService.getRamos().subscribe({
      next: (ramos) => {
        this.ramos = ramos;
        this.cargarEvaluaciones();
      },
      error: (err) => {
        console.error('Error al cargar ramos', err);
        this.loading = false;
      }
    });
  }

  cargarEvaluaciones() {
    this.evaluacionService.getEvaluaciones().subscribe({
      next: (evs) => {
        this.evaluaciones = evs;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar evaluaciones', err);
        this.loading = false;
      }
    });
  }

  getEvaluacionesFiltradas(): Evaluacion[] {
    let filtradas = this.evaluaciones;

    // Filtro por ramo
    if (this.ramoSeleccionado !== 0) {
      filtradas = filtradas.filter(ev => ev.ramoId === this.ramoSeleccionado);
    }

    // Filtro por fecha (próximas, pasadas, sin fecha)
    if (this.filtroTemporal === 'proximas') {
      filtradas = filtradas.filter(ev => ev.fecha && ev.fecha >= this.todayStr);
      // Ordenar por fecha ascendente (lo más cercano primero)
      filtradas.sort((a, b) => (a.fecha! > b.fecha! ? 1 : -1));
    } else if (this.filtroTemporal === 'pasadas') {
      filtradas = filtradas.filter(ev => ev.fecha && ev.fecha < this.todayStr);
      // Ordenar por fecha descendente (lo más reciente primero)
      filtradas.sort((a, b) => (a.fecha! < b.fecha! ? 1 : -1));
    } else if (this.filtroTemporal === 'sin_fecha') {
      filtradas = filtradas.filter(ev => !ev.fecha);
    } else {
      // Todas. Ordenar por fecha (con nulos al final)
      filtradas.sort((a, b) => {
        if (!a.fecha) return 1;
        if (!b.fecha) return -1;
        return a.fecha > b.fecha ? 1 : -1;
      });
    }

    return filtradas;
  }

  iniciarEdicionFecha(ev: Evaluacion) {
    if (ev.id) {
      this.editandoEvId = ev.id;
      this.fechaEdicion = ev.fecha || '';
    }
  }

  guardarFechaEdicion(ev: Evaluacion) {
    const updatedEv = { ...ev, fecha: this.fechaEdicion || undefined };
    if (ev.id) {
      this.evaluacionService.actualizarEvaluacion(ev.id, updatedEv).subscribe({
        next: () => {
          this.editandoEvId = null;
          this.cargarEvaluaciones();
        },
        error: (err) => {
          console.error('Error al actualizar fecha', err);
          alert('No se pudo guardar la fecha. Inténtalo de nuevo.');
        }
      });
    }
  }

  cancelarEdicion() {
    this.editandoEvId = null;
  }

  getUpcomingCount(): number {
    return this.evaluaciones.filter(ev => ev.fecha && ev.fecha >= this.todayStr).length;
  }

  getUnscheduledCount(): number {
    return this.evaluaciones.filter(ev => !ev.fecha).length;
  }
}
