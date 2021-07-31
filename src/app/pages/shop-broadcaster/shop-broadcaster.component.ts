import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { BroadcasterService } from '../../services/radiodifusoras.service';
import { CommonAlerts } from '../../Common/common-alerts';
import { CookieService } from 'ngx-cookie-service';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-shop-broadcaster',
  templateUrl: './shop-broadcaster.component.html',
  styleUrls: ['./shop-broadcaster.component.css']
})
export class ShopBroadcasterComponent implements OnInit {
  @ViewChild('spinner', { static: true }) spinerDialog: TemplateRef<any>;
  broadcaster: Broadcasters[] = [];
  relationBroadcasterShop: Relations[] = [];
  isLoaded: boolean = false;
  shop: any
  nameBroadcaster: string
  idBroadcaster: string
  idRelation: string

  constructor(private broadcasterService: BroadcasterService, private common: CommonAlerts, private cookieService: CookieService,
    public dialog: MatDialog) {
    this.shop = cookieService.get("nameShop")
  }

  ngOnInit() {
    this.openSpinner()
    this.getAllBroadcasterActives()
    this.getAllRelationsBrocasterShop()
  }

  getAllBroadcasterActives() {
    this.broadcasterService.getAllBroadcastersActives().subscribe((response: any) => {
      this.broadcaster = response.data
      this.isLoaded = true
    }, (error: any) => {
      this.common.showToastError(error)
    })
    this.dialog.closeAll()
  }

  openSpinner() {
    this.dialog.open(this.spinerDialog, {
      panelClass: 'my-spinner'
    });
  }

  getAllRelationsBrocasterShop() {
    this.broadcasterService.getAllRelationBroadcasterShop(this.cookieService.get("shop")).subscribe((response: any) => {      
      this.relationBroadcasterShop = response.data;
      this.isLoaded = true
    }, (error: any) => {
      this.common.showToastError(error)    
    })

  }

  openDialogAddRadio(radios: Broadcasters, templateRef: TemplateRef<any>) {
    this.nameBroadcaster = radios.name;
    this.idBroadcaster = radios.idBroadcaster
    this.dialog.open(templateRef, { disableClose: true, panelClass: 'add-user' });
  }

  openDialogDeleteRelation(relation: Relations, templateRef: TemplateRef<any>) {
    this.nameBroadcaster = relation.nameBroadcaster;
    this.idRelation = relation.idRelation
    this.dialog.open(templateRef, { disableClose: true, panelClass: 'add-user' });
  }

  deleteRelation(){
    this.broadcasterService.deleteRelationBroadcasterShop(this.idRelation).subscribe((response: any) => {
      this.getAllRelationsBrocasterShop()
      this.common.showSuccess(response.header.message)
      this.dialog.closeAll()
    }, (error: any) => {
      this.dialog.closeAll()
      this.common.showToastError(error)
    })
  }

  addRelationBroadctasterShop(){
    var params = {
      idShop: this.cookieService.get("shop"),
      idBroadcaster: this.idBroadcaster
    }
    let body = JSON.stringify(params)
    this.broadcasterService.addRelationBroadcasterShop(body).subscribe((response: any) => {           
      if(response.header.message.startsWith("El comercio ya tiene contrato")){
        this.common.showWarnning(response.header.message)
      } else{
        this.common.showSuccess(response.header.message)
      }     
      this.getAllRelationsBrocasterShop()
      this.dialog.closeAll()
    }, (error: any) => {
      this.dialog.closeAll()
      this.common.showToastError(error)
    })
  }

}

export interface Broadcasters {
  idBroadcaster: string
  name: string
  active: boolean
  isDeleted: boolean
  imagePath: string
}

export interface Relations {
  idRelation: string
  idShop: string
  idBroadcaster: string
  nameBroadcaster: string
}