import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { BroadcasterService } from '../../services/radiodifusoras.service';
import { MatDialog } from '@angular/material';
import { CookieService } from 'ngx-cookie-service';
import { CommonAlerts } from '../../Common/common-alerts';
import { SucursalesService } from '../../services/sucursales-service';

@Component({
  selector: 'app-match-radios',
  templateUrl: './match-radios.component.html',
  styleUrls: ['./match-radios.component.css']
})

export class MatchRadiosComponent implements OnInit {
  displayedColumns: string[] = ['shop', 'active', 'contact'];
  displayedColumnsNoContrato: string[] = ['shop', 'active', 'contact', 'delete'];
  relations: Relations[] = []
  relationsNot: Relations[] = []
  isLoaded: boolean = false
  idRelation: any
  nameShop: any
  establecer: any
  active: boolean = false
  sucursales: Branches[] = []
  admins: UserAdmin[] = []
  @ViewChild('spinner', { static: true }) spinerDialog: TemplateRef<any>;
  constructor(private broadcasterService: BroadcasterService, private dialog: MatDialog,
    private cookieService: CookieService, private comonAlerts: CommonAlerts, private sucursalesService: SucursalesService) { }

  ngOnInit() {
    this.getAllRelationsBrocasterShopsActives()
    this.getAllRelationsBrocasterShopsNotActives()
  }

  openSpinner() {
    this.dialog.open(this.spinerDialog, {
      panelClass: 'my-spinner'
    });
  }

  changeStatusActive() {
    this.openSpinner()
    var parms = {
      idRelation: this.idRelation,
      active: this.active
    }
    let body = JSON.stringify(parms)
    this.broadcasterService.addOrRemoveContrato(body).subscribe((response: any) => {
      this.comonAlerts.showSuccess(response.header.message)
      this.getAllRelationsBrocasterShopsActives()
      this.getAllRelationsBrocasterShopsNotActives()
    }, (error: any) => {
      this.comonAlerts.showToastError(error)
    })
    this.dialog.closeAll()
    this.getAllRelationsBrocasterShopsActives()
    this.getAllRelationsBrocasterShopsNotActives()
  }

  openDialogContratarRelation(relation: Relations, templateRef: TemplateRef<any>, event: any) {
    if (event.checked) {
      this.establecer = "establecer"
      this.active = true;
    } else {
      this.establecer = 'quitar'
      this.active = false
    }
    this.nameShop = relation.shopName;
    this.idRelation = relation.idRelation
    this.dialog.open(templateRef, { disableClose: true, panelClass: 'add-user' });
  }

  openDialogContactar(relation: Relations, templateRef: TemplateRef<any>) {
    this.nameShop = relation.shopName;
    this.dialog.open(templateRef, { disableClose: true, panelClass: 'add-user' });
    this.getAllBranchesByIdShop(relation.idShop)
  }


  openDialogDelete(relation: Relations, templateRef: TemplateRef<any>) {
    this.nameShop = relation.shopName;
    this.idRelation = relation.idRelation
    this.dialog.open(templateRef, { disableClose: true, panelClass: 'add-user' });
  }

  deleteRelationRadio() {
    this.broadcasterService.deleteRelationBroadcasterShop(this.idRelation).subscribe((response: any) => {
      this.ngOnInit()
      this.comonAlerts.showSuccess(response.header.message)
      this.dialog.closeAll()
    }, (error: any) => {
      this.dialog.closeAll()
      this.comonAlerts.showToastError(error)
    })
  }


  getAllBranchesByIdShop(idShop: any) {
    this.sucursalesService.getAllBranches(idShop).subscribe((response: any) => {
      this.sucursales = response.data;
      this.admins = response.userAdmin
    }, (error) => {
      this.comonAlerts.showToastError(error)
    });

  }


  getAllRelationsBrocasterShopsActives() {
    this.openSpinner()
    var params = {
      idBroadcaster: this.cookieService.get("idBroadcaster"),
      active: true
    }
    let body = JSON.stringify(params)
    this.broadcasterService.getRelationsByIdBroadcaster(body).subscribe((response: any) => {
      this.relations = response.data
      this.isLoaded = true;
    }, (error: any) => {
      this.comonAlerts.showToastError(error)
    })
    this.dialog.closeAll()
  }

  getAllRelationsBrocasterShopsNotActives() {
    this.openSpinner()
    var params = {
      idBroadcaster: this.cookieService.get("idBroadcaster"),
      active: false
    }
    let body = JSON.stringify(params)
    this.broadcasterService.getRelationsByIdBroadcaster(body).subscribe((response: any) => {
      this.relationsNot = response.data
      this.isLoaded = true;
    }, (error: any) => {
      this.comonAlerts.showToastError(error)
    })
    this.dialog.closeAll()
  }

}

export interface Relations {
  idRelation: string
  idShop: string
  idBroadcaster: string
  nameBroadcaster: string
  active: boolean
  shopName: string
}

export interface Branches {
  idBranch: string
  address: string
  phoneNumber: string
  active: boolean
  type: string
  idShop: string
  isDeleted: false
  latitude: string
  longitude: string
  shedules: any[]
}

export interface UserAdmin {
  email: string
  idAdmin: string
  lastName: string
  name: string
  phoneNumber: string
}