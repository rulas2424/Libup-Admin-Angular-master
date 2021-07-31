import { Component, OnInit, TemplateRef, ViewChild, PipeTransform, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CommonAlerts } from '../../Common/common-alerts';
import { ContestApiService } from '../../services/contest-service';
import { CookieService } from 'ngx-cookie-service';
import { ApiConfigService } from '../../services/api-config.service';
import { MapsAPILoader } from '@agm/core';
declare var $: any;
@Component({
  selector: 'app-contest',
  templateUrl: './contest.component.html',
  styleUrls: ['./contest.component.css']
})
export class ContestComponent implements OnInit, PipeTransform {
  transform(value: number): string {
    const minutes: number = Math.floor(value / 60);
    return minutes.toString().padStart(2, '0') + ':' +
      (value - minutes * 60).toString().padStart(2, '0');
  }
  templateRef: TemplateRef<any>;
  limit: number = 10;
  totalLength: number = 0;
  pageIndex: number = 0;
  pageLimit: number[] = [5, 10, 20];
  formUpload: FormGroup;
  formTime: FormGroup;
  isLoaded: boolean = false;
  title: string = "";
  button: string = "";
  audioSrc: string;
  audioSrcActual: string;
  namePremio: string;
  urlAudios: string;
  timmer: any;
  file: any;
  seconds: any
  transformsTime: any;
  public displayedColumns = ['premio', 'status', 'acrid', 'release', 'update', 'lanzar', 'end'
  ];
  longitudOriginal: number = 0;
  indexOriginal: number = 0;
  reproductor: boolean = false;
  idContest: string;
  read: boolean = true;
  interval;
  contestList: Contest[] = [];
  acrId: string;
  idShop: string;
  //el mapa
  latitude: number;
  longitude: number;
  zoom: number = 8;
  radius: number = 5000;
  address: string;
  private geoCoder;
  textNotfs: string = " por rango"
  checked: boolean = false;
  checkedNotificate: boolean = false;
  kilometers: any = 5;
  @ViewChild('spinner', { static: true }) spinerDialog: TemplateRef<any>;
  @ViewChild('spinner2', { static: true }) spinerDialog2: TemplateRef<any>;
  constructor(public fb: FormBuilder, public dialog: MatDialog, private comonAlerts: CommonAlerts,
    private contestService: ContestApiService, private cookieService: CookieService, private apiConf: ApiConfigService,
    private mapsAPILoader: MapsAPILoader, private ngZone: NgZone) {
    this.formUpload = this.fb.group({
      name: ['', Validators.required],
      fileSelect: ['', Validators.required]
    })

    this.formTime = this.fb.group({
      time: new FormControl('', [
        Validators.required, Validators.pattern('^[0-9]*$')]),
    })
  }
  
  markerDragEnd(event: any) {
    this.latitude = event.coords.lat;
    this.longitude = event.coords.lng;
  }


  onRadiusChange(radio: any) {
    var km = radio / 1000;        
    this.radius = radio;
    this.kilometers = km.toFixed(1);
  }


  openDialogConfirm(contest: Contest, templateRef: TemplateRef<any>) {
    this.formTime.reset()
    var that = this
    setTimeout(function(){
      that.loadPlaces()
    },1000);
   
    this.checked = false;
    this.namePremio = contest.promoContestResponse.namePromo;
    this.formTime.controls['time'].setValue(contest.promoContestResponse.seconds + this.apiConf.segundosPlusAudio);
    this.seconds = contest.promoContestResponse.seconds + this.apiConf.segundosPlusAudio
    this.dialog.open(templateRef);
    this.idContest = contest.idContest;
    this.acrId = contest.idAcr;
    this.idShop = contest.promoContestResponse.idShop;
  }

  terminateConcurso(contest: Contest, templateRef: TemplateRef<any>) {
    this.namePremio = contest.promoContestResponse.namePromo;
    this.dialog.open(templateRef);
    this.idContest = contest.idContest;
    this.idShop = contest.promoContestResponse.idShop;
  }

