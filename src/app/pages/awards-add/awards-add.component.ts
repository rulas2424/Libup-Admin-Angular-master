import { Component, OnInit, ViewChild, TemplateRef } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { PromotionsService } from "../../services/promotions.service";
import { CommonAlerts } from "../../Common/common-alerts";
import { MatDialog, MatOption } from "@angular/material";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from "@angular/forms";
import { SucursalesService } from "../../services/sucursales-service";
import { Router } from "@angular/router";
import { CategoriesService } from "../../services/categories-service";
import { DatePipe } from "@angular/common";
import { ApiConfigService } from "../../services/api-config.service";
import { ContestApiService } from "../../services/contest-service";
import { BroadcasterService } from "../../services/radiodifusoras.service";
declare var $: any;
@Component({
  selector: "app-awards-add",
  templateUrl: "./awards-add.component.html",
  styleUrls: ["./awards-add.component.css"],
})
export class AwardsAddComponent implements OnInit {
  title: string = "";
  promociones: Promos[] = [];
  promosOrDiscounts: Promos[] = [];
  limit: number = 5;
  totalLength: number = 0;
  pageIndex: number = 0;
  pageLimit: number[] = [5, 10];
  isLoaded: boolean = false;
  formPromos: FormGroup;
  formBranches: FormGroup;
  formCategories: FormGroup;
  base64ImageFile: any;
  base64ImageLostFile: any;
  isEditable = true;
  branchesList: any[] = [];
  relationBranchList: any[] = [];
  relationCateList: any[] = [];
  categoriesList: CategoryPromos[] = [];
  serverImages: string;
  serverImagesLost: string;
  imagePromo: string;
  imagePromoLost: string;
  isUpdate: boolean = false;
  selectedAttributes: any[] = [];
  idPromotion: string;
  textEnd: string;
  textButonSave: string;
  premioConcurso: string;
  imageConcurso: string;
  idPromoConcurso: string;
  idPromoDelete: string;

  minDate: any;
  minDateDueDate: any;
  maxDate: any;
  todaySystem: any;
  typePremio: any;
  notificacionValue: any;
  relationBroadcasterShop: Relations[] = [];
  premioType: GenericType[] = [
    { value: "Ticktear", type: "Ticktear" },
    { value: "Directo", type: "Directo" },
    { value: "Audio", type: "Audio" },
  ];

  notificacion: GenericType[] = [
    { value: 1, type: "Notificación" },
    { value: 0, type: "Sin Notificación" },
  ];
  @ViewChild("spinner", { static: true }) spinerDialog: TemplateRef<any>;
  @ViewChild("allSelected", { static: false }) private allSelected: MatOption;
  @ViewChild("allSelectedCat", { static: false })
  private allSelectedCat: MatOption;
  constructor(
    private cookieService: CookieService,
    private promotionsService: PromotionsService,
    private comonAlerts: CommonAlerts,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private sucursalesService: SucursalesService,
    private router: Router,
    private categoriesService: CategoriesService,
    private datePipe: DatePipe,
    private apiconf: ApiConfigService,
    private contestService: ContestApiService,
    private broadcasterService: BroadcasterService
  ) {
    this.formPromos = this.fb.group({
      name: ["", Validators.required],
      description: [""],
      urlTerms: [""],
      urlPromo: [""],
      imageSelect: ["", Validators.required],
      imageLost: ["", Validators.required],
      releaseDate: ["", Validators.required],
      hourStartDate: ["", Validators.required],
      hourEndDate: ["", Validators.required],
      dueDate: ["", Validators.required],
      code: [""],
      typePremio: [""],
      notify: [""],
      estacion: [""],
      time: new FormControl("", [
        Validators.pattern("^[0-9]*$"),
        Validators.max(apiconf.tiempoSegundos),
      ]),
    });
    this.formBranches = this.fb.group({
      branch: ["", Validators.required],
    });

    this.formCategories = this.fb.group({
      category: ["", Validators.required],
    });
  }

  ngOnInit() {
    this.serverImages = this.apiconf.serverImages + "/promos/";
    this.serverImagesLost = this.apiconf.serverImages + "promos/lost/";
    this.getAllRelationsBrocasterShopActives();
    this.getAllPromotionsForShop(0, 5);
    this.getAllBranchesActives();
    this.getAllCategoriesForShop();
    this.getPromosOrDiscountsActives();
    this.getHourSystem();
  }

