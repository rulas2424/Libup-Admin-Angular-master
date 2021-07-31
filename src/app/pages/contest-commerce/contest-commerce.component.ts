import { Component, OnInit, TemplateRef, ViewChild, PipeTransform, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CommonAlerts } from '../../Common/common-alerts';
import { ContestApiService } from '../../services/contest-service';
import { CookieService } from 'ngx-cookie-service';
import { ApiConfigService } from '../../services/api-config.service';
import { ToastrService } from 'ngx-toastr';
import { MapsAPILoader } from '@agm/core';
import { UserService } from '../../services/user.service';
import { DomSanitizer } from '@angular/platform-browser';
declare var $: any;
@Component({
  selector: 'app-contest-commerce',
  templateUrl: './contest-commerce.component.html',
  styleUrls: ['./contest-commerce.component.css']
})
export class ContestCommerceComponent implements OnInit, PipeTransform {
  public loading = false;
  notifications: Notifications
  @ViewChild('iframeModal', { static: true }) iframeModal: TemplateRef<any>;
  urlPayout: any

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
  namePremio: string;
  timmer: any;
  transformsTime: any;
  seconds: any
  public displayedColumns = ['premio', 'status', 'type', 'release', 'lanzar', 'end'
  ];
  longitudOriginal: number = 0;
  indexOriginal: number = 0;
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
    private contestService: ContestApiService, private cookieService: CookieService,
    private mapsAPILoader: MapsAPILoader, private ngZone: NgZone, private apiConf: ApiConfigService,
    private toastr: ToastrService, private userAdminService: UserService, private sanitizer: DomSanitizer) {
    this.formUpload = this.fb.group({
      name: ['', Validators.required],
      fileSelect: ['', Validators.required]
    })

    this.formTime = this.fb.group({
      time: new FormControl('', [
        // Validators.required, Validators.pattern('^[0-9]*$'), Validators.max(apiConf.tiempoSegundos)]),
        Validators.required, Validators.pattern('^[0-9]*$')]),
    })
  }

  refreshDataPlan() {
    this.userAdminService.verifyPlan(this.cookieService.get("shop")).subscribe((response: any) => {
      $("#used").text(response.data.notificationsUsed);
      $("#allowed").text(response.data.notificationsAllowed);
      $("#vence").text(response.data.dateEnded);
    }, (error) => {
      console.warn(error)
      //this.comonAlerts.showToastError(error)
    });

  }

  onLoad() {
    this.loading = false;
  }

  cancelar() {
    this.dialog.closeAll()
    this.refreshDataPlan()
  }

  openIframe() {
    this.dialog.open(this.iframeModal, {
      disableClose: true,
      panelClass: ['full-screen-modal']
    });
  }


  openDialogConfirm(contest: Contest, templateRef: TemplateRef<any>) {
    var that = this
    this.userAdminService.verifyPlan(this.cookieService.get("shop")).subscribe((response: any) => {
      this.notifications = response.data
      if (this.notifications.notificationsUsed >= this.notifications.notificationsAllowed) {
        this.loading = true
        this.urlPayout = this.sanitizer.bypassSecurityTrustResourceUrl('https://libup.mx/payment/indexNotifications.php?uid_shop=' + this.cookieService.get("shop") +'&id_admin=' + contest.idAdmin)
        this.openIframe()
        return;
      } else {
        this.formTime.reset()
        setTimeout(function () {
          that.loadPlaces()
        }, 1000);
        this.checked = false;
        this.namePremio = contest.promoContestResponse.namePromo;
        this.formTime.controls['time'].setValue(contest.promoContestResponse.seconds + this.apiConf.segundosPlus);
        this.seconds = contest.promoContestResponse.seconds + this.apiConf.segundosPlus
        this.dialog.open(templateRef);
        this.idContest = contest.idContest;
        this.acrId = contest.idAcr;
        this.idShop = contest.promoContestResponse.idShop;
      }
    }, (error) => {
      console.warn(error)
      this.comonAlerts.showToastError(error)
    });

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
      withAudio: false,
      latitude: this.latitude + "",
      longitude: this.longitude + "",
      rangeKilometers: Number(this.kilometers),
      allUsers: this.checked,
      typeNotify: "TickTear"
    }
    let body = JSON.stringify(param);
    this.openSpinner()
    this.contestService.notificateUsers(body).subscribe((response: any) => {
      this.comonAlerts.showSuccess(response.header.message)
      this.dialog.closeAll()
      this.openTimmer();
      this.pageIndex = this.indexOriginal;
      this.refreshDataPlan()
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
      containAudio: false,
      typeNotify: "TickTear"
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
    this.getContestList(0, this.limit)
    this.setCurrentLocation(this.cookieService.get('latitude'), this.cookieService.get('longitude'), 12)
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


  showWarnning(msg: any) {
    if (this.cookieService.check('isLogin')) {
      this.toastr.warning(msg, 'Advertencia!', {
        timeOut: 1500
      });
    }
  }

  getContestList(page: number, limit: number) {
    var param = {
      idShop: this.cookieService.get('shop'),
      containAudio: false,
      page: page,
      maxResults: limit
    }
    let body = JSON.stringify(param);
    this.openSpinner()
    this.contestService.getContestListByShop(body).subscribe((response: any) => {
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
      idShop: this.cookieService.get('shop'),
      containAudio: false,
      page: page,
      maxResults: limit
    }
    let body = JSON.stringify(param);
    this.contestService.getContestListByShop(body).subscribe((response: any) => {
      this.isLoaded = true;
      this.contestList = response.data;
      this.totalLength = response.totalElements;
      this.longitudOriginal = response.totalElements;
    }, (error: any) => {
      this.comonAlerts.showToastError(error)
    })

  }

  cleanData() {
    this.formUpload.reset();
    this.dialog.closeAll()
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
  containAudio: boolean
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

export interface Notifications {
  dateEnded: string
  isPlanActive: boolean
  notificationsAllowed: number
  notificationsUsed: number
}