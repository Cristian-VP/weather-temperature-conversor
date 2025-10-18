import { HttpClient, HttpErrorResponse, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { WeatherModel } from '../models/weather.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/apiKey';
import { ErrorModel } from '../models/error.model';
import { CurrentDay } from '../models/currentDay';


@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey: string = environment.weatherApiKey;
  private apiForecastURL: string = 'https://weather.googleapis.com/v1/forecast/days:lookup';
  private HttpClient: HttpClient;
  private apiDayURL: string = 'https://weather.googleapis.com/v1/currentConditions:lookup';
  constructor(http: HttpClient) {
    this.HttpClient = http;
  }

  getCurrentDayWeather(): Observable<CurrentDay> {
    const params = new HttpParams()
      .set('key', this.apiKey)
      .set('location.latitude', '39.35486297645984')
      .set('location.longitude', '3.127796133857223')
      .set('languageCode', 'es');

    return this.HttpClient.get<any>(this.apiDayURL, { params }).pipe(
        map(response => {
          const day = response;
          const currentDay: CurrentDay = {
            currentTime: new Date(day.currentTime).toLocaleString('es-ES', {
              timeZone: 'Europe/Madrid',
              weekday: 'long',
              hour: '2-digit',
              minute: '2-digit'
            }),
            temperature: Number(day?.temperature.degrees ?? NaN),
            iconBaseUri: day.weatherCondition?.iconBaseUri || '',
            wheatherCondition: day.weatherCondition?.description?.text || ''
          };
          return currentDay;
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

  getWeatherData(): Observable<WeatherModel[]> {  
  const params = new HttpParams()
    .set('key', this.apiKey)
    .set('location.latitude', '39.35486297645984')
    .set('location.longitude', '3.127796133857223')
    .set('days', '8')
    .set('languageCode', 'es');

  return this.HttpClient.get<any>(this.apiForecastURL, { params }).pipe(
      map(response => {
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
      dayName: new Date(day.displayDate?.year, day.displayDate?.month - 1, day.displayDate?.day).toLocaleDateString('es-ES', { weekday: 'long' }),
      daytimeForecast: day.daytimeForecast?.weatherCondition?.description?.text || '',
      weatherCondition: day.daytimeForecast?.weatherCondition?.description?.text || '',
      maxTemperature: Number(day.maxTemperature?.degrees ?? NaN),
      minTemperature: Number(day.minTemperature?.degrees ?? NaN),
      feelsLikeMaxTemperature: Number(day.feelsLikeMaxTemperature?.degrees ?? NaN),
      feelsLikeMinTemperature: Number(day.feelsLikeMinTemperature?.degrees ?? NaN),
      iconBaseUri: day.daytimeForecast?.weatherCondition?.iconBaseUri || ''
    })) || [];

  }

}