  getPromosOrDiscountsActives() {
    this.promotionsService
      .getPromosOrDiscountsActivesForIdShop(this.cookieService.get("shop"))
      .subscribe(
        (response: any) => {
          this.promosOrDiscounts = response.data;
        },
        (error) => {
          this.comonAlerts.showToastError(error);
        }
      );
    this.cleanData();
  }

  setValidatorsTime(controlName: string) {
    this.formPromos
      .get(controlName)
      .setValidators([
        Validators.required,
        Validators.pattern("^[0-9]*$"),
        Validators.max(this.apiconf.tiempoSegundos),
      ]);
    this.formPromos.get(controlName).updateValueAndValidity();
  }

  setTimeSeconds(notificacion: any) {
    this.notificacionValue = notificacion;
    if (notificacion == 1) {
      this.setValidatorsTime("time");
    }

    if (notificacion == 0) {
      this.disableValidators("time");
    }
  }

  setValueTypePremio(type: any) {
    this.typePremio = type;
    if (type == "Ticktear" || type == "Audio") {
      if (type == "Audio") {
        this.setValidators("estacion");
      } else {
        this.disableValidators("estacion");
      }
      this.formPromos.controls["notify"].setValue(1);
      this.setTimeSeconds(1);
    }
    if (type == "Directo") {
      this.setTimeSeconds("");
      this.formPromos.controls["notify"].setValue("");
    }
  }
  getAllRelationsBrocasterShopActives() {
    this.broadcasterService
      .getAllRelationBroadcasterShopActives(this.cookieService.get("shop"))
      .subscribe(
        (response: any) => {
          this.relationBroadcasterShop = response.data;
        },
        (error: any) => {
          this.comonAlerts.showToastError(error);
        }
      );
  }

  setValidators(controlName: string) {
    this.formPromos.get(controlName).setValidators([Validators.required]);
    this.formPromos.get(controlName).updateValueAndValidity();
  }

  disableValidators(controlName: string) {
    this.formPromos.get(controlName).clearValidators();
    this.formPromos.get(controlName).updateValueAndValidity();
  }

  onChangeDateMin(date: any) {
    this.minDateDueDate = new Date(date).toISOString().split("T")[0];
    this.establecerTiempoPromo(date);
  }

  getHourSystem() {
    this.promotionsService.getHouSystem().subscribe(
      (response: any) => {
        let dateA = response.data.dateActual.replace("CEST", "UTC");

        this.todaySystem = dateA;
        this.minDate = new Date(dateA).toISOString().split("T")[0];
        console.log(this.minDate);
        this.minDateDueDate = new Date(dateA).toISOString().split("T")[0];
        this.establecerTiempoPromo(dateA);
      },
      (error: any) => {
        this.comonAlerts.showToastError(error);
      }
    );
  }

  establecerTiempoPromo(date: any) {
    let hoy = new Date(date);
    let diasEnMilisegundos = 1000 * 60 * 60 * 24 * this.apiconf.tiempoDias;
    let suma = hoy.getTime() + diasEnMilisegundos; //getTime devuelve milisegundos de esa fecha
    this.maxDate = new Date(suma).toISOString().split("T")[0];
  }

  setActiveOrNot(promo: Promos) {
    if (promo.isDateActive) {
      if (promo.active) {
        return true;
      } else {
        return false;
      }
    }
    {
      return false;
    }
  }

  textStatus(promo: Promos) {
    if (promo.isDateActive) {
      if (promo.active) {
        return "Activa";
      } else {
        return "Inactiva";
      }
    } else {
      return "Inactiva";
    }
  }

  getAllBranchesActives() {
    this.sucursalesService
      .getAllBranchesActives(this.cookieService.get("shop"))
      .subscribe(
        (response: any) => {
          this.branchesList = response.data;
        },
        (error) => {
          this.comonAlerts.showToastError(error);
        }
      );
  }

  getAllCategoriesForShop() {
    this.categoriesService
      .getAllRelationsByIdShop(this.cookieService.get("shop"))
      .subscribe(
        (response: any) => {
          this.categoriesList = response.relations;
        },
        (error) => {
          this.comonAlerts.showToastError(error);
        }
      );
  }

