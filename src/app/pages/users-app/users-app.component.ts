import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { UsersAppApiService } from '../../services/users-app.service';
declare var $: any;
@Component({
  selector: 'app-users-app',
  templateUrl: './users-app.component.html',
  styleUrls: ['./users-app.component.css']
})
export class UsersAppComponent implements OnInit {
  templateRef: TemplateRef<any>;
  limit: number = 10;
  totalLength: number = 0;
  pageIndex: number = 0;
  pageLimit: number[] = [5, 10, 20];
  public users: any[] = [];
  public filterData: any[] = [];
  public displayedColumns = ['name', 'email', 'active', 'type', 'phone'
  ];
  longitudOriginal: number = 0;
  indexOriginal: number = 0;
  isLoaded: boolean = false;

  @ViewChild('spinner', { static: true }) spinerDialog: TemplateRef<any>;
  constructor(private apiService: UsersAppApiService, private toastr: ToastrService, private cookieService: CookieService, public dialog: MatDialog, private _snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.getUsersApp(0, this.limit);
  }

  getUsersApp(page: any, limit: any) {
    this.limit = limit;
    var param = {
      page: page,
      maxResults: limit
    };
    let body = JSON.stringify(param);
    this.openSpinner();
    this.apiService.getAllUsersApp(body).subscribe((response: any) => {
      this.users = response.data;
      this.filterData = response.data;
      this.totalLength = response.totalElements;
      this.longitudOriginal = response.totalElements;
      this.isLoaded = true;
      this.closeDialog()
    }, (error) => {
      this.showToastError(error)
    });
  }

  closeDialog() {
    this.dialog.closeAll()
  }

  openSpinner() {
    this.dialog.open(this.spinerDialog, {
      panelClass: 'my-spinner'
    });
  }

  changePage(event: any) {    
    this.clean()
    this.getUsersApp(event.pageIndex, event.pageSize);
    this.indexOriginal = event.pageIndex;
    this.pageIndex = event.pageIndex;    
    this.limit = event.pageSize;
  }
  
  clean(){
    $('#search').val('');    
  }

  changeStatusActive(event: any, idUser: string) {
    this.pageIndex = this.indexOriginal;
    var param = {
      idUser: idUser,
      active: event.checked
    }
    let body = JSON.stringify(param);
    this.apiService.changeStatus(body).subscribe((response: any) => {
      this.showSuccess(response.header.message)
      this.getUsersApp(this.pageIndex, this.limit);
    }, (error) => {
      this.showToastError(error)
      this.getUsersApp(this.pageIndex, this.limit);
    });
    this.clean()
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
      this.apiService.searchUsersApp(body).subscribe((response: any) => {
        this.users = response.data;
        this.totalLength = response.totalElements;        
      }, (error) => {
        this.showToastError(error)
      });
    }
  }

  showToastError(message: string) {
    if (this.cookieService.check('isLogin')) {
      this._snackBar.open(message, "Ok", {
        duration: 1500,
        panelClass: ['snackbarerror']
      });
    }
  }

  showSuccess(msg: any) {
    if (this.cookieService.check('isLogin')) {
      this._snackBar.open(msg, "Ok", {
        duration: 1500,
        panelClass: ['snackbarsuccess']
      });
    }
  }
}
