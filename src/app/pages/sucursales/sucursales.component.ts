import { Component, OnInit, TemplateRef, ViewChild, NgZone, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SucursalesService } from '../../services/sucursales-service';
import { MapsAPILoader, MouseEvent } from '@agm/core';
import { CommonAlerts } from '../../Common/common-alerts';
import { Branches } from '../match-radios/match-radios.component';
declare var $: any;

@Component({
  selector: 'app-sucursales',
  templateUrl: './sucursales.component.html',
  styleUrls: ['./sucursales.component.css']
})
export class SucursalesComponent implements OnInit {
  myControl = new FormControl();
  schedules: string[] = ['00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30', '08:00',
    '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'];
  sheduleFilter: string[] = this.schedules;
  latitude: number = 21.501062;
  longitude: number = -104.9119241;
  zoom: number = 8;
  address: string = "";
  private geoCoder;
  sucursales: any[] = [];
  idBranch: string;
  idBranchSchedule: string;
  isUpdate = false;
  filterData: any = [];
  formSucursal: FormGroup;
  formHours: FormGroup;
  title: string = "";
  nameCommerce: string;
  isLoaded: boolean = false;
  estados: States[] = [];
  displayedColumns: string[] = ['direccion', 'telefono', 'type', 'active', 'editar', "horario", 'delete'];
  buttonAdd: string = "Agregar";
  branchTypes: BranchType[] = [
    { value: 'Principal', type: 'Principal' },
    { value: 'Sucursal', type: 'Sucursal' }
  ];
  lunes: boolean = false;
  martes: boolean = false;
  miercoles: boolean = false;
  jueves: boolean = false;
  viernes: boolean = false;
  sabado: boolean = false;
  domingo: boolean = false;

  sheduleList: any[] = [];
  addressName: string = "";
  scheduleAdd: any[] = [];

  idBranchDelete: any
  sucursal: any


  @ViewChild('search', { static: false }) searchElementRef: ElementRef;
  @ViewChild('spinner', { static: true }) spinerDialog: TemplateRef<any>;
  constructor(public fb: FormBuilder, public dialog: MatDialog,
    private activeRoute: ActivatedRoute, private sucursalesService: SucursalesService, private mapsAPILoader: MapsAPILoader, private comonAlerts: CommonAlerts,
    private ngZone: NgZone) {
    this.formSucursal = this.fb.group({
      address: ['', Validators.required],
      phoneNumber: new FormControl('', [
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.pattern('^[0-9]*$')]),
      branchType: ['', Validators.required],
      estados: ['', Validators.required],
      latitude: ['', null],
      longitude: ['', null],
    })

    this.formHours = this.fb.group({
      switchLunes: [false],
      lunesOpen: new FormControl('', [Validators.pattern('^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$')]),
      lunesClose: new FormControl('', [Validators.pattern('^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$')]),

      switchMartes: [false],
      martesOpen: new FormControl('', [Validators.pattern('^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$')]),
      martesClose: new FormControl('', [Validators.pattern('^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$')]),


      switchMiercoles: [false],
      miercolesOpen: new FormControl('', [Validators.pattern('^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$')]),
      miercolesClose: new FormControl('', [Validators.pattern('^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$')]),


      switchJueves: [false],
      juevesOpen: new FormControl('', [Validators.pattern('^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$')]),
      juevesClose: new FormControl('', [Validators.pattern('^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$')]),

      switchViernes: [false],
      viernesOpen: new FormControl('', [Validators.pattern('^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$')]),
      viernesClose: new FormControl('', [Validators.pattern('^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$')]),

      switchSabado: [false],
      sabadoOpen: new FormControl('', [Validators.pattern('^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$')]),
      sabadoClose: new FormControl('', [Validators.pattern('^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$')]),

      switchDomingo: [false],
      domingoOpen: new FormControl('', [Validators.pattern('^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$')]),
      domingoClose: new FormControl('', [Validators.pattern('^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$')]),
    })
  }


  ngOnInit() {
    this.nameCommerce = this.activeRoute.snapshot.params['nameCommerce'];
    this.getAllStates()
    this.getAllBranches();
  }



