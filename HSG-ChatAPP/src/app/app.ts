import { Component } from '@angular/core';
import { HeaderComponent } from './layout/header/header';
import { BodyComponent }   from './layout/body/body';
import { FooterComponent } from './layout/footer/footer';




@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, BodyComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {}