  addOrUpdatePromo() {
    if (
      !this.formPromos.valid &&
      !this.formBranches.valid &&
      !this.formCategories.valid
    ) {
      return;
    }
    this.openSpinner();
    let promotion = {
      name: this.formPromos.value.name,
      description: this.formPromos.value.description,
      urlTerms: "url",
      urlPromo: this.formPromos.value.urlPromo,
      image: this.base64ImageFile,
      releaseDate: this.datePipe.transform(
        this.formPromos.value.releaseDate +
          " " +
          this.formPromos.value.hourStartDate,
        "dd/MM/yyyy hh:mm a"
      ),
      dueDate: this.datePipe.transform(
        this.formPromos.value.dueDate + " " + this.formPromos.value.hourEndDate,
        "dd/MM/yyyy hh:mm a"
      ),
      promoType: "Premio",
      code: this.formPromos.value.code,
      idShop: this.cookieService.get("shop"),
      consolationAward: this.formPromos.value.imageLost,
      awardType: this.formPromos.value.typePremio,
      withNotify: this.formPromos.value.notify,
      idBroadcaster:
        this.typePremio == "Audio" ? this.formPromos.value.estacion : null,
      seconds: this.notificacionValue == 1 ? this.formPromos.value.time : null,
    };
    let idBranches = this.formBranches.value.branch;
    let idCategories = this.formCategories.value.category;

    if (this.isUpdate == true) {
      delete promotion["idShop"];
      var paramsUpdate = {
        idPromotion: this.idPromotion,
        promotion,
        idBranches,
        idCategories,
      };
      var body = JSON.stringify(paramsUpdate);
      this.openSpinner();
      this.promotionsService.updtatePromotion(body).subscribe(
        (response: any) => {
          this.comonAlerts.showSuccess("Se actualizo exitosamente el premio.");
          this.getAllPromotionsForShop(this.pageIndex, this.limit);
        },
        (error) => {
          this.comonAlerts.showToastError(error);
          this.cleanData();
        }
      );
    } else {
      var param = {
        promotion,
        idBranches,
        idCategories,
      };
      this.openSpinner();
      let body = JSON.stringify(param);
      this.promotionsService.addPromotion(body).subscribe(
        (response: any) => {
          this.comonAlerts.showSuccess("Se creó exitosamente el premio.");
          this.getAllPromotionsForShop(this.pageIndex, this.limit);
        },
        (error) => {
          this.comonAlerts.showToastError(error);
          this.cleanData();
        }
      );
    }
  }

  toggleAllSelection() {
    if (this.allSelected.selected) {
      this.formBranches.controls.branch.patchValue([
        ...this.branchesList.map((item) => item.idBranch),
        0,
      ]);
    } else {
      this.formBranches.controls.branch.patchValue([]);
    }
    this.formBranches.value.branch.splice(
      this.formBranches.value.branch.findIndex((x) => x == 0),
      1
    );
  }

  toggleAllSelectionCat() {
    if (this.allSelectedCat.selected) {
      this.formCategories.controls.category.patchValue([
        ...this.categoriesList.map((item) => item.idCategory),
        0,
      ]);
    } else {
      this.formCategories.controls.category.patchValue([]);
    }
    this.formCategories.value.category.splice(
      this.formCategories.value.category.findIndex((x) => x == 0),
      1
    );
  }

  goToAddSchedules() {
    this.router.navigateByUrl(
      "sucursales/" +
        this.cookieService.get("nameShop") +
        "/" +
        this.cookieService.get("shop")
    );
  }

  goToAddCategories() {
    this.router.navigateByUrl("comercios");
  }

  onFileChange() {
    let file = (<HTMLInputElement>document.getElementById("selectFile"))
      .files[0];
    var promise = this.encodeImagetoBase64(file);
    let that = this;
    promise.then(function (result) {
      var base64result = result.toString().split(",")[1];
      that.base64ImageFile = base64result;
    });
  }

  onFileChangeLostImage() {
    let file = (<HTMLInputElement>document.getElementById("imageLost"))
      .files[0];
    var promise = this.encodeImageLosttoBase64(file);
    let that = this;
    promise.then(function (result) {
      var base64result = result.toString().split(",")[1];
      that.base64ImageLostFile = base64result;
    });
  }

  encodeImagetoBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  encodeImageLosttoBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  getAllPromotionsForShop(page: number, limit: number) {
    var param = {
      idShop: this.cookieService.get("shop"),
      type: "Premio",
      page: page,
      maxResults: limit,
    };
    let body = JSON.stringify(param);
    this.openSpinner();
    this.promotionsService.filterPromotionsForShop(body).subscribe(
      (response: any) => {
        this.totalLength = response.totalElements;
        this.promociones = response.data;
        this.isLoaded = true;
      },
      (error) => {
        this.comonAlerts.showToastError(error);
      }
    );
    this.cleanData();
  }

