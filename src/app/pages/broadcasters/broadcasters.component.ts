import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { MatDialog } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiConfigService } from '../../services/api-config.service';
import { CommonAlerts } from '../../Common/common-alerts';
import { EncrDecrService } from '../../classes/EncrDecrService';
import { BroadcasterService } from '../../services/radiodifusoras.service';
declare var $: any;
@Component({
  selector: 'app-broadcasters',
  templateUrl: './broadcasters.component.html',
  styleUrls: ['./broadcasters.component.css']
})
export class BroadcastersComponent implements OnInit {
  templateRef: TemplateRef<any>;
  limit: number = 10;
  totalLength: number = 0;
  pageIndex: number = 0;
  pageLimit: number[] = [5, 10, 20];
  formRadio: FormGroup;
  formRadioUpdate: FormGroup;
  title: string = "";
  base64ImageFile: any;
  serverImages: string;
  idRadio: string;
  logotypeModal: any;
  isLoaded: boolean = false;
  broadcaster: any[] = []
  filterData: any[] = [];
  longitudOriginal: number = 0;
  indexOriginal: number = 0;
  public displayedColumns =['name', 'active', 'image', 'update'];
  logotipo: string;
  @ViewChild('spinner', { static: true }) spinerDialog: TemplateRef<any>;
  constructor(public fb: FormBuilder,  private toastr: ToastrService, public cookieService: CookieService, public dialog: MatDialog,
    private apiconf: ApiConfigService, private comonAlerts: CommonAlerts,  private EncrDecr: EncrDecrService, private brocasterService: BroadcasterService) {
    this.formRadio = this.fb.group({
      name: ['', Validators.required],
      fileSelect: ['', Validators.required],
    })
    this.formRadioUpdate = this.fb.group({
      nameUpdate: ['', Validators.required],
      fileSelectUpdate: ['', Validators.required],
    })
  }



  ngOnInit() {
    this.getBroadcaster(0, this.limit);
    this.serverImages = this.apiconf.serverImages + "radio/";
  }

  decriptValue(){
    var decrypted = this.EncrDecr.get(this.apiconf.encript, this.cookieService.get('rol').toString());  
    return decrypted.toString();
  }

  getBroadcaster(page: any, limit: any) {
      var param = {
        page: page,
        maxResults: limit
      };
      let body = JSON.stringify(param);
      this.openSpinner();
      this.brocasterService.getAllBroadcasters(body).subscribe((response: any) => {
        //console.warn(response)
          this.broadcaster = response.data;
          this.totalLength = response.totalElements;
          this.longitudOriginal = response.totalElements;
          this.filterData = response.data;         
          this.isLoaded = true;
        this.dialog.closeAll();
      }, (error) => {
        this.comonAlerts.showToastError(error)
      });
      this.cleanData();
  }

  searchBroadcaster = (value: string) => {
    if (!value) {
      this.broadcaster = this.filterData
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
      this.brocasterService.searchBroadcaster(body).subscribe((response: any) => {
        this.broadcaster = response.data;
        this.totalLength = response.totalElements;
      }, (error) => {
        this.comonAlerts.showToastError(error)
        this.cleanData()
      });
    }
  }

  openDialogAddRadiodifusora(templateRef: TemplateRef<any>) {
    this.cleanData();
    this.title = "¿Deseas registrar una nueva Radiodifusora?";
    this.dialog.open(templateRef, {  width: window.innerWidth + 'px', disableClose: true }).afterClosed().subscribe(result => {
      //this.getComercios(0, this.limit);
    });
  }

