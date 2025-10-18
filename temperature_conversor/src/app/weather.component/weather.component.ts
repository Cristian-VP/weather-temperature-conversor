import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WeatherService } from '../services/weather.service';
import { WeatherModel } from '../models/weather.model';
import { finalize } from 'rxjs/operators';
import { ErrorModel } from '../models/error.model';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent {
  private weatherService: WeatherService;
  weatherData: WeatherModel[] = [];
  unit: 'C' | 'F' = 'C';
  loading: boolean = false;
  error: ErrorModel | null = null;

  constructor(weatherService: WeatherService) {
    this.weatherService = weatherService;
  }

  ngOnInit() {
    this.loadWeatherPrognosis();
  }

  loadWeatherPrognosis() {
    this.loading = true;
    this.error = null;
    this.weatherService.getWeatherData()
    .pipe(finalize(() => this.loading = false))
    .subscribe({
      next: (data) =>{
        this.weatherData = data;
      },
      error: (error: ErrorModel) => {
        this.weatherData = [];
        this.error = this.handleError(error);
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
    this.unit = unit;
    this.weatherData = this.weatherData.map(day => {
      const factor = unit === 'C' ? 1 : 1.8;
      const offset = unit === 'C' ? 0 : 32;
      return {
        ...day,
        maxTemperature: unit === 'C' ? this.fahrenheitToCelsius(day.maxTemperature) : this.celsiusToFahrenheit(day.maxTemperature),
        minTemperature: unit === 'C' ? this.fahrenheitToCelsius(day.minTemperature) : this.celsiusToFahrenheit(day.minTemperature),
        feelsLikeMaxTemperature: unit === 'C' ? this.fahrenheitToCelsius(day.feelsLikeMaxTemperature) : this.celsiusToFahrenheit(day.feelsLikeMaxTemperature),
        feelsLikeMinTemperature: unit === 'C' ? this.fahrenheitToCelsius(day.feelsLikeMinTemperature) : this.celsiusToFahrenheit(day.feelsLikeMinTemperature)
      };
    });
  }

  celsiusToFahrenheit(celsius: number): number {
    return (celsius * 9/5) + 32;
  }

  fahrenheitToCelsius(fahrenheit: number): number {
    return (fahrenheit - 32) * 5/9;
  }
}
