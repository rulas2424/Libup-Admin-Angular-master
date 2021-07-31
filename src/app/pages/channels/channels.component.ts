import { Component, OnInit, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonAlerts } from '../../Common/common-alerts';
import { CookieService } from 'ngx-cookie-service';
import { ApiConfigService } from '../../services/api-config.service';
import { ChannelService } from '../../services/chanels-service';
import { ToastrService } from 'ngx-toastr';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { Router } from '@angular/router';
declare var $: any;
@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.css']
})
export class ChannelsComponent implements OnInit {

  templateRef: TemplateRef<any>;
  limit: number = 10;
  totalLength: number = 0;
  pageIndex: number = 0;
  pageLimit: number[] = [5, 10, 20];
  formChannel: FormGroup;
  myForm: FormGroup;
  videoForm: FormGroup;
  isLoaded: boolean = false;
  logotypeModal: string;
  chatImage: string;
  tittle: string;
  public displayedColumns = ['title', 'image', 'active', 'update', 'delete', 'chat'
  ];
  longitudOriginal: number = 0;
  indexOriginal: number = 0;
  channelsList: Channels[] = [];
  serverImages: string;
  serverAdjuntos: string;
  logotipo: string;
  videoLoad: string;
  imageLoad: string;
  base64ImageFile: any;
  isUpdate: boolean;
  idChannel: string;
  textButton: string;
  imageDelete: string;
  canalName: string;
  allMessages: boolean = false;
  messages: Messages[] = [];
  private stompClient;
  idChannelSocket: string;
  connected: boolean = false;
  expandImage: string;
  @ViewChild('spinner', { static: true }) spinerDialog: TemplateRef<any>;
  @ViewChild('videoPrevio', { static: true }) previoVideo: TemplateRef<any>;
  @ViewChild('imagePrevio', { static: true }) imagePrevio: TemplateRef<any>;
  constructor(public fb: FormBuilder, public dialog: MatDialog, private comonAlerts: CommonAlerts, private router: Router,
    private cookieService: CookieService, private apiConf: ApiConfigService,
    private chanelService: ChannelService, private toastr: ToastrService, private elem: ElementRef) {
    this.formChannel = this.fb.group({
      tittle: ['', Validators.required],
      description: [''],
      url: [''],
      image: ['', Validators.required]
    })

    this.myForm = this.fb.group({
      fileSelect: ['', Validators.required]
    })

    this.videoForm = this.fb.group({
      videoSelect: ['', Validators.required]
    })
  }


  ngOnInit() {
    this.getChannelsList(0, this.limit)
    this.serverImages = this.apiConf.serverImages + "canales/";
    this.serverAdjuntos = this.apiConf.serverImages + "adjuntos/";
    this.disconnect()
  }

  disconnect() {
    if (this.stompClient != null) {
      this.stompClient.disconnect();
    }
    console.log('Disconnected!');
  }