  openDialogUpdate(radio: any, templateRef: TemplateRef<any>) {
    this.base64ImageFile = "";
    this.title = "¿Deseas actualizar la radiodifusora?";
    this.dialog.open(templateRef, { width: window.innerWidth + 'px',disableClose: true }).afterClosed().subscribe((result: boolean) => {
      //this.getComercios(0, this.limit);
    });
    this.formRadioUpdate.controls['nameUpdate'].setValue(radio.name);    
    this.idRadio = radio.idBroadcaster;
    this.logotypeModal = radio.imagePath;
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
    let file = (<HTMLInputElement>document.getElementById('fileSelectUpdate')).files[0];
    var promise = this.encodeImagetoBase64(file);
    let that = this;
    let toArray = file.name.split(".");
    promise.then(function (result) {
      that.logotipo = "data:image/" + toArray[1] + ";base64," + result.toString().split(',')[1]
      var base64result = result.toString().split(',')[1]
      that.base64ImageFile = base64result;
    });

  }


  onUpdateFileChange() {
    let file = (<HTMLInputElement>document.getElementById('fileSelectUpdate')).files[0];
    var promise = this.encodeImagetoBase64(file);
    let that = this;
    promise.then(function (result) {
      var base64result = result.toString().split(',')[1]
      that.base64ImageFile = base64result;
    });

  }

  cleanData() {
    this.formRadio.reset();
    this.formRadioUpdate.reset();
    this.base64ImageFile = "";
    this.logotipo = "";
    this.dialog.closeAll()
    this.clean()
  }

  openSpinner() {
    this.dialog.open(this.spinerDialog, {
      panelClass: 'my-spinner'
    });
  }

  updateRadio(updateForm: any) {
    if (updateForm.value.nameUpdate.length == 0) {
      return;
    }
    this.openSpinner();
    this.pageIndex = this.indexOriginal;
    var param = {
      idBroadcaster: this.idRadio,
      name: updateForm.value.nameUpdate,
      pathImage: this.base64ImageFile
    };
    let body = JSON.stringify(param);    
    this.brocasterService.updateBroadcaster(body).subscribe((response: any) => {
      this.comonAlerts.showSuccess(response.header.message)
      this.getBroadcaster(this.pageIndex, this.limit);
    }, (error) => {
      this.comonAlerts.showToastError(error)
      this.cleanData()
    });
  }

  addRadiodifusora(radioForm: any) {
    var imgVal = $('#selectFile').val();    
    if (imgVal == '') {
      this.showWarnning("El logotipo es requerido.")
      return false;
    }
    if (!this.formRadio.valid) {
      return;
    }
    this.pageIndex = this.indexOriginal;
    this.openSpinner();
    var param = {
      name: radioForm.value.name,
      pathImage: this.base64ImageFile,      
    };
    let body = JSON.stringify(param);
    this.brocasterService.addBroadcaster(body).subscribe((response: any) => {
      this.comonAlerts.showSuccess(response.header.message)
      this.getBroadcaster(this.pageIndex, this.limit);
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
    this.getBroadcaster(event.pageIndex, event.pageSize);
    this.indexOriginal = event.pageIndex;
    this.pageIndex = event.pageIndex;
    this.limit = event.pageSize;
  }

  changeStatusActive(event: any, idRadio: string) {
    this.pageIndex = this.indexOriginal;
    var param = {
      idBroadcaster: idRadio,
      status: event.checked
    }
    let body = JSON.stringify(param);

    this.brocasterService.changeStatusBroadcaster(body).subscribe((response: any) => {
      this.comonAlerts.showSuccess(response.header.message)
      this.getBroadcaster(this.pageIndex, this.limit);
    }, (error) => {
      this.comonAlerts.showToastError(error)
      this.getBroadcaster(this.pageIndex, this.limit);
    });
    this.clean()
  }

  openImage(nameModal: TemplateRef<any>, logotype: string) {
    this.dialog.open(nameModal);
    this.logotypeModal = logotype;
  }
  

  openModalImage(nameModal: any) {
    this.dialog.open(nameModal);
  }

  showWarnning(msg: any) {
    if (this.cookieService.check('isLogin')) {
      this.toastr.warning(msg, 'Advertencia!', {
        timeOut: 1500
      });
    }
  }

}
