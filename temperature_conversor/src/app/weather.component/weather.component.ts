import { CommonModule } from '@angular/common';
import { Component, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WeatherService } from '../services/weather.service';
import { WeatherModel } from '../models/weather.model';
import { finalize } from 'rxjs/operators';
import { ErrorModel } from '../models/error.model';
import { computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';

/**
 * ### WeatherComponent
- Propósito: UI / orquestador — pedir datos, gestionar estado (loading/error), mostrar el banner y permitir toggle C/°F.
- Estado público:
  - `pronosticoDias: DiaPronostico[]`
  - `unidad: 'C'|'F'` (o `'metric'|'imperial'` internamente)
  - `cargando: boolean`
  - `error: string | null`
- Comportamiento (métodos clave):
  - `ngOnInit()` → opcional: cargar datos por defecto o geolocalización.
  - `cargarPronostico()` → llama al servicio, activa `cargando`, maneja `error`.
  - `toggleUnidad()` → convierte en memoria todas las temperaturas (sin volver a llamar a la API).
- Errores y UX:
  - Validar ciudad vacía antes de enviar pedido.
  - Mostrar spinner mientras `cargando` es true.
  - Mostrar snackbar/alert con mensaje en caso de error.
 */

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatGridListModule,
    MatCardModule
  ],
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent {
  private weatherService: WeatherService;
  weatherDataBase = signal<WeatherModel[]>([]);
  unit = signal<'C' | 'F'>('C');
  loading = signal<boolean>(false);
  error = signal<ErrorModel | null>(null);
  conditionIcon: string = ''; // Añadido para evitar error en template

  constructor(weatherService: WeatherService) {
    this.weatherService = weatherService;
  }

   get weatherData() {
    return computed(() => {
      if (this.unit() === 'C') return this.weatherDataBase();
      return this.weatherDataBase().map(d => ({
        ...d,
        temperature: this.celsiusToFahrenheit(d.temperature),
        maxTemperature: this.celsiusToFahrenheit(d.maxTemperature),
        minTemperature: this.celsiusToFahrenheit(d.minTemperature),
        feelsLikeMaxTemperature: this.celsiusToFahrenheit(d.feelsLikeMaxTemperature),
        feelsLikeMinTemperature: this.celsiusToFahrenheit(d.feelsLikeMinTemperature),
      }));
    });
  }

  ngOnInit() {
    this.loadWeatherPrognosis();
  }

  loadWeatherPrognosis() {
    this.loading.set(true);
    this.weatherService.getWeatherData().subscribe({
      next: (data) => {
        this.weatherDataBase.set(data ?? []);
        this.error.set(null);
        this.loading.set(false);
      },
      error: (error: ErrorModel) => {
        this.weatherDataBase.set([]);
        this.error.set(this.handleError(error));
        this.loading.set(false);
      }
    });
  }

  handleError(error: ErrorModel): ErrorModel {
    const e: ErrorModel = { code: error?.code ?? 0, message: error?.message ?? 'Ocurrió un error inesperado.' };
    switch (e.code) {
      case 400: e.message = 'Solicitud incorrecta. Verifica los parámetros.'; break;
      case 401: e.message = 'No autorizado. Verifica tu clave API.'; break;
      case 404: e.message = 'Recurso no encontrado.'; break;
      case 429: e.message = 'Demasiadas peticiones. Intenta más tarde.'; break;
      case 500: e.message = 'Error del servidor. Intenta nuevamente más tarde.'; break;
    }
    return e;
  }

  toggleUnit(unit: 'C' | 'F') {
    if (this.unit() !== unit) this.unit.set(unit);
  }

  private celsiusToFahrenheit(celsius: number): number {
    return (celsius * 9/5) + 32;
  }

  get currentDay() {
    return this.weatherData()[0]; 
  }


}