  onVideoChange() {
    let file = (<HTMLInputElement>document.getElementById('videoSelect')).files[0];
    var promise = this.encodeImagetoBase64(file);
    let that = this;
    let toArray = file.name.split(".");
    promise.then(function (result) {
      that.videoLoad = "data:video/" + toArray[1] + ";base64," + result.toString().split(',')[1]
      console.warn(result)
      that.openPrevioLoadVideo(that.previoVideo);
    });

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

  sendVideo() {
    $("#videoSelect").val('');
    this.videoLoad = "";
  }

  openPrevioLoadVideo(templateRef: TemplateRef<any>) {
    this.dialog.open(templateRef, { width: window.innerWidth + 'px', disableClose: true }).afterClosed().subscribe(result => {
    });
  }

  openPrevioLoadImage(templateRef: TemplateRef<any>) {
    this.dialog.open(templateRef, { width: window.innerWidth + 'px', disableClose: true }).afterClosed().subscribe(result => {
    });

  }


  openDialogChat(channel: Channels, templateRef: TemplateRef<any>) {
    this.canalName = channel.tittle;
    this.allMessages = false;
    
   /*  this.dialog.open(templateRef, { width: window.innerWidth + 'px' }).afterClosed().subscribe(result => {

    });
    this.connected = false;
    this.getMessagesByIdChannel(channel.idChannel); */
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

  }


  public uploadVideo(): void {

    //let files = this.elem.nativeElement.querySelector('#fileSelect').files;
    let formData;
    let that = this;
    formData = new FormData();
    let file = (<HTMLInputElement>document.getElementById('videoSelect')).files[0];
    var t = file.type.split('/').pop().toLowerCase();
    if (t != "mp4") {
      that.comonAlerts.showToastError('Por favor seleccione un archivo de video válido');
      $("#videoSelect").val('');
      return;
    }
    if (file.size > 20971520) {
      that.comonAlerts.showToastError("El archivo: " + file.name + " es demasiado grande, el peso permitido es de 20 Mb.!");
      $("#videoSelect").val('');
      return;
    };
    formData.append('pathFile', file);
    formData.append('typeUser', "Panel");
    formData.append('msgType', "Video");
    formData.append('idChannel', this.idChannelSocket);
    formData.append('idRadio', this.cookieService.get('isLogin'));
    this.chanelService.uploadFiles(formData).subscribe((response: any) => {
      this.clean()
    }, (error: any) => {
      this.comonAlerts.showToastError(error)
      this.clean()
    })

  }


  openImageModal(chatImage: string, nameModal: TemplateRef<any>) {
    this.dialog.open(nameModal);
    this.chatImage = chatImage;
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
    $('#inputConver').val('');
  }

  onFileChange() {
    let file = (<HTMLInputElement>document.getElementById('selectFile')).files[0];
    var promise = this.encodeImagetoBase64(file);
    let that = this;
    let toArray = file.name.split(".");
    promise.then(function (result) {
      that.logotipo = "data:image/" + toArray[1] + ";base64," + result.toString().split(',')[1]
      var base64result = result.toString().split(',')[1]
      that.base64ImageFile = base64result;
    });

  }

  openImage(nameModal: TemplateRef<any>, logotype: string) {
    this.dialog.open(nameModal);
    this.logotypeModal = logotype;
  }


  encodeImagetoBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }


  getChannelsList(page: number, limit: number) {
    var param = {
      idBroadcaster: this.cookieService.get('idBroadcaster'),
      page: page,
      maxResults: limit
    }
    let body = JSON.stringify(param);
    this.openSpinner()
    this.chanelService.getAllChannels(body).subscribe((response: any) => {
      this.isLoaded = true;
      this.channelsList = response.data;
      this.totalLength = response.totalElements;
      this.longitudOriginal = response.totalElements;
      this.cleanData()
    }, (error: any) => {
      this.comonAlerts.showToastError(error)
      this.cleanData()
    })

  }

  openDialogAddCanal(templateRef: TemplateRef<any>) {
    this.isUpdate = false;
    this.textButton = "Agregar";
    this.tittle = "¿Deseas agregar un canal?";
    this.cleanData();
    this.dialog.open(templateRef, { width: window.innerWidth + 'px', disableClose: true }).afterClosed().subscribe(result => {
      //this.getComercios(0, this.limit);
    });
  }

  openDialogDelete(channel: Channels, templateRef: TemplateRef<any>) {
    this.idChannel = channel.idChannel;
    this.canalName = channel.tittle;
    this.imageDelete = channel.pathImage;
    this.dialog.open(templateRef, { width: window.innerWidth + 'px', disableClose: true }).afterClosed().subscribe(result => {

    });
  }

  deleteCanal() {
    this.openSpinner()
    this.chanelService.deleteChannel(this.idChannel).subscribe((response: any) => {
      this.comonAlerts.showSuccess(response.header.message)
      this.getChannelsList(this.pageIndex, this.limit);
    }, (error) => {
      this.comonAlerts.showToastError(error)
      this.dialog.closeAll()
    });
  }