  openDialogDelete(sucursales: Branches, templateRef: TemplateRef<any>) {
    this.idBranchDelete = sucursales.idBranch;
    this.sucursal = sucursales.address;
    this.dialog.open(templateRef, { disableClose: true, panelClass: 'add-user' });
  }

  deleteBranch() {
    this.sucursalesService.deleteBranch(this.idBranchDelete).subscribe((response: any) => {
      this.comonAlerts.showSuccess(response.header.message)
      this.getAllBranches();
    }, (error) => {
      this.comonAlerts.showToastError(error)
      this.getAllBranches();
    });
  }


  // Get Current Location Coordinates
  private setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 8;
        this.getAddress(this.latitude, this.longitude);
      });
    }
  }

  loadPlaces() {
    //load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      if (this.isUpdate == false) {
        this.setCurrentLocation();
      }
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
          this.zoom = 15;
        });
      });
    });
  }


  getAddress(latitude, longitude) {
    this.geoCoder.geocode({ 'location': { lat: latitude, lng: longitude } }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          this.zoom = 20;
          this.address = results[0].formatted_address;
        } else {
          console.warn('No results found')
        }
      } else {
        console.warn('Geocoder failed due to: ' + status)
      }
    });
  }
  markerDragEnd($event: MouseEvent) {
    this.latitude = $event.coords.lat;
    this.longitude = $event.coords.lng;
    this.getAddress(this.latitude, this.longitude);
  }


  applyFilter(filterValue: string) {
    this.isLoaded = false;
    if (!filterValue) {
      this.sucursales = this.filterData;
    } else {
      this.sucursales = this.filterData.filter(x =>
        x.branches.address.trim().toLowerCase().includes(filterValue.trim().toLowerCase())
      );
    }
  }

  searchSchedules(filterValue: string) {
    if (!filterValue) {
      this.schedules = this.sheduleFilter;
    } else {
      this.schedules = this.sheduleFilter.filter(x =>
        x.trim().toLowerCase().includes(filterValue.trim().toLowerCase())
      );
    }
  }

  cleanSchedules(filterValue: string) {
    this.schedules = this.sheduleFilter;
    this.searchSchedules(filterValue)
  }

  getAllBranches() {
    this.openSpinner();
    this.sucursalesService.getAllBranches(this.activeRoute.snapshot.params['idShop']).subscribe((response: any) => {
      this.sucursales = response.data;
      this.filterData = response.data;
      this.isLoaded = true;
    }, (error) => {
      this.comonAlerts.showToastError(error)
      this.cleanData()
    });
    this.cleanData();
  }

  getAllStates() {
    this.sucursalesService.getAllStates().subscribe((response: any) => {
      this.estados = response.data;
    }, (error) => {
      this.comonAlerts.showToastError(error)
    });
  }

  openDialogHorarios(templateRef: TemplateRef<any>, shedules: any) {
    this.idBranchSchedule = shedules.idBranch;
    this.sheduleList = shedules.shedules;
    this.addressName = shedules.address;
    this.dialog.open(templateRef, {
      panelClass: 'horarios-modal'
    });
  }

  setValuesSchedules(schedules: any[]) {
    schedules.forEach(sc => {
      switch (sc.day) {
        case "Lunes":
          if (sc.isClosed == true) {
            this.lunes = true;
            this.setGenericValue('lunesOpen', 'lunesClose', sc.hourOpen, sc.hourClose, true, 'switchLunes', 'textLunes');
          }
          break;
        case "Martes":
          if (sc.isClosed == true) {
            this.martes = true;
            this.setGenericValue('martesOpen', 'martesClose', sc.hourOpen, sc.hourClose, true, 'switchMartes', 'textMartes');
          }
          break;
        case "Miercoles":
          if (sc.isClosed == true) {
            this.miercoles = true;
            this.setGenericValue('miercolesOpen', 'miercolesClose', sc.hourOpen, sc.hourClose, true, 'switchMiercoles', 'textMiercoles');
          }
          break;
        case "Jueves":
          if (sc.isClosed == true) {
            this.jueves = true;
            this.setGenericValue('juevesOpen', 'juevesClose', sc.hourOpen, sc.hourClose, true, 'switchJueves', 'textJueves');
          }
          break;
        case "Viernes":
          if (sc.isClosed == true) {
            this.viernes = true;
            this.setGenericValue('viernesOpen', 'viernesClose', sc.hourOpen, sc.hourClose, true, 'switchViernes', 'textViernes');
          }
          break;
        case "Sabado":
          if (sc.isClosed == true) {
            this.sabado = true;
            this.setGenericValue('sabadoOpen', 'sabadoClose', sc.hourOpen, sc.hourClose, true, 'switchSabado', 'textSabado');
          }
          break;
        case "Domingo":
          if (sc.isClosed == true) {
            this.domingo = true;
            this.setGenericValue('domingoOpen', 'domingoClose', sc.hourOpen, sc.hourClose, true, 'switchDomingo', 'textDomingo');
          }
          break;
        default:
          console.error("Error el el swith entro al default.")
      }
    })
  }

  setGenericValue(textOpen: string, textClose: string, valueOpen: string, valueClose: string, check: boolean, swithText: string, idText: string) {
    this.formHours.controls[textOpen].setValue(valueOpen);
    this.formHours.controls[textClose].setValue(valueClose);
    this.formHours.controls[swithText].setValue(check);
    $("#" + idText).text("Abierto");
    if (check == true) {
      this.setValidatorsWithCheck(check, textOpen);
      this.setValidatorsWithCheck(check, textClose);
    }
  }

  openAddHorarios(templateRef: TemplateRef<any>) {
    this.dialog.closeAll();
    this.formHours.reset()
    this.resetVariables()
    this.resetValidators()
    this.dialog.open(templateRef, {
      panelClass: 'add-sucursal', disableClose: true
    });
    this.setValuesSchedules(this.sheduleList);
  }

  resetValidators() {
    this.formHours.get("lunesOpen").clearValidators();
    this.formHours.get("martesOpen").clearValidators();
    this.formHours.get("miercolesOpen").clearValidators();
    this.formHours.get("juevesOpen").clearValidators();
    this.formHours.get("viernesOpen").clearValidators();
    this.formHours.get("sabadoOpen").clearValidators();
    this.formHours.get("domingoOpen").clearValidators();
    this.formHours.get("lunesClose").clearValidators();
    this.formHours.get("martesClose").clearValidators();
    this.formHours.get("miercolesClose").clearValidators();
    this.formHours.get("juevesClose").clearValidators();
    this.formHours.get("viernesClose").clearValidators();
    this.formHours.get("sabadoClose").clearValidators();
    this.formHours.get("domingoClose").clearValidators();
  }

  resetVariables() {
    this.lunes = false;
    this.martes = false;
    this.miercoles = false;
    this.jueves = false;
    this.viernes = false;
    this.sabado = false;
    this.domingo = false;
  }

  openDialogAddSucursal(templateRef: TemplateRef<any>) {
    this.zoom = 8;
    this.cleanData();
    this.isUpdate = false;
    this.buttonAdd = "Agregar";
    this.title = "¿Deseas registrar una nueva sucursal?";
    this.dialog.open(templateRef, {
      panelClass: 'add-sucursal'
    });
    this.loadPlaces()
  }

  cleanData() {
    this.formSucursal.reset();
    this.dialog.closeAll()
    this.formHours.reset();
    this.resetVariables()
    this.latitude = 21.501062;
    this.longitude = -104.9119241;
    this.address = "";
  }

  openSpinner() {
    this.dialog.open(this.spinerDialog, {
      panelClass: 'my-spinner'
    });
  }

  openDialogUpdate(sucursal: any, templateRef: TemplateRef<any>) {
    this.title = "¿Deseas actualizar la sucursal?";
    this.isUpdate = true;
    this.dialog.open(templateRef, { disableClose: true, panelClass: 'add-sucursal' });
    this.loadPlaces()
    this.formSucursal.controls['address'].setValue(sucursal.branches.address);
    this.formSucursal.controls['phoneNumber'].setValue(sucursal.branches.phoneNumber);
    this.formSucursal.controls['branchType'].setValue(sucursal.branches.type);
    this.formSucursal.controls['estados'].setValue(sucursal.branches.idState);
    this.buttonAdd = "Actualizar";
    this.zoom = 15;
    const lat = Number(sucursal.branches.latitude)
    const long = Number(sucursal.branches.longitude)
    this.idBranch = sucursal.branches.idBranch;
    this.longitude = long;
    this.latitude = lat;
    this.address = sucursal.branches.address;
  }


  addSucursal() {
    if (!this.formSucursal.valid) {
      return;
    }
    
    /*
    if (this.address == "") {
      this.comonAlerts.showWarnning("Mueve el marcador a tu dirección.")
      return;
    }
    */
   
    this.openSpinner();

    if (this.isUpdate == true) {
      var params = {
        idBranch: this.idBranch,
        address: this.formSucursal.value.address,
        phoneNumber: this.formSucursal.value.phoneNumber,
        branchType: this.formSucursal.value.branchType,
        latitude: this.latitude,
        longitude: this.longitude,
        idShop: this.activeRoute.snapshot.params['idShop'],
        idState: this.formSucursal.value.estados
      };
      let body = JSON.stringify(params);
      this.sucursalesService.updateBranch(body).subscribe((response: any) => {
        this.comonAlerts.showSuccess(response.header.message)
        this.getAllBranches()
      }, (error) => {
        this.comonAlerts.showToastError(error)
        this.cleanData()
      });
    } else {
      var param = {
        address: this.formSucursal.value.address,
        phoneNumber: this.formSucursal.value.phoneNumber,
        branchType: this.formSucursal.value.branchType,
        latitude: this.latitude,
        longitude: this.longitude,
        idShop: this.activeRoute.snapshot.params['idShop'],
        idState: this.formSucursal.value.estados
      };
      let body = JSON.stringify(param);
      this.sucursalesService.addBranch(body).subscribe((response: any) => {
        this.comonAlerts.showSuccess(response.header.message)
        this.getAllBranches()
      }, (error) => {
        this.comonAlerts.showToastError(error)
        this.cleanData()
      });
    }

  }


  changeStatusActive(event: any, sucursal: any) {
    var param = {
      idBranch: sucursal.idBranch,
      active: event.checked,
      idShop: sucursal.idShop
    }
    let body = JSON.stringify(param);

    this.sucursalesService.changeStatusBranch(body).subscribe((response: any) => {
      this.comonAlerts.showSuccess(response.header.message)
      this.getAllBranches();
    }, (error) => {
      this.comonAlerts.showToastError(error)
      this.getAllBranches();
    });
  }

  changeSlide(event: any) {
    var idSwitch = event.source.id;
    switch (idSwitch) {
      case "slideLunes":
        this.changeTextSlide(event.checked, "textLunes", "lunesOpen", "lunesClose")
        break;
      case "slideMartes":
        this.changeTextSlide(event.checked, "textMartes", "martesOpen", "martesClose")
        break;
      case "slideMiercoles":
        this.changeTextSlide(event.checked, "textMiercoles", "miercolesOpen", "miercolesClose")
        break;
      case "slideJueves":
        this.changeTextSlide(event.checked, "textJueves", "juevesOpen", "juevesClose")
        break;
      case "slideViernes":
        this.changeTextSlide(event.checked, "textViernes", "viernesOpen", "viernesClose")
        break;
      case "slideSabado":
        this.changeTextSlide(event.checked, "textSabado", "sabadoOpen", "sabadoClose")
        break;
      case "slideDomingo":
        this.changeTextSlide(event.checked, "textDomingo", "domingoOpen", "domingoClose")
        break;
      default:
        console.error("Error el el swith entro al default.")
    }
  }

  changeTextSlide(checked: boolean, idText: string, textOpen: string, textClose: string) {
    if (checked == true) {
      $("#" + idText).text("Abierto");
      this.showAndHideSchedule(true, idText)
    } else {
      $("#" + idText).text("Cerrado");
      this.showAndHideSchedule(false, idText)
      this.formHours.controls[textOpen].setValue("");
      this.formHours.controls[textClose].setValue("");
    }
  }

  setValidatorsWithCheck(showHide: boolean, controlName: string) {
    showHide ? this.formHours.get(controlName).setValidators([Validators.required, Validators.pattern('^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$')]) : this.formHours.get(controlName).clearValidators();
    this.formHours.get(controlName).updateValueAndValidity();
  }
  showAndHideSchedule(showHide: boolean, idSwitch: string) {
    switch (idSwitch) {
      case "textLunes":
        this.lunes = showHide;
        this.setValidatorsWithCheck(showHide, "lunesOpen");
        this.setValidatorsWithCheck(showHide, "lunesClose");
        break;
      case "textMartes":
        this.martes = showHide;
        this.setValidatorsWithCheck(showHide, "martesOpen");
        this.setValidatorsWithCheck(showHide, "martesClose");
        break;
      case "textMiercoles":
        this.miercoles = showHide;
        this.setValidatorsWithCheck(showHide, "miercolesOpen");
        this.setValidatorsWithCheck(showHide, "miercolesClose");
        break;
      case "textJueves":
        this.jueves = showHide;
        this.setValidatorsWithCheck(showHide, "juevesOpen");
        this.setValidatorsWithCheck(showHide, "juevesClose");
        break;
      case "textViernes":
        this.viernes = showHide;
        this.setValidatorsWithCheck(showHide, "viernesOpen");
        this.setValidatorsWithCheck(showHide, "viernesClose");
        break;
      case "textSabado":
        this.sabado = showHide;
        this.setValidatorsWithCheck(showHide, "sabadoOpen");
        this.setValidatorsWithCheck(showHide, "sabadoClose");
        break;
      case "textDomingo":
        this.domingo = showHide;
        this.setValidatorsWithCheck(showHide, "domingoOpen");
        this.setValidatorsWithCheck(showHide, "domingoClose");
        break;
      default:
        console.error("Error el el swith entro al default.")
    }
  }

  addSchedule() {
    if (!this.formHours.valid) {
      return;
    }
    this.openSpinner();
    var params = {
      schedules: [{
        weekDay: "Lunes",
        hourOpen: this.formHours.value.lunesOpen,
        hourClose: this.formHours.value.lunesClose,
        isClosed: this.formHours.value.switchLunes == null ? false : this.formHours.value.switchLunes
      },
      {
        weekDay: "Martes",
        hourOpen: this.formHours.value.martesOpen,
        hourClose: this.formHours.value.martesClose,
        isClosed: this.formHours.value.switchMartes == null ? false : this.formHours.value.switchMartes
      },
      {
        weekDay: "Miercoles",
        hourOpen: this.formHours.value.miercolesOpen,
        hourClose: this.formHours.value.miercolesClose,
        isClosed: this.formHours.value.switchMiercoles == null ? false : this.formHours.value.switchMiercoles
      },
      {
        weekDay: "Jueves",
        hourOpen: this.formHours.value.juevesOpen,
        hourClose: this.formHours.value.juevesClose,
        isClosed: this.formHours.value.switchJueves == null ? false : this.formHours.value.switchJueves
      },
      {
        weekDay: "Viernes",
        hourOpen: this.formHours.value.viernesOpen,
        hourClose: this.formHours.value.viernesClose,
        isClosed: this.formHours.value.switchViernes == null ? false : this.formHours.value.switchViernes
      },
      {
        weekDay: "Sabado",
        hourOpen: this.formHours.value.sabadoOpen,
        hourClose: this.formHours.value.sabadoClose,
        isClosed: this.formHours.value.switchSabado == null ? false : this.formHours.value.switchSabado
      },
      {
        weekDay: "Domingo",
        hourOpen: this.formHours.value.domingoOpen,
        hourClose: this.formHours.value.domingoClose,
        isClosed: this.formHours.value.switchDomingo == null ? false : this.formHours.value.switchDomingo
      }], idBranch: this.idBranchSchedule
    };
    let body = JSON.stringify(params);
    this.sucursalesService.addOrUpdateSchedule(body).subscribe((response: any) => {
      this.comonAlerts.showSuccess(response.header.message)
      this.getAllBranches()
    }, (error) => {
      this.comonAlerts.showToastError(error)
      this.cleanData()
    });
  }

}

export interface BranchType {
  value: string;
  type: string;
}

export interface States {
  idState: number
  state: string
}
