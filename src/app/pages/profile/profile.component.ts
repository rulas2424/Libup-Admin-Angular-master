import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { MustMatch } from '../../_helpers/must-match.validator';
import { UserService } from '../../services/user.service';
import { CookieService } from 'ngx-cookie-service';
import { MatDialog } from '@angular/material';
import { CommonAlerts } from '../../Common/common-alerts';
import { ApiConfigService } from '../../services/api-config.service';
import { Md5 } from "md5-typescript";
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  formUsers: FormGroup;
  passForm: FormGroup;
  base64ImageFile: any;
  imageProfile: string;
  userAdmin: UserAdmin;
  @ViewChild('spinner', { static: true }) spinerDialog: TemplateRef<any>;
  constructor(public fb: FormBuilder, private userService: UserService, private cookieService: CookieService, public dialog: MatDialog,
    private comonAlerts: CommonAlerts, private apiconf: ApiConfigService) {
    this.formUsers = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/)]],
      phoneNumber: new FormControl('', [
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.pattern('^[0-9]*$')]),
    })

    this.passForm = this.fb.group({
      currentPassword: ['', Validators.required],
      password: ['', [Validators.required]],
      confirmPassword: ['', Validators.required],
    }, {
        validator: MustMatch('password', 'confirmPassword')
      })
  }

  ngOnInit() {   
    this.getUserAdminById();
  }

  onUpdateFileChange(event: any) {
    let file = (<HTMLInputElement>document.getElementById('imageUpload')).files[0];
    //var tmppath = URL.createObjectURL(event.target.files[0]);
    //$("img").fadeIn("fast").attr('src',URL.createObjectURL(event.target.files[0]));
    var promise = this.encodeImagetoBase64(file);
    let toArray = file.name.split(".");
    let that = this;
    promise.then(function (result) {
      that.imageProfile = "data:image/" + toArray[1] + ";base64," + result.toString().split(',')[1]
      var base64result = result.toString().split(',')[1]
      that.base64ImageFile = base64result;
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

  getUserAdminById() {
    this.formUsers.reset()
    this.openSpinner();
    this.userService.getAdminById(this.cookieService.get('isLogin')).subscribe((response: any) => {
      this.userAdmin = response.data;
      if(this.userAdmin.profile !== null){
        this.imageProfile = this.apiconf.serverImages + "profile_pictures/admin/" + this.userAdmin.profile;
      } else{
        this.imageProfile = "assets/images/users/notFound.jpg";
      }     
      this.formUsers.controls['name'].setValue(this.userAdmin.name)
      this.formUsers.controls['lastName'].setValue(this.userAdmin.lastName)
      this.formUsers.controls['email'].setValue(this.userAdmin.email)
      this.formUsers.controls['phoneNumber'].setValue(this.userAdmin.phoneNumber)
    }, (error) => {
      this.comonAlerts.showToastError(error)
    });
    this.cleanData();
  }

  cleanData() {
    this.dialog.closeAll()
    this.base64ImageFile = "";
  }

  openSpinner() {
    this.dialog.open(this.spinerDialog, {
      panelClass: 'my-spinner'
    });
  }

  updateUser() {
    if(!this.formUsers.valid){
      return;
    }

    var shop;
    if(this.userAdmin.typeAdmin == 'SuperAdmin'){
      shop = '';
    } else {
      shop = this.cookieService.get('shop');
    }
    var param = {
      idAdmin: this.cookieService.get('isLogin'),
      name: this.formUsers.value.name,
      lastName: this.formUsers.value.lastName,
      email: this.formUsers.value.email,
      profilePicture: this.base64ImageFile,
      phoneNumber: this.formUsers.value.phoneNumber,
      typeAdmin: this.userAdmin.typeAdmin,
      idShop: shop
    }
    let body = JSON.stringify(param);    
    this.userService.updateUsersAdmin(body).subscribe((response: any) => {      
      this.comonAlerts.showSuccess(response.header.message)
      this.getUserAdminById();
    }, (error) => {
      this.comonAlerts.showToastError(error)
    });
    this.cleanData();
  }

  changePassword() {
    if(!this.passForm.valid){
      return;
    }

    var params = {
      idAdmin: this.cookieService.get('isLogin'),
      currentPassword: Md5.init(this.passForm.value.currentPassword),
      newPassword: Md5.init(this.passForm.value.confirmPassword)
    }
    let body = JSON.stringify(params);
    this.userService.changePassword(body).subscribe((response: any) => {      
      this.comonAlerts.showSuccess(response.header.message)    
      this.passForm.reset();  
    }, (error) => {
      this.comonAlerts.showToastError(error)
    });
   
  }
}

export interface UserAdmin {
  active: boolean
  email: string
  idAdmin: string
  idShop: string
  lastName: string
  name: string
  nameShop: string
  phoneNumber: string
  profile: string
  typeAdmin: string
}