  addChannel(channelForm: any) {
    var imgVal = $('#selectFile').val();
    if (this.isUpdate) {
      this.disableValidatorsFile()
    } else {
      this.setValidators("image");
      if (imgVal == '') {
        this.showWarnning("El logotipo es requerido.")
        return false;
      }
    }
    if (!channelForm.valid) {
      return;
    }

    this.pageIndex = this.indexOriginal;
    this.openSpinner();
    var param = {
      tittle: channelForm.value.tittle,
      description: channelForm.value.description,
      url: channelForm.value.url,
      image: this.base64ImageFile,
      idBroadcaster: this.cookieService.get('idBroadcaster'),
      idChannel: this.idChannel
    };
    if (this.isUpdate == false) {

      let body = JSON.stringify(param);
      this.chanelService.addChannel(body).subscribe((response: any) => {
        this.comonAlerts.showSuccess(response.header.message)
        this.getChannelsList(this.pageIndex, this.limit);
      }, (error) => {
        this.comonAlerts.showToastError(error)
        this.cleanData();
      });
    } else if (this.isUpdate == true) {
      delete param['idBroadcaster'];
      let bodyUpdate = JSON.stringify(param);
      this.chanelService.updateChannel(bodyUpdate).subscribe((response: any) => {
        this.comonAlerts.showSuccess(response.header.message)
        this.getChannelsList(this.pageIndex, this.limit);
      }, (error) => {
        this.comonAlerts.showToastError(error)
        this.cleanData();
      });

    }

  }

  showWarnning(msg: any) {
    if (this.cookieService.check('isLogin')) {
      this.toastr.warning(msg, 'Advertencia!', {
        timeOut: 1500
      });
    }
  }

  clean() {
    this.formChannel.reset();
    this.base64ImageFile = "";
    this.logotipo = "";
    $("#fileSelect").val('');
  }

  cleanData() {
    this.formChannel.reset();
    this.dialog.closeAll()
    this.base64ImageFile = "";
    this.logotipo = "";
  }

  openDialogUpdate(canal: Channels, templateRef: TemplateRef<any>) {
    this.isUpdate = true;
    this.cleanData()
    this.textButton = "Actualizar";
    this.tittle = "¿Deseas actualizar el canal?";
    this.dialog.open(templateRef, { width: window.innerWidth + 'px', disableClose: true }).afterClosed().subscribe((result: boolean) => {
      //this.getComercios(0, this.limit);
    });
    this.formChannel.controls['tittle'].setValue(canal.tittle);
    this.formChannel.controls['description'].setValue(canal.description);
    this.formChannel.controls['url'].setValue(canal.url);
    this.idChannel = canal.idChannel;
    this.logotypeModal = canal.pathImage;

  }

  setValidators(controlName: string) {
    this.formChannel.get(controlName).setValidators([Validators.required]);
    this.formChannel.get(controlName).updateValueAndValidity();
  }

  openSpinner() {
    this.dialog.open(this.spinerDialog, {
      panelClass: 'my-spinner'
    });
  }

  openModalImage(nameModal: any) {
    this.dialog.open(nameModal);
  }

  changeStatusActive(event: any, idChannel: string) {
    this.pageIndex = this.indexOriginal;
    var param = {
      idChannel: idChannel,
      status: event.checked
    }
    let body = JSON.stringify(param);

    this.chanelService.updateStatusChannel(body).subscribe((response: any) => {
      this.comonAlerts.showSuccess(response.header.message)
      this.getChannelsList(this.pageIndex, this.limit);
    }, (error) => {
      this.comonAlerts.showToastError(error)
      this.getChannelsList(this.pageIndex, this.limit);
    });
  }

  disableValidatorsFile() {
    this.formChannel.get("image").clearValidators();
    this.formChannel.get("image").updateValueAndValidity();
  }


  changePage(event: any) {
    this.getChannelsList(event.pageIndex, event.pageSize);
    this.indexOriginal = event.pageIndex;
    this.pageIndex = event.pageIndex;
    this.limit = event.pageSize;
  }
}


export interface Channels {
  active: boolean
  description: string
  idBroadcaster: string
  idChannel: string
  isDeleted: boolean
  nameBroadcaster: string
  pathImage: string
  tittle: string
  url: string
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
