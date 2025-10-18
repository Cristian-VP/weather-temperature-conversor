export interface  WeatherModel { 
    displayDate: string;
    daytimeForecast: string;
    weatherCondition: string;
    maxTemperature: number;
    minTemperature: number;
    feelsLikeMaxTemperature: number;
    feelsLikeMinTemperature: number;
    iconBaseUri: string;
}