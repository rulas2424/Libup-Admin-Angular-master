import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Md5 } from "md5-typescript";
import { CommonAlerts } from '../../Common/common-alerts';
import { LlamadasApiService } from '../../services/llamadas-api.service';
import { MustMatch } from '../../_helpers/must-match.validator';
import { BroadcasterService } from '../../services/radiodifusoras.service';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-users-admins',
  templateUrl: './users-admins.component.html',
  styleUrls: ['./users-admins.component.css']
})
export class UsersAdminsComponent implements OnInit {
  templateRef: TemplateRef<any>;
  limit: number = 10;
  totalLength: number = 0;
  pageIndex: number = 0;
  pageLimit: number[] = [5, 10, 20];
  formUsers: FormGroup;
  isLoaded: boolean = false;
  title: string = "";
  button: string = "Agregar";
  idUser: string;
  public users: UserAdmin[] = [];
  public filterData: UserAdmin[] = [];
  public displayedColumns = ['name', 'email', 'active', 'phone', 'type', 'update', 'password'
  ];
  userType: AdminType[] = [
    { value: 'Radio', type: 'Radio' },
    { value: 'Comercio', type: 'Comercio' }
  ];
  isUpdate: boolean = false;
  isRequired: boolean = true;
  longitudOriginal: number = 0;
  indexOriginal: number = 0;
  shops: any[] = [];
  shopsFilter: any[] = [];
  broadcaster: any[] = [];
  broadcasterFilter: any[] = [];
  idShop: string = "";
  idBroadcaster: string = "";
  shopSelect: boolean = false;
  radioSelect: boolean = false;
  passForm: FormGroup;
  @ViewChild('spinner', { static: true }) spinerDialog: TemplateRef<any>;
  idAdmin: string;
  emailAdmin: string;
  constructor(public fb: FormBuilder, public dialog: MatDialog,
    private userAdminService: UserService, private comonAlerts: CommonAlerts, private apiService: LlamadasApiService, private broadcasterService: BroadcasterService,
    private router: Router) {
    this.formUsers = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/)]],
      password: ['', Validators.required],
      phoneNumber: new FormControl('', [
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.pattern('^[0-9]*$')]),
      typeAdmin: [''],
      shop: ['', Validators.required],
      broadcas: ['', Validators.required]
    })

    this.passForm = this.fb.group({
      password: ['', [Validators.required]],
      confirmPassword: ['', Validators.required],
    }, {
        validator: MustMatch('password', 'confirmPassword')
      })
  }



  ngOnInit() {
    this.getUsersAdmin(0, this.limit);
    this.getAllShops()
    this.getAllBroadcaster()
  }

  getUsersAdmin(page: any, limit: any) {
    var param = {
      page: page,
      maxResults: limit
    };
    let body = JSON.stringify(param);
    this.openSpinner();
    this.userAdminService.getAllAdmins(body).subscribe((response: any) => {
      this.users = response.data;
      this.filterData = response.data;
      this.totalLength = response.totalElements;
      this.longitudOriginal = response.totalElements;
      this.isLoaded = true;
    }, (error) => {
      this.comonAlerts.showToastError(error)
      this.cleanData()
    });
    this.cleanData();
  }

  openDialogAddUser(templateRef: TemplateRef<any>) {
    this.cleanData();
    this.button = "Agregar";
    this.isUpdate = false;
    this.title = "¿Deseas registrar un nuevo usuario administrador?";
    this.dialog.open(templateRef, {
      panelClass: 'add-user', disableClose: true
    });
    this.isRequired = true;
    this.addValidatorsPassword()

  }

  addValidatorsPassword() {
    this.formUsers.get('password').setValidators([Validators.required]);
    this.formUsers.get('password').updateValueAndValidity();
  }

  changePassword() {
    if(!this.passForm.valid){
      return;
    }

    var params = {
      idAdmin: this.idAdmin,
      newPassword: Md5.init(this.passForm.value.password)      
    }
    let body = JSON.stringify(params);
    this.userAdminService.updatePassword(body).subscribe((response: any) => {      
      this.comonAlerts.showSuccess(response.header.message)    
      this.passForm.reset(); 
      this.getUsersAdmin(this.pageIndex, this.limit);
    }, (error) => {
      this.comonAlerts.showToastError(error)
    });
   
  }

  openDialogUpdate(usuario: UserAdmin, templateRef: TemplateRef<any>) {
    this.title = "¿Deseas actualizar el usuario administrador?";
    this.button = "Actualizar"
    this.isUpdate = true;
    this.dialog.open(templateRef, { disableClose: true, panelClass: 'add-user' });
    this.idUser = usuario.idAdmin;
    this.formUsers.controls['name'].setValue(usuario.name);
    this.formUsers.controls['lastName'].setValue(usuario.lastName);
    this.formUsers.controls['email'].setValue(usuario.email);
    this.formUsers.controls['phoneNumber'].setValue(usuario.phoneNumber);
    this.formUsers.controls['typeAdmin'].setValue(usuario.typeAdmin);
    if (usuario.typeAdmin == "Comercio") {
      this.shopSelect = true;
      this.radioSelect = false;
      this.formUsers.controls['shop'].setValue(usuario.nameShop);
      this.addValidatorsShop()
    } else if (usuario.typeAdmin == "Radio") {
      this.shopSelect = false;
      this.radioSelect = true;
      this.formUsers.controls['broadcas'].setValue(usuario.nameBroadcaster);
      this.disableValidatorsShop()
    }
    this.idShop = usuario.idShop;
    this.disableValidatorPassword()
  }


  openDialogChangePass(usuario: UserAdmin, templateRef: TemplateRef<any>) {
    this.dialog.open(templateRef, { disableClose: true, panelClass: 'add-user' });
    this.idAdmin = usuario.idAdmin;
    this.emailAdmin = usuario.email;
    this.passForm.reset();  
  }

  getAllShops() {
    this.apiService.getAllShopsSelect().subscribe((response: any) => {
      this.shops = response.data;
      this.shopsFilter = response.data;
    }, (error) => {
      this.comonAlerts.showToastError(error)
    });
  }

  searchShops(filterValue: string) {
    if (!filterValue) {
      this.shops = this.shopsFilter;
    } else {
      this.shops = this.shopsFilter.filter(x =>
        x.name.trim().toLowerCase().includes(filterValue.trim().toLowerCase())
      );
    }
  }

  
  getAllBroadcaster() {
    this.broadcasterService.getAllBroadcastersActives().subscribe((response: any) => {
      this.broadcaster = response.data;
      this.broadcasterFilter = response.data;
    }, (error) => {
      this.comonAlerts.showToastError(error)
    });
  }

  searchBroadcaster(filterValue: string) {
    if (!filterValue) {
      this.broadcaster = this.broadcasterFilter;
    } else {
      this.broadcaster = this.broadcasterFilter.filter(x =>
        x.name.trim().toLowerCase().includes(filterValue.trim().toLowerCase())
      );
    }
  }

  setIdShop(idShop: string) {
    this.idShop = idShop;
  }

  setIdBroadcaster(idBroadcaster: string) {
    this.idBroadcaster = idBroadcaster;
  }

  setValueTypeUser(value: string) {
    if (value == "Comercio") {
      this.shopSelect = true;
      this.radioSelect = false;
      this.addValidatorsShop()
      this.disableValidatorsBroadcaster();
      this.idBroadcaster = null;
    } else if (value == "Radio") {
      this.shopSelect = false;
      this.radioSelect = true;
      this.addValidatorsBroadcaster();
      this.disableValidatorsShop()
      this.idShop = null;
    }
  }

  addValidatorsShop() {
    this.formUsers.get('shop').setValidators([Validators.required]);
    this.formUsers.get('shop').updateValueAndValidity();
  }

  disableValidatorsShop() {
    this.formUsers.get("shop").clearValidators();
    this.formUsers.get("shop").updateValueAndValidity();
  }

  addValidatorsBroadcaster() {
    this.formUsers.get('broadcas').setValidators([Validators.required]);
    this.formUsers.get('broadcas').updateValueAndValidity();
  }

  disableValidatorsBroadcaster() {
    this.formUsers.get("broadcas").clearValidators();
    this.formUsers.get("broadcas").updateValueAndValidity();
  }


  disableValidatorPassword() {
    this.isRequired = false;
    this.formUsers.get("password").clearValidators();
    this.formUsers.get("password").updateValueAndValidity();
  }

  cleanData() {
    this.formUsers.reset();
    this.dialog.closeAll()
    this.clean()
    this.shopSelect = false;
  }

  openSpinner() {
    this.dialog.open(this.spinerDialog, {
      panelClass: 'my-spinner'
    });
  }

  goToBroadcaster() {
    this.router.navigateByUrl('radiodifusoras');
  }

  goToShops() {
    this.router.navigateByUrl('comercios');
  }

  addOrUpdateUser() {
    if (!this.formUsers.valid) {
      return;
    }
    this.openSpinner();
    this.pageIndex = this.indexOriginal;
    var param = {
      name: this.formUsers.value.name,
      lastName: this.formUsers.value.lastName,
      email: this.formUsers.value.email,
      password: Md5.init(this.formUsers.value.password),
      phoneNumber: this.formUsers.value.phoneNumber,
      profilePicture: "",
      typeAdmin: this.formUsers.value.typeAdmin,
      idShop: this.idShop,
      idBroadcaster: this.idBroadcaster
    };
    if (this.isUpdate == true) {
      delete param['password'];
      if (this.formUsers.value.typeAdmin == 'Radio') {
        param['idShop'] = "";
      }
      param['idAdmin'] = this.idUser;
      let body = JSON.stringify(param);
      this.userAdminService.updateUsersAdmin(body).subscribe((response: any) => {
        this.comonAlerts.showSuccess(response.header.message)
        this.getUsersAdmin(this.pageIndex, this.limit);
      }, (error) => {
        this.comonAlerts.showToastError(error)
        this.cleanData()
      });
    } else {
      let body = JSON.stringify(param);
      this.userAdminService.addUsersAdmin(body).subscribe((response: any) => {
        this.comonAlerts.showSuccess(response.header.message)
        this.getUsersAdmin(this.pageIndex, this.limit);
      }, (error) => {
        this.comonAlerts.showToastError(error)
        this.cleanData()
      });
    }
  }


  searchUsers = (value: string) => {
    if (!value) {
      this.users = this.filterData
      this.totalLength = this.longitudOriginal;
      this.pageIndex = this.indexOriginal;
    } else {
      this.pageIndex = 0;
      var searchTexto = value.trim().toLocaleLowerCase();
      var param = {
        searchText: searchTexto,
        page: 0
      };
      let body = JSON.stringify(param);
      this.userAdminService.searchUsers(body).subscribe((response: any) => {
        this.users = response.data;
        this.totalLength = response.totalElements;
      }, (error) => {
        this.comonAlerts.showToastError(error)
        this.cleanData()
      });
    }
  }

  clean() {
    $('#search').val('');
  }

  changePage(event: any) {
    this.clean()
    this.getUsersAdmin(event.pageIndex, event.pageSize);
    this.indexOriginal = event.pageIndex;
    this.pageIndex = event.pageIndex;
    this.limit = event.pageSize;
  }

  changeStatusActive(event: any, idAdmin: string) {
    this.pageIndex = this.indexOriginal;
    var param = {
      idUser: idAdmin,
      active: event.checked
    }
    let body = JSON.stringify(param);
    this.userAdminService.changeStatus(body).subscribe((response: any) => {
      this.comonAlerts.showSuccess(response.header.message)
      this.getUsersAdmin(this.pageIndex, this.limit);
    }, (error) => {
      this.comonAlerts.showToastError(error)
      this.getUsersAdmin(this.pageIndex, this.limit);
    });
    this.clean()
  }

}

export interface UserAdmin {
  idAdmin: string,
  name: string;
  lastName: string;
  email: string;
  profilePicture: string;
  phoneNumber: string;
  typeAdmin: string;
  idShop: string;
  nameShop: string
  idBroadcaster: string;
  nameBroadcaster: string;
}

export interface AdminType {
  value: string;
  type: string;
}