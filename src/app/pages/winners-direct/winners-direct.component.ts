import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { FormBuilder } from '@angular/forms';
import { CommonAlerts } from '../../Common/common-alerts';
import { WinnersService } from '../../services/winners-service';
import { ApiConfigService } from '../../services/api-config.service';
import { EncrDecrService } from '../../classes/EncrDecrService';
import { CookieService } from 'ngx-cookie-service';
declare var $: any;
@Component({
  selector: 'app-winners-direct',
  templateUrl: './winners-direct.component.html',
  styleUrls: ['./winners-direct.component.css']
})
export class WinnersDirectComponent implements OnInit {
  templateRef: TemplateRef<any>;
  limit: number = 10;
  totalLength: number = 0;
  pageIndex: number = 0;
  pageLimit: number[] = [5, 10, 20];

  isLoaded: boolean = false;
  listWinners: Winners[] = []
  public displayedColumns = ['name', 'premio', 'status', 'dateWinner', 'detail', 'reclaim'];
  longitudOriginal: number = 0;
  indexOriginal: number = 0;

  fechaConcurso: string;
  estatus: string;
  fechaGane: string;
  ticketeos: number;
  tienda: string;
  sucursales: BranchesForAward[] = [];
  audio: string;

  premio: string;
  codigo: string;
  fechaInicio: string;
  fechaTermino: string;
  urlPromo: string;
  termino: string;
  imagePremio: string;

  email: string;
  telefono: string;
  nombreUser: string;
  lastName: string;
  estatusWinner: string;

  serverImages: string;
  urlAudios: string;

  idWinnerReclaim: string;

  @ViewChild('spinner', { static: true }) spinerDialog: TemplateRef<any>;
  constructor(public fb: FormBuilder, private apiconf: ApiConfigService,
    public dialog: MatDialog, private comonAlerts: CommonAlerts, private winnersService: WinnersService,
    private EncrDecr: EncrDecrService, private cookieService: CookieService) {
  }


  ngOnInit() {
    this.getAllWinners(0, this.limit)
    this.serverImages = this.apiconf.serverImages + "/promos/"
    this.urlAudios = this.apiconf.serverAudios;
  }


  decriptValue() {
    var decrypted = this.EncrDecr.get(this.apiconf.encript, this.cookieService.get('rol').toString());
    return decrypted.toString();
  }

  openDetails(winner: Winners, templateRef: TemplateRef<any>) {
    this.setDataWinners(winner);
    this.dialog.open(templateRef, { width: window.innerWidth + 'px' });
  }

  reclaimAward(winner: Winners, templateRef: TemplateRef<any>) {
    this.setDataWinners(winner)
    this.idWinnerReclaim = winner.idWinner;
    this.dialog.open(templateRef, { width: window.innerWidth + 'px' });
  }
  

  reclamarPremio(){
    this.openSpinner()
    this.winnersService.reclaimAwardDirect(this.idWinnerReclaim).subscribe((response: any) => {
      this.dialog.closeAll()
      this.comonAlerts.showSuccess(response.header.message)
      this.getAllWinners(this.pageIndex, this.limit)      
    }, (error: any) => {
      this.comonAlerts.showToastError(error)
      this.dialog.closeAll()
    })

  }

  setDataWinners(winner: Winners){

    this.fechaGane = winner.dateWinner;

    this.premio = winner.awardWinner.name;
    this.codigo = winner.awardWinner.code;
    this.fechaInicio = winner.awardWinner.releaseDate;
    this.fechaTermino = winner.awardWinner.dueDate;
    this.urlPromo = winner.awardWinner.urlPromo;
    this.termino = winner.awardWinner.urlTerms;
    this.imagePremio = winner.awardWinner.image;

    this.email = winner.userWinner.email;
    this.telefono = winner.userWinner.phoneNumber;
    this.nombreUser = winner.userWinner.name;
    this.lastName = winner.userWinner.lastName;
    this.tienda = winner.awardWinner.shopWinner.nameShop;
    this.sucursales = winner.awardWinner.shopWinner.branchesForAward;
    this.estatusWinner = winner.statusWinner;
  }

  getAllWinners(page: number, limit: number) {
      var param = {
        idShop: this.cookieService.get('shop'),
        page: page,
        maxResults: limit
      }
      let body = JSON.stringify(param);
      this.openSpinner()
      this.winnersService.getAllWinnersDirectForShop(body).subscribe((response: any) => {
        this.isLoaded = true;
        this.listWinners = response.data;
        this.totalLength = response.totalElements;
        this.longitudOriginal = response.totalElements;
        this.dialog.closeAll()
      }, (error: any) => {
        this.comonAlerts.showToastError(error)
        this.dialog.closeAll()
      })
  }

  openModalImage(nameModal: any) {
    this.dialog.open(nameModal);
  }


  openSpinner() {
    this.dialog.open(this.spinerDialog, {
      panelClass: 'my-spinner'
    });
  }


  changePage(event: any) {
    this.getAllWinners(event.pageIndex, event.pageSize);
    this.indexOriginal = event.pageIndex;
    this.pageIndex = event.pageIndex;
    this.limit = event.pageSize;
  }
}


export interface Winners {
  awardWinner: AwardWinner
  dateWinner: string
  idWinner: string
  userWinner: UserWinner
  statusWinner: string
}


export interface AwardWinner {
  active: boolean
  code: string
  description: string
  dueDate: string
  idAward: string
  image: string
  name: string
  promoType: string
  releaseDate: string
  shopWinner: ShopWinner
  urlPromo: string
  urlTerms: string
}

export interface ShopWinner {
  active: boolean
  idShop: string
  image: string
  nameShop: string
  branchesForAward: BranchesForAward[]
}

export interface UserWinner {
  accountType: string
  email: string
  idUser: string
  lastName: string
  name: string
  phoneNumber: string
  profilePhoto: string
}

export interface BranchesForAward {
  address: string
  branchType: string
  idBranch: string
  latitud: string
  longitud: string
  phoneNumber: string
}