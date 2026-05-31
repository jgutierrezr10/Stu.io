import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Navbar } from '../shared/navbar/navbar';
import { RamoService } from '../../services/ramo.service';
import { EvaluacionService } from '../../services/evaluacion.service';
import { Ramo } from '../../models/ramo.model';
import { Evaluacion } from '../../models/evaluacion.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-notas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Navbar],
  templateUrl: './notas.component.html',
  styleUrl: './notas.component.css'
})
export class NotasComponent implements OnInit {
  ramos: Ramo[] = [];
  evaluaciones: Evaluacion[] = [];
  evaluacionesPorRamo: { [ramoId: number]: Evaluacion[] } = {};

  // Filtros
  semestreSeleccionado: number = 0; // 0 significa "Todos"
  soloCursando: boolean = true; // Por defecto mostrar solo cursando

  // Formulario de edición/creación temporal por ramo
  nuevaEv: { [ramoId: number]: Partial<Evaluacion> } = {};

  // Mensajes de error/alerta por ramo
  errorMsg: { [ramoId: number]: string } = {};

  loading = true;

  constructor(
    private ramoService: RamoService,
    private evaluacionService: EvaluacionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading = true;
    this.ramoService.getRamos().subscribe({
      next: (ramos) => {
        this.ramos = ramos;
        this.inicializarNuevasEvs();
        this.cargarEvaluaciones();
      },
      error: (err) => {
        console.error('Error al cargar ramos', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarEvaluaciones() {
    this.evaluacionService.getEvaluaciones().subscribe({
      next: (evs) => {
        this.evaluaciones = evs;
        this.agruparEvaluaciones();
        this.crearEvaluacionesPorDefecto();
      },
      error: (err) => {
        console.error('Error al cargar evaluaciones', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  inicializarNuevasEvs() {
    this.ramos.forEach(ramo => {
      if (ramo.id) {
        this.nuevaEv[ramo.id] = {
          nombre: '',
          ponderacion: 20,
          nota: undefined,
          fecha: ''
        };
        this.errorMsg[ramo.id] = '';
      }
    });
  }

  agruparEvaluaciones() {
    // Inicializar agrupador
    this.ramos.forEach(ramo => {
      if (ramo.id) {
        this.evaluacionesPorRamo[ramo.id] = [];
      }
    });

    // Agrupar
    this.evaluaciones.forEach(ev => {
      if (ev.ramoId && this.evaluacionesPorRamo[ev.ramoId]) {
        this.evaluacionesPorRamo[ev.ramoId].push(ev);
      }
    });
  }

  // Filtrado de ramos
  getRamosFiltrados(): Ramo[] {
    return this.ramos.filter(ramo => {
      const cumpleSemestre = this.semestreSeleccionado === 0 || ramo.semestre === this.semestreSeleccionado;
      const cumpleCursando = !this.soloCursando || ramo.cursando;
      return cumpleSemestre && cumpleCursando;
    });
  }

  getSumaPonderacion(ramoId: number): number {
    const evs = this.evaluacionesPorRamo[ramoId] || [];
    return evs.reduce((sum, ev) => sum + ev.ponderacion, 0);
  }

  agregarEvaluacion(ramoId: number) {
    const form = this.nuevaEv[ramoId];
    this.errorMsg[ramoId] = '';

    if (!form.nombre || form.nombre.trim() === '') {
      this.errorMsg[ramoId] = 'Debes ingresar un nombre para la evaluación.';
      return;
    }

    if (form.ponderacion === undefined || form.ponderacion <= 0 || form.ponderacion > 100) {
      this.errorMsg[ramoId] = 'La ponderación debe ser entre 1% y 100%.';
      return;
    }

    const sumaActual = this.getSumaPonderacion(ramoId);
    if (sumaActual + form.ponderacion > 100) {
      this.errorMsg[ramoId] = `La suma de ponderaciones no puede superar el 100% (actual: ${sumaActual}%).`;
      return;
    }

    if (form.nota !== undefined && form.nota !== null) {
      if (form.nota < 1.0 || form.nota > 7.0) {
        this.errorMsg[ramoId] = 'La nota debe estar entre 1.0 y 7.0.';
        return;
      }
    }

    const evaluacionObj: Evaluacion = {
      nombre: form.nombre,
      ponderacion: form.ponderacion,
      nota: form.nota || undefined,
      fecha: form.fecha || undefined,
      ramoId: ramoId
    };

    this.evaluacionService.crearEvaluacion(evaluacionObj).subscribe({
      next: (guardada) => {
        // Recargar datos
        this.cargarDatos();
      },
      error: (err) => {
        this.errorMsg[ramoId] = 'Error al guardar la evaluación.';
        console.error(err);
      }
    });
  }

  eliminarEvaluacion(evId: number, ramoId: number) {
    Swal.fire({
      title: 'Eliminar evaluación',
      text: '¿Estás seguro de eliminar esta evaluación?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.evaluacionService.eliminarEvaluacion(evId).subscribe({
          next: () => {
            this.cargarDatos();
          },
          error: (err) => {
            this.errorMsg[ramoId] = 'Error al eliminar la evaluación.';
            this.cdr.detectChanges();
            console.error(err);
          }
        });
      }
    });
  }

  // Edición directa de nota
  actualizarNota(ev: Evaluacion, nuevaNotaVal: any, ramoId: number) {
    this.errorMsg[ramoId] = '';
    let notaParsed: number | undefined = undefined;

    if (nuevaNotaVal !== '' && nuevaNotaVal !== null && nuevaNotaVal !== undefined) {
      notaParsed = parseFloat(nuevaNotaVal);
      if (isNaN(notaParsed) || notaParsed < 1.0 || notaParsed > 7.0) {
        this.errorMsg[ramoId] = 'La nota debe estar entre 1.0 y 7.0.';
        return;
      }
    }

    const updatedEv = { ...ev, nota: notaParsed };
    if (ev.id) {
      this.evaluacionService.actualizarEvaluacion(ev.id, updatedEv).subscribe({
        next: () => {
          this.cargarDatos();
        },
        error: (err) => {
          this.errorMsg[ramoId] = 'Error al actualizar la nota.';
          console.error(err);
        }
      });
    }
  }

  formatFecha(fecha: any): string {
    if (!fecha) return 'Sin fecha';
    if (Array.isArray(fecha)) {
      // Si viene como arreglo [YYYY, MM, DD] desde el backend
      const [year, month, day] = fecha;
      return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    }
    if (typeof fecha === 'string') {
      // Si viene como string YYYY-MM-DD
      const parts = fecha.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return 'Fecha inválida';
  }

  crearEvaluacionesPorDefecto() {
    const evsParaCrear: any[] = [];
    
    if (this.ramos.length === 0) {
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    // Solo crear por defecto para los ramos que se están cursando
    const ramosCursando = this.ramos.filter(r => r.cursando);

    ramosCursando.forEach(ramo => {
      if (ramo.id) {
        const evsDelRamo = this.evaluacionesPorRamo[ramo.id] || [];
        if (evsDelRamo.length === 0) {
          const defaults = [
            { nombre: 'Certamen 1', ponderacion: 25, ramoId: ramo.id },
            { nombre: 'Certamen 2', ponderacion: 25, ramoId: ramo.id },
            { nombre: 'Certamen 3', ponderacion: 25, ramoId: ramo.id },
            { nombre: 'Taller', ponderacion: 25, ramoId: ramo.id }
          ];
          defaults.forEach(d => {
            evsParaCrear.push(this.evaluacionService.crearEvaluacion(d));
          });
        }
      }
    });

    if (evsParaCrear.length > 0) {
      this.loading = true;
      this.cdr.detectChanges();
      
      forkJoin(evsParaCrear).subscribe({
        next: () => {
          this.evaluacionService.getEvaluaciones().subscribe({
            next: (evs) => {
              this.evaluaciones = evs;
              this.agruparEvaluaciones();
              this.loading = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error('Error al recargar evaluaciones tras crear defaults:', err);
              this.loading = false;
              this.cdr.detectChanges();
            }
          });
        },
        error: (err) => {
          console.error('Error al crear evaluaciones por defecto:', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  getPromedioGeneral(): number | null {
    const ramosConNota = this.getRamosFiltrados().filter(r => r.nota !== null && r.nota !== undefined);
    if (ramosConNota.length === 0) return null;
    const sum = ramosConNota.reduce((acc, r) => acc + (r.nota ?? 0), 0);
    return sum / ramosConNota.length;
  }

  getPonderacionPromedio(): number {
    const filtrados = this.getRamosFiltrados();
    if (filtrados.length === 0) return 0;
    const sum = filtrados.reduce((acc, r) => acc + this.getSumaPonderacion(r.id!), 0);
    return Math.round(sum / filtrados.length);
  }

  getTotalEvaluacionesCount(): number {
    let count = 0;
    this.getRamosFiltrados().forEach(ramo => {
      if (ramo.id && this.evaluacionesPorRamo[ramo.id]) {
        count += this.evaluacionesPorRamo[ramo.id].length;
      }
    });
    return count;
  }

  getPassingStatusMessage(ramoId: number): string {
    const evs = this.evaluacionesPorRamo[ramoId] || [];
    
    // Sum of all weights (graded + ungraded)
    const sumAllWeights = evs.reduce((sum, ev) => sum + ev.ponderacion, 0);
    const T = Math.max(100, sumAllWeights);
    
    // Sum of graded weights and graded weighted score
    let sumGradedWeights = 0;
    let sumGradedScore = 0;
    
    evs.forEach(ev => {
      if (ev.nota !== null && ev.nota !== undefined) {
        sumGradedWeights += ev.ponderacion;
        sumGradedScore += ev.nota * ev.ponderacion;
      }
    });

    const remainingWeight = T - sumGradedWeights;
    
    // If no remaining weight (all evaluations graded)
    if (remainingWeight <= 0) {
      if (sumGradedWeights === 0) return 'Sin notas ingresadas';
      const finalGrade = sumGradedScore / sumGradedWeights;
      return finalGrade >= 4.0 ? '¡Ramo aprobado! 🎉' : 'Ramo reprobado 😢';
    }

    // Required grade on the remaining weight to reach an average of 4.0
    // formula: (4.0 * T - sumGradedScore) / remainingWeight
    const requiredGrade = (4.0 * T - sumGradedScore) / remainingWeight;

    if (requiredGrade <= 1.0) {
      return '¡Aprobado! (Suficiente con nota 1.0)';
    } else if (requiredGrade > 7.0) {
      return 'No alcanza (Requiere > 7.0) 😢';
    } else {
      const rounded = Math.ceil(requiredGrade * 10) / 10;
      return `Falta nota ${rounded.toFixed(1)} prom. para pasar`;
    }
  }

  getPassingStatusClass(ramoId: number): string {
    const evs = this.evaluacionesPorRamo[ramoId] || [];
    const sumAllWeights = evs.reduce((sum, ev) => sum + ev.ponderacion, 0);
    const T = Math.max(100, sumAllWeights);
    
    let sumGradedWeights = 0;
    let sumGradedScore = 0;
    
    evs.forEach(ev => {
      if (ev.nota !== null && ev.nota !== undefined) {
        sumGradedWeights += ev.ponderacion;
        sumGradedScore += ev.nota * ev.ponderacion;
      }
    });

    const remainingWeight = T - sumGradedWeights;
    
    if (remainingWeight <= 0) {
      if (sumGradedWeights === 0) return 'status-pending';
      const finalGrade = sumGradedScore / sumGradedWeights;
      return finalGrade >= 4.0 ? 'status-passed' : 'status-failed';
    }

    const requiredGrade = (4.0 * T - sumGradedScore) / remainingWeight;

    if (requiredGrade <= 1.0) {
      return 'status-passed';
    } else if (requiredGrade > 7.0) {
      return 'status-failed';
    } else {
      return 'status-pending';
    }
  }

  getPassingStatusIcon(ramoId: number): string {
    const evs = this.evaluacionesPorRamo[ramoId] || [];
    const sumAllWeights = evs.reduce((sum, ev) => sum + ev.ponderacion, 0);
    const T = Math.max(100, sumAllWeights);
    
    let sumGradedWeights = 0;
    let sumGradedScore = 0;
    
    evs.forEach(ev => {
      if (ev.nota !== null && ev.nota !== undefined) {
        sumGradedWeights += ev.ponderacion;
        sumGradedScore += ev.nota * ev.ponderacion;
      }
    });

    const remainingWeight = T - sumGradedWeights;
    
    if (remainingWeight <= 0) {
      if (sumGradedWeights === 0) return 'bi-info-circle-fill';
      const finalGrade = sumGradedScore / sumGradedWeights;
      return finalGrade >= 4.0 ? 'bi-check-circle-fill' : 'bi-x-circle-fill';
    }

    const requiredGrade = (4.0 * T - sumGradedScore) / remainingWeight;

    if (requiredGrade <= 1.0) {
      return 'bi-trophy-fill';
    } else if (requiredGrade > 7.0) {
      return 'bi-x-circle-fill';
    } else {
      return 'bi-calculator';
    }
  }
}