  notificateUsers() {
    if (!this.formTime.valid) {
      return;
    }
    var param = {
      acrId: this.acrId,
      idContest: this.idContest,
      secondsDuration: Number(this.seconds),
      withAudio: true,
      latitude: this.latitude + "",
      longitude: this.longitude + "",
      rangeKilometers: Number(this.kilometers),
      allUsers: this.checked,
      typeNotify: "Audio"
    }
    let body = JSON.stringify(param);
    this.openSpinner()
    this.contestService.notificateUsers(body).subscribe((response: any) => {
      this.comonAlerts.showSuccess(response.header.message)
      this.dialog.closeAll()
      this.openTimmer();
      this.pageIndex = this.indexOriginal;
      this.getContestListNotClean(this.pageIndex, this.limit)
    }, (error: any) => {
      this.comonAlerts.showToastError(error)
      this.cleanData()
    })

  }

  terminateContestAndNotificateWinner() {
    var param = {
      idShop: this.idShop,
      idContest: this.idContest,
      containAudio: true,
      typeNotify: "Audio"
    }
    let body = JSON.stringify(param);
    this.contestService.terminateContest(body).subscribe((response: any) => {
      this.dialog.closeAll()
      this.comonAlerts.showSuccess(response.header.message)
      this.pageIndex = this.indexOriginal;
      this.getContestList(this.pageIndex, this.limit)
    }, (error: any) => {
      this.comonAlerts.showToastError(error);
      this.cleanData();
    })
  }

  openTimmer() {
    this.openTemporizador()
    this.timmer = Number(this.seconds);
    this.interval = setInterval(() => {
      if (this.timmer > 0) {
        this.transformsTime = this.transform(this.timmer--)
      } else {
        this.terminateContestAndNotificateWinner();
        this.pauseTimeLine()
      }
    }, 1000)
  }

  openTemporizador() {
    this.dialog.open(this.spinerDialog2, {
      panelClass: 'my-spinner'
    });
  }
  pauseTimeLine() {
    clearInterval(this.interval);
  }

  ngOnInit() {
    // window.onbeforeunload = function (e) {
    //   var e = e || window.event;
    //   if (e) {
    //     e.returnValue = 'Se perderan todos los datos que no hayas guardado';
    //   }
    // }
    this.getContestList(0, this.limit)
    this.setCurrentLocation(this.cookieService.get('latitude'), this.cookieService.get('longitude'), 12)
    this.urlAudios = this.apiConf.serverAudios;
  }

  private setCurrentLocation(latitude: any, longitud: any, zoom: number) {
    this.latitude = Number(latitude);
    this.longitude = Number(longitud);
    this.zoom = zoom;
  }

