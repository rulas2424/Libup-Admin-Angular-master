import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { EncrDecrService } from '../../classes/EncrDecrService';
import { CommonAlerts } from '../../Common/common-alerts';
import { ApiConfigService } from '../../services/api-config.service';
import { CategoriesService } from '../../services/categories-service';
import { LlamadasApiService } from '../../services/llamadas-api.service';
import { UserService } from '../../services/user.service';
declare var $: any;

@Component({
  selector: 'app-comercios',
  templateUrl: './comercios.component.html',
  styleUrls: ['./comercios.component.css']
})
export class ComerciosComponent implements OnInit {
  templateRef: TemplateRef<any>;
  limit: number = 10;
  totalLength: number = 0;
  pageIndex: number = 0;
  pageLimit: number[] = [5, 10, 20];
  formCommerce: FormGroup;
  updateFormCommerce: FormGroup;
  title: string = "";
  base64ImageFile: any;
  base64WaterMark: any;
  serverImages: string;
  serverImagesWater: string;
  idShop: string;
  logotypeModal: any;
  waterMarkModal: any;
  isLoaded: boolean = false;
  public comercios: any[] = []
  public filterData: any[] = [];
  longitudOriginal: number = 0;
  indexOriginal: number = 0;
  categories: any[] = [];
  relations: any[] = [];
  titleCommerce : string;
  marcaAgua: string;
  public displayedColumns = [
  ];
  nameCommerce: string = "";
  logotipo: string;
  @ViewChild('spinner', { static: true }) spinerDialog: TemplateRef<any>;
  constructor(public fb: FormBuilder, private apiService: LlamadasApiService, private toastr: ToastrService, public cookieService: CookieService, public dialog: MatDialog,
    private apiconf: ApiConfigService,
    private router: Router, 
    private httpClient: HttpClient,
    private comonAlerts: CommonAlerts, 
    private categoriesService: CategoriesService, private EncrDecr: EncrDecrService, private userAdminService: UserService) {
    this.formCommerce = this.fb.group({
      name: ['', Validators.required],
      fileSelect: ['', Validators.required],
      waterMark: ['', Validators.required],
      urlCommerce: ['', Validators.required]
    })
    this.updateFormCommerce = this.fb.group({
      nameUpdate: ['', Validators.required],
      updateFile: ['', Validators.required],
      waterMarkUpdate: ['', Validators.required],
      urlCommerceUpdate: ['', Validators.required]
    })
  }



  ngOnInit() {
    this.getComercios(0, this.limit);
    this.getPlanActive()
    this.getAllCategories()
    this.serverImages = this.apiconf.serverImages + "stores/";
    this.serverImagesWater = this.apiconf.serverImages + "stores/watermarks/";

    /*
    this._hopscotchService.configure([
      {
        stepIndex: 0,
        stepDef: {
          target: 'contact',
          placement: 'left',
          content: "Thank you for trying the ngx-hopscotch demo. The next step's target doesn't exist yet until you click the Next button.",
          title: "Welcome to ngx-hopscotch demo!",
          multipage: true
        }
      },
      {
        stepIndex: 1,
        stepDef: {
          target: '.list-group',
          placement: 'right',
          content: "This step was triggered from the prior step's onNext callback. The next step's target doesn't exist yet until you click the Next button.",
          title: "Router Navigated Step",
          multipage: true
        }
      },
      {
        stepIndex: 2,
        stepDef: {
          target: 'item',
          placement: 'right',
          content: "This step was triggered from the prior step's onNext callback. This is the last step, but you can click the Back button to return to the previous step.",
          title: "Auto Selected Item",
          xOffset: 80
        }
      }
    ]);
    */
  }

  getPlanActive() {    
    this.userAdminService.verifyPlan(this.cookieService.get("shop")).subscribe((response: any) => {
      $("#used").text(response.data.notificationsUsed);
      $("#allowed").text(response.data.notificationsAllowed);
      $("#vence").text(response.data.dateEnded);
    }, (error) => {
      console.warn(error)
      this.router.navigateByUrl("/login");
    });
  }

  decriptValue(){
    var decrypted = this.EncrDecr.get(this.apiconf.encript, this.cookieService.get('rol').toString());  
    return decrypted.toString();
  }