  openDialogAddPromos(templateRef: TemplateRef<any>) {
    this.cleanData();
    this.getHourSystem();
    console.log(this.todaySystem);
    console.log(this.datePipe.transform(this.todaySystem, "yyyy-MM-dd"));
    this.formPromos.controls["releaseDate"].setValue(
      this.datePipe.transform(this.todaySystem, "yyyy-MM-dd")
    );
    this.formPromos.controls["hourStartDate"].setValue(
      this.datePipe.transform(this.todaySystem, "HH:mm")
    );
    this.isUpdate = false;
    this.title = "¿Deseas registrar un nuevo premio?";
    this.textEnd = "Ya has terminado presiona agregar para crear el premio.";
    this.textButonSave = "Agregar";
    this.setValidatorImage(true);
    //this.setValidatorImageLost(true);
    this.dialog.open(templateRef, {
      width: window.innerWidth + "px",
      disableClose: true,
    });
  }

  openDialogUpdatePromo(promo: Promos, templateRef: TemplateRef<any>) {
    this.cleanData();
    this.getHourSystem();
    this.isUpdate = true;
    this.imagePromo = promo.image;
    this.title = "¿Deseas actualizar el premio?";
    this.textEnd = "Presiona actualizar, si deseas guardar los nuevos datos.";
    this.textButonSave = "Actualizar";
    this.formPromos.controls["name"].setValue(promo.name);
    this.formPromos.controls["urlTerms"].setValue(promo.urlTerms);
    this.formPromos.controls["urlPromo"].setValue(promo.urlPromo);

    console.log(promo.releaseDate);
    this.formPromos.controls["releaseDate"].setValue(
      this.datePipe.transform(promo.releaseDate, "yyyy-MM-dd")
    );
    this.formPromos.controls["dueDate"].setValue(
      this.datePipe.transform(promo.dueDate, "yyyy-MM-dd")
    );
    this.formPromos.controls["hourStartDate"].setValue(
      this.datePipe.transform(promo.releaseDate, "HH:mm")
    );
    this.formPromos.controls["hourEndDate"].setValue(
      this.datePipe.transform(promo.dueDate, "HH:mm")
    );
    this.formPromos.controls["code"].setValue(promo.code);
    this.formPromos.controls["description"].setValue(promo.description);
    this.typePremio = promo.awardType;
    if (promo.awardType !== "Directo") {
      this.setValueTypePremio(promo.awardType);
    } else {
      if (promo.withNotify == true) {
        this.setTimeSeconds(1);
        this.formPromos.controls["notify"].setValue(1);
      } else {
        this.setTimeSeconds(0);
        this.formPromos.controls["notify"].setValue(0);
      }
    }
    this.formPromos.controls["typePremio"].setValue(promo.awardType);
    this.formPromos.controls["time"].setValue(promo.seconds);
    this.formPromos.controls["estacion"].setValue(promo.idBroadcaster);
    this.formPromos.controls["imageLost"].setValue(promo.awardConsolation);
    this.dialog.open(templateRef, {
      width: window.innerWidth + "px",
      disableClose: true,
    });
    this.idPromotion = promo.idPromo;
    this.relationBranchList = promo.rPromoBranches;
    this.relationCateList = promo.rCategoryPromos;
    this.setValidatorImage(false);
    //this.setValidatorImageLost(false);
    this.formBranches.controls.branch.patchValue([
      ...promo.rPromoBranches.map((item) => item.idBranch),
    ]);
    this.formCategories.controls.category.patchValue([
      ...promo.rCategoryPromos.map((item) => item.idCategory),
    ]);
  }

  openDialogConfirm(promo: Promos, templateRef: TemplateRef<any>) {
    if (promo.isDateActive == false) {
      this.comonAlerts.showToastError("El premio no esta activo.");
    } else {
      this.premioConcurso = promo.name;
      this.imageConcurso = promo.image;
      this.idPromoConcurso = promo.idPromo;
      this.dialog.open(templateRef, {
        width: window.innerWidth + "px",
        disableClose: true,
      });
    }
  }

  openDialogConfirmDelete(promo: Promos, templateRef: TemplateRef<any>) {
    this.premioConcurso = promo.name;
    this.imageConcurso = promo.image;
    this.idPromoDelete = promo.idPromo;
    this.dialog.open(templateRef, {
      width: window.innerWidth + "px",
      disableClose: true,
    });
  }

