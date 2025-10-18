import { HttpClient, HttpErrorResponse, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { WeatherModel } from '../models/weather.model';
import { catchError, map } from 'rxjs/operators';
import { weatherApiKey } from '../../environments/weatherApiKey';
import { ErrorModel } from '../models/error.model';
/**
 * ### WeatherService
- Propósito: Encapsular la comunicación con la API de clima y transformar la respuesta en objetos que la UI consuma fácilmente.
- Entradas (métodos públicos):
  - `obtenerPronosticoPorCiudad(city: string, units?: 'metric'|'imperial')`
  - `obtenerPronosticoPorCoords(lat: number, lon: number, units?: 'metric'|'imperial')`
- Salidas:
  - `Observable<DiaPronostico[]>` o `Observable<WeatherModel>` (usar Observable para aprovechar RxJS y `async` en plantillas).
- Errores:
  - Emitir un Observable de error con forma `{ code: number, message: string }` o lanzar `HttpErrorResponse` manejable.
- Indicaciones:
  - No almacenar la API key en el repo. Leerla desde `environment` o pasarla como parámetro para prácticas locales.
  - Incluir `catchError` para transformar errores HTTP en mensajes legibles.
 * **/
@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey: string = weatherApiKey.key.apiKey;
  private apiURL: string = 'https://weather.googleapis.com/v1/forecast/days:lookup';
  private HttpClient: HttpClient;
  private response: any;

  constructor(http: HttpClient) {
    this.HttpClient = http;
  }


  getWeatherData(): Observable<WeatherModel[]> {  
  const params = new HttpParams()
    .set('key', this.apiKey)
    .set('location.latitude', '39.35486297645984')
    .set('location.longitude', '3.127796133857223')
    .set('days', '8');

  return this.HttpClient.get<any>(this.apiURL, { params }).pipe(
      map(response => {
        this.response = response;
        return this.refactorWeatherResponse(response);  
      }),
      catchError((error: HttpErrorResponse) => {
        const payload: ErrorModel = {
          code: error?.status ?? 0,
          message: error?.error?.error?.message ?? error?.message ?? 'Error desconocido'
        };
        return throwError(() => payload);
      })
    );
  } 


  private refactorWeatherResponse(response: any): WeatherModel[] {
  // Mapea todos los días del array forecastDays
    return response.forecastDays?.map((day: any) => ({
      displayDate: `${day.displayDate?.year}-${day.displayDate?.month}-${day.displayDate?.day}`,
      daytimeForecast: day.daytimeForecast?.weatherCondition?.description?.text || '',
      weatherCondition: day.daytimeForecast?.weatherCondition?.type || '',
      maxTemperature: Number(day.maxTemperature?.degrees ?? NaN),
      minTemperature: Number(day.minTemperature?.degrees ?? NaN),
      feelsLikeMaxTemperature: Number(day.feelsLikeMaxTemperature?.degrees ?? NaN),
      feelsLikeMinTemperature: Number(day.feelsLikeMinTemperature?.degrees ?? NaN),
      iconBaseUri: day.daytimeForecast?.weatherCondition?.iconBaseUri || ''
    })) || [];

  }

}