  getComercios(page: any, limit: any) {
    if (this.decriptValue() == "SuperAdmin") {
      this.displayedColumns = ['name', 'active', 'image', 'update']
      this.titleCommerce = "Comercios"
      var param = {
        page: page,
        maxResults: limit
      };
      let body = JSON.stringify(param);
      this.openSpinner();
      this.apiService.getAllComercios(body).subscribe((response: any) => {
        if (response.data.shops.length > 0) {
          this.comercios = response.data.shops;
          this.totalLength = response.totalElements;
          this.longitudOriginal = response.totalElements;
          this.filterData = response.data.shops;
          this.isLoaded = true;
        }
        this.dialog.closeAll();
      }, (error) => {
        this.comonAlerts.showToastError(error)
      });
      this.cleanData();
    } else if(this.decriptValue() == "Comercio"){
      this.titleCommerce = "Comercio"
      this.displayedColumns = ['name', 'image', 'sucursales', 'categorias', 'update']
      this.apiService.getCommerceById(this.cookieService.get('shop')).subscribe((response: any) => {      
          this.comercios = response.data;
          this.totalLength = response.data.length;          
          this.isLoaded = true;                
      }, (error) => {
        this.comonAlerts.showToastError(error)
      });
      this.cleanData();
    }

  }

  searchCommerces = (value: string) => {
    if (!value) {
      this.comercios = this.filterData
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
      this.apiService.searchCommerces(body).subscribe((response: any) => {
        this.comercios = response.data.shops;
        this.totalLength = response.totalElements;
      }, (error) => {
        this.comonAlerts.showToastError(error)
        this.cleanData()
      });
    }
  }

