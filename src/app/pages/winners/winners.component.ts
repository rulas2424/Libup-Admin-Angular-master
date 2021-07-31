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
  selector: 'app-winners',
  templateUrl: './winners.component.html',
  styleUrls: ['./winners.component.css']
})
export class WinnersComponent implements OnInit {
  templateRef: TemplateRef<any>;
  limit: number = 10;
  totalLength: number = 0;
  pageIndex: number = 0;
  pageLimit: number[] = [5, 10, 20];

  isLoaded: boolean = false;
  listWinners: Winners[] = []
  public displayedColumns = [];
  longitudOriginal: number = 0;
  indexOriginal: number = 0;

  fechaConcurso: string;
  broadcaster: string;
  estatus: string;
  fechaGane: string;
  ticketeos: any;
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

  serverImages: string;
  urlAudios: string;

  idWinnerReclaim: string;
  textoInit: string

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


  reclamarPremio() {
    this.openSpinner()
    this.winnersService.reclaimAward(this.idWinnerReclaim).subscribe((response: any) => {
      this.dialog.closeAll()
      this.comonAlerts.showSuccess(response.header.message)
      this.getAllWinners(this.pageIndex, this.limit)
    }, (error: any) => {
      this.comonAlerts.showToastError(error)
      this.dialog.closeAll()
    })

  }

  setDataWinners(winner: Winners) {
    this.fechaConcurso = winner.contestWinner.releaseDate;
    this.fechaGane = winner.dateWinner;
    this.estatus = winner.contestWinner.statusContest;
    this.ticketeos = winner.typeWinner == "ConAudio" ? 'No Aplica' : winner.tickCount;
    this.audio = winner.contestWinner.audio;
    this.broadcaster = winner.typeWinner == "ConAudio" ? winner.nameBroadcaster :  'No Aplica';

    this.premio = winner.contestWinner.awardWinner.name;
    this.codigo = winner.contestWinner.awardWinner.code;
    this.fechaInicio = winner.contestWinner.awardWinner.releaseDate;
    this.fechaTermino = winner.contestWinner.awardWinner.dueDate;
    this.urlPromo = winner.contestWinner.awardWinner.urlPromo;
    this.termino = winner.contestWinner.awardWinner.urlTerms;
    this.imagePremio = winner.contestWinner.awardWinner.image;

    this.email = winner.userWinner.email;
    this.telefono = winner.userWinner.phoneNumber;
    this.nombreUser = winner.userWinner.name;
    this.lastName = winner.userWinner.lastName;
    this.tienda = winner.contestWinner.awardWinner.shopWinner.nameShop;
    this.sucursales = winner.contestWinner.awardWinner.shopWinner.branchesForAward;
  }

  getAllWinners(page: number, limit: number) {
    if (this.decriptValue() == "Comercio") {
      console.info("winners tienda")
      this.textoInit = 'Lista de ganadores del tickteo y con audio'
      this.displayedColumns = ['name', 'premio', 'status', 'tick', 'dateWinner', 'detail', 'reclaim', 'type'];
      var param = {
        idShop: this.cookieService.get('shop'),
        page: page,
        maxResults: limit
      }
      let body = JSON.stringify(param);
      this.openSpinner()
      this.winnersService.getAllWinnersForShop(body).subscribe((response: any) => {
        this.isLoaded = true;
        this.listWinners = response.data;
        this.totalLength = response.totalElements;
        this.longitudOriginal = response.totalElements;
        this.dialog.closeAll()
      }, (error: any) => {
        this.comonAlerts.showToastError(error)
        this.dialog.closeAll()
      })

    } else if (this.decriptValue() == "Radio") {
      console.info("winners radio")
      this.textoInit = 'Lista de ganadores con audio'
      this.displayedColumns = ['name', 'premio', 'status', 'dateWinner', 'detail'];
      var params = {
        idBroadcaster: this.cookieService.get('idBroadcaster'),
        typeWinner: 'ConAudio',
        page: page,
        maxResults: limit
      }
      let body = JSON.stringify(params);
      this.openSpinner()
      this.winnersService.getAllWinnersByIdBroadcaster(body).subscribe((response: any) => {
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
  }

  getLabelTick(element: any) {
    if(element.typeWinner == "ConAudio"){
      return "No Aplica."
    } else{
      return element.tickCount;
    }
  }

  withAudio(typeWinner: string) {
    if (typeWinner == "ConAudio") {
      return true;
    } else if (typeWinner == "SinAudio") {
      return false;
    }

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
  contestWinner: ContestWinner
  dateWinner: string
  idWinner: string
  tickCount: number
  typeWinner: string
  userWinner: UserWinner
  statusWinner: String
  idBroadcaster: string
  nameBroadcaster: string
}

export interface ContestWinner {
  audio: string
  audioTitle: string
  awardWinner: AwardWinner
  bucketName: string
  dataType: string
  idAcr: string
  idAdmin: string
  idContest: string
  releaseDate: string
  statusContest: string
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