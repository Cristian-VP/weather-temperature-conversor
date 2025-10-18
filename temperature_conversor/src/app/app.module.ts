import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app';
import { WeatherComponent } from './weather.component/weather.component'; // Asegúrate de que la ruta sea correcta

@NgModule({
  declarations: [
    AppComponent,
    WeatherComponent 
  ],
  imports: [
    BrowserModule 
  ],
  providers: [],
  bootstrap: [AppComponent] // Componente principal que se carga al inicio
})
export class AppModule { }