export interface  WeatherModel { 
    temperature: number;
    displayDate: string;
    dayName: string;
    daytimeForecast: string;
    weatherCondition: string;
    maxTemperature: number;
    minTemperature: number;
    feelsLikeMaxTemperature: number;
    feelsLikeMinTemperature: number;
    iconBaseUri: string;
}