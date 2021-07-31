import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
@Injectable()
export class ApiConfigService {
  public apiUrl = "https://libup.mx:8443/libup-api-0.0.1-SNAPSHOT/api/v1/";
  serverMessages = 'https://libup.mx:8443/libup-api-0.0.1-SNAPSHOT/socket';
  serverImages = 'https://libup.mx:8443/images/libup/';
  serverAudios = 'https://libup.mx:8443/audios/';
  bucketName = "Libup" 
  encript= "amedit2019$#@$^@1ERF";
  tiempoSegundos = 15;
  tiempoDias = 15
  segundosPlus = 10
  segundosPlusAudio = 25
  textosTour = "<div class='popover tour'><div class='arrow'></div><h3 class='popover-title'></h3><div class='popover-content'></div><div class='popover-navigation'><button class='btn btn-default' data-role='prev'>« Ant</button><span data-role='separator'>   </span><button class='btn btn-default' data-role='next'>Sig »</button>   <button class='btn btn-default' data-role='end'>Fin</button> </div> </div>"    
  getHeaders(){
    let httpHeaders = new HttpHeaders()
      .set('Content-Type' , 'application/json')
      .set('Access-Control-Allow-Headers' , 'Content-Type')
      .set('Access-Control-Allow-Origin' , '*')      
    let options = {
      headers: httpHeaders
    }; 
    return options;
}
getHeadersImage(){
  let httpHeaders = new HttpHeaders()
  .set('Authorization' , 'Basic YW1lcmljYWRpZ2l0YWwyMDE5OmFtZXJpY2FkaWdpdGFsMjAxOXdlYnNlcnZpY2VzY2hhdA==')
let options = {
  headers: httpHeaders
}; 
return options;
}


  constructor() {}
}