  loadPlaces() {
    //load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder;
      let autocomplete = new google.maps.places.Autocomplete($("#filterPlaces")[0], {});
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          //set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 13;
        });
      });
    });
  }

  
  changeCheck(ev: any) {
    if (ev.checked == true) {
      this.textNotfs = " a todos los usuarios"
      this.checked = true;
    } else if (ev.checked == false) {
      this.textNotfs = " por rango"
      this.checked = false;
    }
  }


  getContestList(page: number, limit: number) {
    var param = {
      idBroadcaster: this.cookieService.get('idBroadcaster'),
      containAudio: true,
      page: page,
      maxResults: limit
    }
    let body = JSON.stringify(param);
    this.openSpinner()
    this.contestService.getContestList(body).subscribe((response: any) => {
      this.isLoaded = true;
      this.contestList = response.data;
      this.totalLength = response.totalElements;
      this.longitudOriginal = response.totalElements;
      this.cleanData()
    }, (error: any) => {
      this.comonAlerts.showToastError(error)
      this.cleanData()
    })

  }


  getContestListNotClean(page: number, limit: number) {
    var param = {
      idBroadcaster: this.cookieService.get('idBroadcaster'),
      containAudio: true,
      page: page,
      maxResults: limit
    }
    let body = JSON.stringify(param);
    this.contestService.getContestList(body).subscribe((response: any) => {
      this.isLoaded = true;
      this.contestList = response.data;
      this.totalLength = response.totalElements;
      this.longitudOriginal = response.totalElements;
    }, (error: any) => {
      this.comonAlerts.showToastError(error)
    })

  }


  openDialogContest(contest: Contest, templateRef: TemplateRef<any>) {
    this.cleanData();
    this.formUpload.get('name').disable();
    this.title = "¿Deseas actualizar los datos del concurso?";
    this.disableValidatorsFile();
    this.button = "Actualizar"
    this.dialog.open(templateRef, { width: window.innerWidth + 'px', disableClose: true });
    this.formUpload.controls['name'].setValue(contest.audioTitle);
    this.namePremio = contest.promoContestResponse.namePromo;
    this.idContest = contest.idContest;
    this.audioSrcActual = contest.audio;
  }


  updateAudio(formUpload: any) {
    if (!this.formUpload.valid) {
      return;
    }
    this.openSpinner()
    this.pageIndex = this.indexOriginal;
    let formData;
    formData = new FormData();
    formData.append("audioTitle", formUpload.value.name)
    if (this.file !== "") {
      formData.append("file", this.file);
    }
    formData.append("idContest", this.idContest);
    this.contestService.updateAudioAndContest(formData).subscribe((response: any) => {
      this.getContestList(this.pageIndex, this.limit);
      this.comonAlerts.showSuccess(response.header.message)
      this.dialog.closeAll()
    }, (error) => {
      this.comonAlerts.showToastError(error)
      this.dialog.closeAll()
    });

  }

  onAudioFileChange(evento: any) {
    let file = (<HTMLInputElement>document.getElementById('imageUpload')).files[0];
    this.file = file;
    if (file != null) {
      var t = file.type.split('/')[0].toLowerCase();
      if (t != "audio") {
        this.comonAlerts.showWarnning("Por favor selecciona un formato de audio valido.")
        this.formUpload.controls['fileSelect'].setValue("");
        this.reproductor = false;
        return;
      }
    }
    this.formUpload.get('name').enable();
    this.reproductor = true;
    var promise = this.encodeFileAudioBase64(file);
    let toArray = file.name.split(".");
    let that = this;
    promise.then(function (result) {
      that.audioSrc = "data:audio/" + "mp3" + ";base64," + result.toString().split(',')[1]
    });
  }

  encodeFileAudioBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }


  disableValidatorsFile() {
    this.formUpload.get("fileSelect").clearValidators();
    this.formUpload.get("fileSelect").updateValueAndValidity();
  }

  cleanData() {
    this.formUpload.reset();
    this.dialog.closeAll()
    this.reproductor = false;
    this.file = "";
    this.formTime.reset()
  }

  openSpinner() {
    this.dialog.open(this.spinerDialog, {
      panelClass: 'my-spinner'
    });
  }


  changePage(event: any) {
    this.getContestList(event.pageIndex, event.pageSize);
    this.indexOriginal = event.pageIndex;
    this.pageIndex = event.pageIndex;
    this.limit = event.pageSize;
  }
}


export interface Contest {
  audio: string
  audioTitle: string
  bucketName: String
  dataType: String
  idAcr: string
  idAdmin: string
  idContest: string
  nameAdmin: string
  promoContestResponse: promoContest
  releaseDate: string
  statusContest: string
}


export interface promoContest {
  active: boolean
  code: string
  description: string
  dueDate: string
  idPromo: string
  image: string
  namePromo: string
  promoType: string
  releaseDate: string
  urlPromo: string
  urlTerms: string
  idShop: string
  seconds: any
  awardType: string
}