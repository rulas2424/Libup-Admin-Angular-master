import { Component, OnInit, ViewChild, TemplateRef, NgZone } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { MatDialog, MatPaginator } from '@angular/material';
import { PromotionsService } from '../../services/promotions.service';
import { CommonAlerts } from '../../Common/common-alerts';
import { MapsAPILoader } from '@agm/core';
import { ApiConfigService } from '../../services/api-config.service';
import { Router } from '@angular/router';
import { Notifications } from '../contest-commerce/contest-commerce.component';
import { UserService } from '../../services/user.service';
import { DomSanitizer } from '@angular/platform-browser';
declare var $: any;

@Component({
  selector: 'app-contest-direct',
  templateUrl: './contest-direct.component.html',
  styleUrls: ['./contest-direct.component.css']
})
export class ContestDirectComponent implements OnInit {
  public loading = false;
  notifications: Notifications
  @ViewChild('iframeModal', { static: true }) iframeModal: TemplateRef<any>;
  urlPayout: any
  idShopSelect: string;
  @ViewChild('spinner', { static: true }) spinerDialog: TemplateRef<any>;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  premios: Premios[] = [];
  limit: number = 5;
  totalLength: number = 0;
  pageIndex: number = 0;
  pageLimit: number[] = [5, 10];
  isLoaded: boolean = false;
  namePremio: string = "";
  pathImage: string = "";
  idPromo: string = "";
  serverImages: string;
  commerceName: string;
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
  imagePremio: string;
  constructor(private cookieService: CookieService, public dialog: MatDialog, private premiosService: PromotionsService,
    private comonAlerts: CommonAlerts, private mapsAPILoader: MapsAPILoader, private ngZone: NgZone,
    private apiconf: ApiConfigService, private router: Router, private userAdminService: UserService, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.commerceName = this.cookieService.get('nameShop')
    this.serverImages = this.apiconf.serverImages + "/promos/"
    this.getAwarsActives(this.pageIndex, this.limit)
    this.setCurrentLocation(this.cookieService.get('latitude'), this.cookieService.get('longitude'), 12)
  }

  
  redirect(){
    this.router.navigate(['/agregar/premios']);    
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

  changeCheckNotificate(ev: any) {
    if (ev.checked == true) {
      this.checkedNotificate = true;
    } else if (ev.checked == false) {
      this.checkedNotificate = false;
    }
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

  openDialogNotfs(premio: Premios, templateRef: TemplateRef<any>) {
    var that = this
    this.userAdminService.verifyPlan(premio.idShop).subscribe((response: any) => {
      this.notifications = response.data
      if (this.notifications.notificationsUsed >= this.notifications.notificationsAllowed) {
        this.loading = true
        this.urlPayout = this.sanitizer.bypassSecurityTrustResourceUrl('https://libup.mx/payment/indexNotifications.php?uid_shop=' + premio.idShop +'&id_admin=' + this.cookieService.get("isLogin"))
        this.openIframe()
        return;
      } else {
        setTimeout(function () {
          that.loadPlaces()
        }, 1000);
    
        this.cleanData()
        this.checked = false;
        this.checkedNotificate = premio.withNotify;
        this.namePremio = premio.name;
        this.idPromo = premio.idPromo;
        this.pathImage = premio.image;
        this.dialog.open(templateRef);
      }
    }, (error) => {
      console.warn(error)
      this.comonAlerts.showToastError(error)
    });    
  }

  cleanData() {
    this.dialog.closeAll()
    this.checked = false;
    this.checkedNotificate = false;
  }


  getAwarsActives(page: number, limit: number) {
    var idShop = this.cookieService.get('shop');
    this.idShopSelect = idShop;
    this.openSpinner();
    var param = {
      idShop: idShop,
      page: page,
      maxResults: limit
    }
    let body = JSON.stringify(param);
    this.premiosService.getAwardsForIdShop(body).subscribe((response: any) => {
      this.totalLength = response.totalElements;
      this.cleanData()
      this.premios = response.data;
    }, (error) => {
      this.comonAlerts.showToastError(error)
      this.cleanData()
    });
    this.isLoaded = true;
  }

  openSpinner() {
    this.dialog.open(this.spinerDialog, {
      panelClass: 'my-spinner'
    });
  }

  changePage(event: any) {
    this.getAwarsActives(event.pageIndex, event.pageSize);
    this.pageIndex = event.pageIndex;
    this.limit = event.pageSize;
  }

  openImage(nameModal: TemplateRef<any>, premioImage: string) {
    this.dialog.open(nameModal);
    this.imagePremio = premioImage;
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

  sendNotifications() {
    var idShop = this.cookieService.get('shop');
    var param = {
      idPromo: this.idPromo,
      latitude: this.latitude + "",
      longitude: this.longitude + "",
      idShop: idShop,
      namePromo: this.namePremio,
      pathImage: this.pathImage,
      rangeKilometers: Number(this.kilometers),
      allUsers: this.checked,
      sendNotification: this.checkedNotificate,
      typeNotify: "Directo"
    }
    let body = JSON.stringify(param);
      this.openSpinner();
      this.premiosService.sendNotificationWinnerDirect(body).subscribe((response: any) => {
        this.comonAlerts.showSuccess(response.header.message)
        this.refreshDataPlan()
        this.cleanData()
      }, (error) => {
        this.comonAlerts.showToastError(error)
        this.cleanData()
      });

  }
}
export interface Premios {
  active: boolean
  code: string
  description: string
  dueDate: string
  idPromo: string
  idShop: string
  image: string
  isDeleted: boolean
  name: string
  nameShop: string
  promoType: string
  rCategoryPromos: CategoryPromos[]
  rPromoBranches: PromoBranches[]
  releaseDate: string
  urlPromo: string
  urlTerms: string
  seconds: any
  withNotify: boolean
}

export interface CategoryPromos {
  idCategory: string
  idRcategorypromo: string
  nameCategory: string
}

export interface PromoBranches {
  address: string
  idBranch: string
  idPromoBranch: string
}