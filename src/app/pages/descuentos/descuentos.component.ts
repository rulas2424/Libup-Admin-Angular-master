import { Component, OnInit, ViewChild, TemplateRef } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { PromotionsService } from "../../services/promotions.service";
import { CommonAlerts } from "../../Common/common-alerts";
import { MatDialog, MatOption } from "@angular/material";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { SucursalesService } from "../../services/sucursales-service";
import { Router } from "@angular/router";
import { CategoriesService } from "../../services/categories-service";
import { DatePipe } from "@angular/common";
import { ApiConfigService } from "../../services/api-config.service";
declare var $: any;
declare var Tour: any;
@Component({
  selector: "app-descuentos",
  templateUrl: "./descuentos.component.html",
  styleUrls: ["./descuentos.component.css"],
})
export class DescuentosComponent implements OnInit {
  title: string = "";
  promociones: Promos[] = [];
  limit: number = 5;
  totalLength: number = 0;
  pageIndex: number = 0;
  pageLimit: number[] = [5, 10];
  isLoaded: boolean = false;
  formPromos: FormGroup;
  formBranches: FormGroup;
  formCategories: FormGroup;
  base64ImageFile: any;
  isEditable = true;
  branchesList: any[] = [];
  relationBranchList: any[] = [];
  relationCateList: any[] = [];
  categoriesList: CategoryPromos[] = [];
  serverImages: string;
  imagePromo: string;
  isUpdate: boolean = false;
  selectedAttributes: any[] = [];
  idPromotion: string;
  textEnd: string;
  textButonSave: string;
  premioConcurso: string;
  imageConcurso: string;
  idPromoDelete: string;

  minDate: any;
  minDateDueDate: any;
  maxDate: any;
  todaySystem: any;
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
    private apiconf: ApiConfigService
  ) {
    this.formPromos = this.fb.group({
      name: ["", Validators.required],
      description: [""],
      urlTerms: [""],
      urlPromo: [""],
      imageSelect: ["", Validators.required],
      releaseDate: ["", Validators.required],
      hourStartDate: ["", Validators.required],
      hourEndDate: ["", Validators.required],
      dueDate: ["", Validators.required],
      code: [""],
    });
    this.formBranches = this.fb.group({
      branch: ["", Validators.required],
    });

    this.formCategories = this.fb.group({
      category: ["", Validators.required],
    });
  }

  startTour() {
    var tour = new Tour({
      container: "body",
      autoscroll: true,
      keyboard: true,
      useLocalStorage: false,
      debug: false,
      backdrop: true,
      redirect: true,
      animation: true,
      basePath: "",
      storage: false,
      reflex: false,
      template: this.apiconf.textosTour,
      onNext: function (tour) {
        tour.goTo(tour._current + 1);
      },
      onPrev: function (tour) {
        tour.goTo(tour._current - 1);
      },
    });
    tour.restart();
    tour.addSteps([
      {
        element: "#my-element",
        title: "Funciona",
        content:
          "Aqui debes de agregar descuentos de administración y manipular los elementos.",
        placement: "left",
      },
      {
        element: "#my-other-element",
        title: "Funciona 3",
        content: "Descuento nombre.",
        placement: "top",
      },
    ]);
    tour.start();
  }

  ngOnInit() {
    this.serverImages = this.apiconf.serverImages + "/promos/";
    this.getAllPromotionsForShop(0, 5);
    this.getAllBranchesActives();
    this.getAllCategoriesForShop();
    this.getHourSystem();
    //  this.startTour();
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
      promoType: "Descuento",
      code: this.formPromos.value.code,
      idShop: this.cookieService.get("shop"),
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
          this.comonAlerts.showSuccess(
            "Se actualizo exitosamente el descuento."
          );
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
          this.comonAlerts.showSuccess("Se creó exitosamente el descuento.");
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

  getAllPromotionsForShop(page: number, limit: number) {
    var param = {
      idShop: this.cookieService.get("shop"),
      type: "Descuento",
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
    this.formPromos.controls["releaseDate"].setValue(
      this.datePipe.transform(this.todaySystem, "yyyy-MM-dd")
    );
    this.formPromos.controls["hourStartDate"].setValue(
      this.datePipe.transform(this.todaySystem, "HH:mm")
    );
    this.isUpdate = false;
    this.title = "¿Deseas registrar un nuevo descuento?";
    this.textEnd = "Ya has terminado presiona agregar para crear el descuento.";
    this.textButonSave = "Agregar";
    this.setValidatorImage(true);
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
    this.title = "¿Deseas actualizar el descuento?";
    this.textEnd = "Presiona actualizar, si deseas guardar los nuevos datos.";
    this.textButonSave = "Actualizar";
    this.formPromos.controls["name"].setValue(promo.name);
    this.formPromos.controls["urlTerms"].setValue(promo.urlTerms);
    this.formPromos.controls["urlPromo"].setValue(promo.urlPromo);
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
    this.dialog.open(templateRef, {
      width: window.innerWidth + "px",
      disableClose: true,
    });
    this.idPromotion = promo.idPromo;
    this.relationBranchList = promo.rPromoBranches;
    this.relationCateList = promo.rCategoryPromos;
    this.setValidatorImage(false);
    this.formBranches.controls.branch.patchValue([
      ...promo.rPromoBranches.map((item) => item.idBranch),
    ]);
    this.formCategories.controls.category.patchValue([
      ...promo.rCategoryPromos.map((item) => item.idCategory),
    ]);
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

  openDialogConfirmDelete(promo: Promos, templateRef: TemplateRef<any>) {
    this.premioConcurso = promo.name;
    this.imageConcurso = promo.image;
    this.idPromoDelete = promo.idPromo;
    this.dialog.open(templateRef, {
      width: window.innerWidth + "px",
      disableClose: true,
    });
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
  isDateActive: boolean;
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
