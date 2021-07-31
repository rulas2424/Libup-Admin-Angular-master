import { Component, OnInit, ViewChild, TemplateRef, NgZone } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { MatDialog, MatPaginator } from '@angular/material';
import { PromotionsService } from '../../services/promotions.service';
import { CommonAlerts } from '../../Common/common-alerts';
import { MapsAPILoader } from '@agm/core';
import { ApiConfigService } from '../../services/api-config.service';
import { Router } from '@angular/router';
import { Notifications } from '../contest-commerce/contest-commerce.component';
import { UserService } from '../../services/user.service';
import { DomSanitizer } from '@angular/platform-browser';
declare var $: any;

@Component({
  selector: 'app-video-page',
  templateUrl: './video-page.component.html',
  styleUrls: ['./video-page.component.css']
})
export class VidePageComponent implements OnInit {
  
  constructor() { }

  ngOnInit() {
    
  }

}