  verifySelectedBranch(idBranch: string) {
    if (this.relationBranchList.find((b) => b.idBranch === idBranch)) {
      return true;
    } else {
      return false;
    }
  }

  verifySelectedCat(idCat: string) {
    if (this.relationCateList.find((c) => c.idCategory === idCat)) {
      return true;
    } else {
      return false;
    }
  }

  createConcurso() {
    var param = {
      idAdmin: this.cookieService.get("isLogin"),
      idPromo: this.idPromoConcurso,
      idShop: this.cookieService.get("shop"),
    };
    let body = JSON.stringify(param);
    this.openSpinner();
    this.contestService.createContestSinAudio(body).subscribe(
      (response: any) => {
        this.comonAlerts.showSuccess(response.header.message);
        this.dialog.closeAll();
        this.router.navigate(["/concursos/comercio"]);
      },
      (error) => {
        this.comonAlerts.showToastError(error);
        this.dialog.closeAll();
      }
    );
  }

  deletePromo() {
    this.openSpinner();
    this.promotionsService.deletePromo(this.idPromoDelete).subscribe(
      (response: any) => {
        this.comonAlerts.showSuccess(response.header.message);
        this.getAllPromotionsForShop(this.pageIndex, this.limit);
      },
      (error) => {
        this.comonAlerts.showToastError(error);
        this.dialog.closeAll();
      }
    );
  }

  changePage(event: any) {
    this.getAllPromotionsForShop(event.pageIndex, event.pageSize);
    this.pageIndex = event.pageIndex;
    this.limit = event.pageSize;
  }

  setValidatorImage(validate: boolean) {
    validate
      ? this.formPromos.get("imageSelect").setValidators([Validators.required])
      : this.formPromos.get("imageSelect").clearValidators();
    this.formPromos.get("imageSelect").updateValueAndValidity();
  }

  /*   setValidatorImageLost(validate: boolean) {
    validate ? this.formPromos.get("imageLost").setValidators([Validators.required]) : this.formPromos.get("imageLost").clearValidators();
    this.formPromos.get("imageLost").updateValueAndValidity();
  } */

  openImage(nameModal: TemplateRef<any>, logotype: string) {
    this.dialog.open(nameModal);
    this.imagePromo = logotype;
  }

  openModalImage(nameModal: any) {
    this.dialog.open(nameModal);
  }

  changeStatusActive(event: any, idPromo: string) {
    var param = {
      idPromo: idPromo,
      status: event.checked,
    };
    let body = JSON.stringify(param);
    this.promotionsService.changeStatusPromo(body).subscribe(
      (response: any) => {
        this.comonAlerts.showSuccess(response.header.message);
        this.getAllPromotionsForShop(this.pageIndex, this.limit);
      },
      (error) => {
        this.comonAlerts.showToastError(error);
        this.getAllPromotionsForShop(this.pageIndex, this.limit);
      }
    );
  }

  cleanData() {
    this.relationBranchList = [];
    this.relationCateList = [];
    this.formPromos.reset();
    this.formCategories.reset();
    this.formBranches.reset();
    this.base64ImageFile = "";
    this.dialog.closeAll();
  }

  openSpinner() {
    this.dialog.open(this.spinerDialog, {
      panelClass: "my-spinner",
    });
  }
}

export interface Promos {
  active: boolean;
  code: string;
  dueDate: string;
  idAcr: string;
  idPromo: string;
  idShop: string;
  image: string;
  isDeleted: boolean;
  name: string;
  description: string;
  nameShop: string;
  promoType: string;
  rCategoryPromos: CategoryPromos[];
  rPromoBranches: PromoBranches[];
  releaseDate: string;
  urlPromo: string;
  urlTerms: string;
  awardConsolation: string;
  isDateActive: boolean;
  awardType: any;
  withNotify: boolean;
  idBroadcaster: any;
  seconds: any;
}

export interface CategoryPromos {
  idCategory: string;
  idRcategorypromo: string;
  nameCategory: string;
}

export interface PromoBranches {
  address: string;
  idBranch: string;
  idPromoBranch: string;
}

export interface CategoryPromos {
  idCategory: string;
  nameCategory: string;
}

export interface selectedOptions {
  idBranch: string;
}

export interface GenericType {
  value: any;
  type: string;
}

export interface Relations {
  idRelation: string;
  idShop: string;
  idBroadcaster: string;
  nameBroadcaster: string;
}
