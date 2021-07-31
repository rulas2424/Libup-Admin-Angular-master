import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { ChannelService } from '../../services/chanels-service';
import { CommonAlerts } from '../../Common/common-alerts';
import { CookieService } from 'ngx-cookie-service';
import { ApiConfigService } from '../../services/api-config.service';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
declare var $: any
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    this.disconnect()
  }
  myForm: FormGroup;
  imageLoad: string;
  idChannelSocket: string;
  base64ImageFile: any;
  allMessages: boolean = false;
  messages: Messages[] = [];
  private stompClient;
  logotipo: string;
  connected: boolean = false;
  serverAdjuntos: any
  chatImage: string;
  canal: string
  @ViewChild('spinner', { static: true }) spinerDialog: TemplateRef<any>;
  @ViewChild('imagePrevio', { static: true }) imagePrevio: TemplateRef<any>;
  constructor(private fb: FormBuilder, public dialog: MatDialog, private chanelService: ChannelService,
    private comonAlerts: CommonAlerts, private cookieService: CookieService, private apiConf: ApiConfigService,
    private router:Router,private title:Title,
    private activeRoute: ActivatedRoute) {
    this.myForm = this.fb.group({
      fileSelect: ['', Validators.required]
    })
  }

  ngOnInit() {
    $("#menu").click();
    this.serverAdjuntos = this.apiConf.serverImages + "adjuntos/";
    this.title.setTitle("CHAT-" + this.activeRoute.snapshot.params['nameChannel']);
    this.getMessagesByIdChannel(this.activeRoute.snapshot.params['idChannel']);
    this.canal = this.activeRoute.snapshot.params['nameChannel']
  }

  disconnect() {
    if (this.stompClient != null) {
      this.stompClient.disconnect();
    }
    console.log('Disconnected!');
  }


  getMessagesByIdChannel(idChannel: string) {
    this.idChannelSocket = idChannel;
    this.chanelService.getMessagesByIdChannel(idChannel).subscribe((response: any) => {
      this.messages = response.data;
      this.allMessages = true;
      $("#msg").animate({
        scrollTop: 9999
      }, 1300);
      this.connect(this.messages, idChannel);
    }, (error: any) => {
      this.comonAlerts.showToastError(error)
      this.allMessages = true;
    })
  }

  public uploadImage(): void {

    //let files = this.elem.nativeElement.querySelector('#fileSelect').files;
    let formData;
    let that = this;
    formData = new FormData();
    let file = (<HTMLInputElement>document.getElementById('fileSelect')).files[0];
    var t = file.type.split('/')[0].toLowerCase();
    if (t != "image") {
      that.comonAlerts.showToastError('Por favor seleccione un archivo de imagen válido');
      $("#fileSelect").val('');
      return;
    }
    if (file.size > 300000) {
      that.comonAlerts.showToastError("El archivo: " + file.name + " es demasiado grande, el peso permitido es de 300 kb.!");
      $("#fileSelect").val('');
      return;
    };
    formData.append('pathFile', file);
    formData.append('typeUser', "Panel");
    formData.append('msgType', "Imagen");
    formData.append('idChannel', this.idChannelSocket);
    formData.append('idRadio', this.cookieService.get('isLogin'));
    this.chanelService.uploadFiles(formData).subscribe((response: any) => {
      this.clean()
    }, (error: any) => {
      this.comonAlerts.showToastError(error)
      this.clean()
    })
    $("#msg").animate({
      scrollTop: 9999
    }, 1300);
  }

  clean() {
    this.base64ImageFile = "";
    this.logotipo = "";
    $("#fileSelect").val('');
  }

  connect(messagesDatabase: Messages[], idChannel: any) {
    let ws = new SockJS(this.apiConf.serverMessages);
    this.stompClient = Stomp.over(ws);
    let that = this;
    //this.stompClient.debug = null;
    this.stompClient.connect({}, function (frame) {
      console.log('Connected: ' + frame);
      that.connected = true;
      that.stompClient.subscribe("/chat/" + idChannel, (message) => {
        $("#msg").animate({
          scrollTop: 9999
        }, 1300);
        var json = JSON.parse(message.body);
        if (message.body) {
          if (json.messageResponse) {
            messagesDatabase.push({
              dateHour: json.messageResponse.dateHour,
              idAdmin: json.messageResponse.idAdmin,
              idMessage: json.messageResponse.idMessage,
              idUser: json.messageResponse.idUser,
              message: json.messageResponse.message,
              msgType: json.messageResponse.msgType,
              nameAdmin: json.messageResponse.nameAdmin,
              nameUser: json.messageResponse.nameUser,
              pathFile: json.messageResponse.pathFile,
              typeUser: json.messageResponse.typeUser
            }
            )
          }
          this.title.setTitle("Nuevos mensajes " + "CHAT-" + this.activeRoute.snapshot.params['']);
          $("#msg").animate({
            scrollTop: 9999
          }, 1300);
        }

      });

    });

  }

  sendMessage(message, eve: any) {
    if (typeof eve !== "undefined") {
      if (eve.keyCode == 13) {
        var dInput = $('#inputConver').val();
        if (dInput.length == 1) {
          $('#inputConver').val('');
          return;
        }
      }
    }
    if (message) {
      var param = {
        message: message,
        typeUser: "Panel",
        msgType: "Texto",
        idChannel: this.idChannelSocket,
        idRadio: this.cookieService.get('isLogin')
      };

      let body = JSON.stringify(param);

      this.stompClient.send("/app/send/message", {}, body);
    }
    this.title.setTitle("CHAT-" + this.activeRoute.snapshot.params['nameChannel']);
    $('#inputConver').val('');
    $("#msg").animate({
      scrollTop: 9999
    }, 1300);
  }


  onImageChange() {
    let file = (<HTMLInputElement>document.getElementById('fileSelect')).files[0];
    var promise = this.encodeImagetoBase64(file);
    let that = this;
    let toArray = file.name.split(".");
    promise.then(function (result) {
      that.imageLoad = "data:image/" + toArray[1] + ";base64," + result.toString().split(',')[1]
      that.openPrevioLoadImage(that.imagePrevio);
    });

  }

  openPrevioLoadImage(templateRef: TemplateRef<any>) {
    this.dialog.open(templateRef, { width: window.innerWidth + 'px', disableClose: true }).afterClosed().subscribe(result => {
    });

  }

  openImageModal(chatImage: string, nameModal: TemplateRef<any>) {
    this.dialog.open(nameModal);
    this.chatImage = chatImage;
  }


  encodeImagetoBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
export interface Messages {
  dateHour: string
  idAdmin: string
  idMessage: string
  idUser: string
  message: string
  msgType: string
  nameAdmin: string
  nameUser: string
  pathFile: string
  typeUser: string
}
