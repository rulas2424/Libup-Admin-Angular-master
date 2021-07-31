import { Component, OnInit, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { LlamadasApiService } from '../../services/llamadas-api.service';
import { MatDialog } from '@angular/material';
import { CommonAlerts } from '../../Common/common-alerts';
import { PromotionsService } from '../../services/promotions.service';
import { ApiConfigService } from '../../services/api-config.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { ContestApiService } from '../../services/contest-service';
import { Router } from '@angular/router';
declare var $: any;
@Component({
  selector: 'app-acr-audios',
  templateUrl: './acr-audios.component.html',
  styleUrls: ['./acr-audios.component.css']
})
export class AcrAudiosComponent implements OnInit {
  @ViewChild('spinner', { static: true }) spinerDialog: TemplateRef<any>;
  @ViewChild('audioOption', { static: false }) audioPlayerRef: ElementRef;
  comercios: Commerces[] = [];
  premios: Premios[] = [];
  limit: number = 5;
  totalLength: number = 0;
  pageIndex: number = 0;
  pageLimit: number[] = [5, 10];
  serverImages: string;
  isLoaded: boolean = false;
  selectedCommerce: boolean = false;
  imagePremio: string;
  idShopSelect: string;
  formUpload: FormGroup;
  namePremio: string = "";
  idPromo: string = "";
  reproductor: boolean = false;
  audioSrc: string;
  file: any;

  constructor(private comerciosService: LlamadasApiService, public dialog: MatDialog, private comonAlerts: CommonAlerts,
    private premiosService: PromotionsService, private apiconf: ApiConfigService, private fb: FormBuilder,
    private cookieService: CookieService, private contestService: ContestApiService, private router: Router) {

    this.formUpload = this.fb.group({
      name: ['', Validators.required],
      fileSelect: ['', Validators.required]
    })
  }

  ngOnInit() {
    this.serverImages = this.apiconf.serverImages + "/promos/"
    this.getCommercesActives()
    this.audioSrc = "";
  }

  getCommercesActives() {
    this.openSpinner();
    this.comerciosService.getCommercesWithContrato(this.cookieService.get("idBroadcaster")).subscribe((response: any) => {
      this.comercios = response.data;
      this.isLoaded = true;
    }, (error) => {
      this.comonAlerts.showToastError(error)
    });
    this.cleanData();
  }

  getAwarsActives(idShop: string, page: number, limit: number) {
    this.idShopSelect = idShop;
    this.openSpinner();
    var param = {
      idShop: idShop,
      page: page,
      maxResults: limit
    }
    let body = JSON.stringify(param);
    this.premiosService.getAwardsWithAudioForIdShop(body).subscribe((response: any) => {
      this.selectedCommerce = true;
      this.totalLength = response.totalElements;
      this.cleanData()
      this.premios = response.data;
    }, (error) => {
      this.comonAlerts.showToastError(error)
      this.cleanData()
    });
    /* let element: HTMLElement = document.getElementById('title') as HTMLElement;
    element.click(); */

  }

  onAudioFileChange(evento: any) {
    let file = (<HTMLInputElement>document.getElementById('imageUpload')).files[0];
    this.file = file;
    if (file != null) {
      var t = file.type.split('/')[0].toLowerCase();
      if (t != "audio") {
        this.reproductor = false;
        this.comonAlerts.showWarnning("Por favor selecciona un formato de audio valido.")
        this.formUpload.controls['fileSelect'].setValue("");
        return;
      }
    }
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


  openDialogUpload(premio: Premios, templateRef: TemplateRef<any>) {
    this.cleanData()
    this.namePremio = premio.name;
    this.idPromo = premio.idPromo;
    this.dialog.open(templateRef, { width: window.innerWidth + 'px', disableClose: true });
  }

  play() {
    this.audioPlayerRef.nativeElement.play();
  }

  pause() {
    this.audioPlayerRef.nativeElement.pause();
  }

  changePage(event: any) {
    this.getAwarsActives(this.idShopSelect, event.pageIndex, event.pageSize);
    this.pageIndex = event.pageIndex;
    this.limit = event.pageSize;
  }

  openImage(nameModal: TemplateRef<any>, premioImage: string) {
    this.dialog.open(nameModal);
    this.imagePremio = premioImage;
  }


  cleanData() {
    this.dialog.closeAll()
    this.formUpload.reset()
    this.reproductor = false;
  }

  uploadAudio(formUpload: any) {
    if (!this.formUpload.valid) {
      return;
    }
    this.openSpinner()
    let formData;
    formData = new FormData();
    formData.append("audioTitle", formUpload.value.name)
    formData.append("dataType", "audio");
    formData.append("bucketName", this.apiconf.bucketName);
    formData.append("file", this.file);
    formData.append("idAdmin", this.cookieService.get('isLogin'));
    formData.append("idPromo", this.idPromo);
    formData.append("idShop", this.idShopSelect);
    formData.append("idBroadcaster", this.cookieService.get('idBroadcaster'));
    this.contestService.uploadAudioAndContest(formData).subscribe((response: any) => {
      this.comonAlerts.showSuccess(response.header.message)
      this.dialog.closeAll()
      this.router.navigate(['/concursos']);
    }, (error) => {
      this.comonAlerts.showToastError(error)
      this.dialog.closeAll()
    });

  }

  openSpinner() {
    this.dialog.open(this.spinerDialog, {
      panelClass: 'my-spinner'
    });
  }


}

export interface Commerces {
  idRelation: string
  idShop: string
  shopName: string
  idBroadcaster: string
  nameBroadcaster: string
  active: boolean
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