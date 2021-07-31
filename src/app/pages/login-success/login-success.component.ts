import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login-success',
  templateUrl: './login-success.component.html',
  styleUrls: ['./login-success.component.css']
})
export class LoginSuccessComponent implements OnInit {
  public message: string = '';

  constructor() { }

  ngOnInit() {
    //this.message = 'Token de Autenticación: ' + this.authService.authToken;
  }

}