  openDialogAddCommerce(templateRef: TemplateRef<any>) {
    this.cleanData();
    this.title = "¿Deseas registrar un nuevo comercio?";
    this.dialog.open(templateRef, {  width: window.innerWidth + 'px', disableClose: true }).afterClosed().subscribe(result => {
      //this.getComercios(0, this.limit);
    });
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

  onFileChangeUpdate() {
    let file = (<HTMLInputElement>document.getElementById('updateFile')).files[0];
    var promise = this.encodeImagetoBase64(file);
    let that = this;
    let toArray = file.name.split(".");
    promise.then(function (result) {
      that.logotipo = "data:image/" + toArray[1] + ";base64," + result.toString().split(',')[1]
      var base64result = result.toString().split(',')[1]
      that.base64ImageFile = base64result;
    });

  }


  onFileChangeMark() {
    let file = (<HTMLInputElement>document.getElementById('waterMark')).files[0];
    var promise = this.encodeImagetoBase64(file);
    let that = this;
    let toArray = file.name.split(".");
    promise.then(function (result) {
      that.marcaAgua = "data:image/" + toArray[1] + ";base64," + result.toString().split(',')[1]
      var base64result = result.toString().split(',')[1]
      that.base64WaterMark = base64result;
    });

  }

  onFileChangeMarkUpdate() {
    let file = (<HTMLInputElement>document.getElementById('waterMarkUpdate')).files[0];
    var promise = this.encodeImagetoBase64(file);
    let that = this;
    let toArray = file.name.split(".");
    promise.then(function (result) {
      that.marcaAgua = "data:image/" + toArray[1] + ";base64," + result.toString().split(',')[1]
      var base64result = result.toString().split(',')[1]
      that.base64WaterMark = base64result;
    });

  }

  goToAddCategories() {
    this.router.navigateByUrl('categorias');
  }


  onUpdateFileChange() {
    let file = (<HTMLInputElement>document.getElementById('updateFile')).files[0];
    var promise = this.encodeImagetoBase64(file);
    let that = this;
    promise.then(function (result) {
      var base64result = result.toString().split(',')[1]
      that.base64ImageFile = base64result;
    });

  }
  openDialogUpdate(commerce: any, templateRef: TemplateRef<any>) {
    this.title = "¿Deseas actualizar el comercio?";
    this.dialog.open(templateRef, { width: window.innerWidth + 'px',disableClose: true }).afterClosed().subscribe((result: boolean) => {
      //this.getComercios(0, this.limit);
    });
    this.updateFormCommerce.controls['nameUpdate'].setValue(commerce.name);
    this.updateFormCommerce.controls['urlCommerceUpdate'].setValue(commerce.urlCommerce);
    this.idShop = commerce.id_shop;
    this.logotypeModal = commerce.logotype;
    this.waterMarkModal = commerce.waterMark;
  }

  cleanData() {
    this.formCommerce.reset();
    this.updateFormCommerce.reset()
    this.base64ImageFile = "";
    this.base64WaterMark = "";
    this.logotipo = "";
    this.marcaAgua = "";
    this.dialog.closeAll()
    this.clean()
  }

  openSpinner() {
    this.dialog.open(this.spinerDialog, {
      panelClass: 'my-spinner'
    });
  }

  updateCommerce(updateForm: any) {
    if (updateForm.value.nameUpdate.length == 0) {
      return;
    }
    this.openSpinner();
    this.pageIndex = this.indexOriginal;
    var param = {
      id_shop: this.idShop,
      name: updateForm.value.nameUpdate,
      id_admin: this.cookieService.get('isLogin'),
      logotype: this.base64ImageFile,
      waterMark:  this.base64WaterMark,
      urlCommerce: updateForm.value.urlCommerceUpdate
    };
    let body = JSON.stringify(param);    
    this.apiService.updateCommerce(body).subscribe((response: any) => {
      this.comonAlerts.showSuccess(response.header.message)
      this.getComercios(this.pageIndex, this.limit);
    }, (error) => {
      this.comonAlerts.showToastError(error)
      this.cleanData()
    });
  }

  addCommerce(commerceForm: any) {
    var imgVal = $('#selectFile').val();
    var transparent = $('#waterMark').val();
    if (imgVal == '') {
      this.showWarnning("El logotipo es requerido.")
      return false;
    }
    if (transparent == '') {
      this.showWarnning("La marca de agua es requerida.")
      return false;
    }
    if (!commerceForm.valid) {
      return;
    }
    this.pageIndex = this.indexOriginal;
    this.openSpinner();
    var param = {
      name: commerceForm.value.name,
      id_admin: this.cookieService.get('isLogin'),
      logotype: this.base64ImageFile,
      waterMark:  this.base64WaterMark,
      urlCommerce: commerceForm.value.urlCommerce
    };
    let body = JSON.stringify(param);
    this.apiService.addCommerce(body).subscribe((response: any) => {
      this.comonAlerts.showSuccess(response.header.message)
      this.getComercios(this.pageIndex, this.limit);
    }, (error) => {
      this.comonAlerts.showToastError(error)
      this.cleanData();
    });
  }

  encodeImagetoBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  clean() {
    $('#search').val('');
  }

  changePage(event: any) {
    this.clean()
    this.getComercios(event.pageIndex, event.pageSize);
    this.indexOriginal = event.pageIndex;
    this.pageIndex = event.pageIndex;
    this.limit = event.pageSize;
  }

  changeStatusActive(event: any, id_shop: string) {
    this.pageIndex = this.indexOriginal;
    var param = {
      id_shop: id_shop,
      active: event.checked
    }
    let body = JSON.stringify(param);

    this.apiService.changeStatusCommerce(body).subscribe((response: any) => {
      this.comonAlerts.showSuccess(response.header.message)
      this.getComercios(this.pageIndex, this.limit);
    }, (error) => {
      this.comonAlerts.showToastError(error)
      this.getComercios(this.pageIndex, this.limit);
    });
    this.clean()
  }

  goToSucursales(idShop: string, nameShop: string) {
    this.router.navigateByUrl('sucursales/' + nameShop + "/" + idShop);
  }

  openDialogAddRelations(commerce: any, templateRef: TemplateRef<any>) {
    this.nameCommerce = commerce.name;
    this.dialog.open(templateRef, {
      panelClass: 'add-user', disableClose: true
    });
    this.getAllRelationsByIdShop(commerce.id_shop)
  }

  getAllRelationsByIdShop(idShop: string) {
    this.idShop = idShop;
    this.categoriesService.getAllRelationsByIdShop(idShop).subscribe((response: any) => {
      this.relations = response.relations;
    }, (error) => {
      this.comonAlerts.showToastError(error)
    });
  }

  getAllCategories() {
    this.openSpinner();
    this.categoriesService.finndAllCategoriesActives().subscribe((response: any) => {
      this.categories = response.data.categoryList;
    }, (error) => {
      this.comonAlerts.showToastError(error)
    });
    this.cleanData();
  }

  addDataRelations(category: any) {
    if (this.relations.find((test) => test.nameCategory === category.name) === undefined) {
      this.relations.push({ "nameCategory": category.name, "idCategory": category.idCategory });
    } else {
      this.comonAlerts.showWarnning("La categoría ya fue agregada al comercio.")
    }
  }

  public removeDataRelations(indice: any) {
    this.relations.splice(indice, 1);
  }
  openImage(nameModal: TemplateRef<any>, logotype: string) {
    this.dialog.open(nameModal);
    this.logotypeModal = logotype;
  }
  

  openModalImage(nameModal: any) {
    this.dialog.open(nameModal);
  }
  saveRelations() {
    var param = {
      relations: this.relations,
      idShop: this.idShop
    }
    let body = JSON.stringify(param);
    this.categoriesService.saveOrUpdateRelations(body).subscribe((response: any) => {
      this.comonAlerts.showSuccess(response.header.message)
    }, (error) => {
      this.comonAlerts.showToastError(error)
    });
    this.dialog.closeAll()
  }

  showWarnning(msg: any) {
    if (this.cookieService.check('isLogin')) {
      this.toastr.warning(msg, 'Advertencia!', {
        timeOut: 1500
      });
    }
  }

}
