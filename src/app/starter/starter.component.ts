import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  Input,
} from "@angular/core";
import { UserService } from "../services/user.service";
import { User } from "../classes/user";
import { Router } from "@angular/router";
import { CookieService } from "ngx-cookie-service";
import { MatDialog, MatSnackBar } from "@angular/material";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Md5 } from "md5-typescript";
import { Roles } from "../classes/roles";
import { EncrDecrService } from "../classes/EncrDecrService";
import { ApiConfigService } from "../services/api-config.service";
import { DomSanitizer } from "@angular/platform-browser";
declare var $: any;
@Component({
  selector: "app-starter",
  templateUrl: "./starter.component.html",
  styleUrls: ["./starter.component.scss"],
})
export class StarterComponent implements OnInit {
  userForm: FormGroup;
  urlPayout: any;
  public user: User;
  public loading = false;
  @ViewChild("spinner", { static: true }) spinerDialog: TemplateRef<any>;
  @ViewChild("iframeModal", { static: true }) iframeModal: TemplateRef<any>;
  constructor(
    private userService: UserService,
    private router: Router,
    private roles: Roles,
    private cookieService: CookieService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private EncrDecr: EncrDecrService,
    private apiConf: ApiConfigService,
    private sanitizer: DomSanitizer
  ) {
    this.userForm = this.fb.group({
      email: [
        "",
        [
          Validators.required,
          Validators.pattern(
            /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/
          ),
        ],
      ],
      password: ["", Validators.required],
    });
  }
  ngOnInit(): void {
    this.cookieService.deleteAll();
    this.dialog.closeAll();
    this.userForm.reset();
  }

  setAuthToken(token: any, idUser: any) {
    this.cookieService.set("jwt", token);
    this.cookieService.set("isLogin", idUser);
  }

  openSpinner() {
    this.dialog.open(this.spinerDialog, {
      panelClass: "my-spinner",
    });
  }

  openIframe() {
    this.dialog.open(this.iframeModal, {
      disableClose: true,
      panelClass: ["full-screen-modal"],
    });
  }

  loginUser() {
    if (!this.userForm.valid) {
      return;
    }
    this.openSpinner();
    var params = {
      email: this.userForm.value.email,
      password: Md5.init(this.userForm.value.password),
    };
    let body = JSON.stringify(params);
    this.userService.loginUser(body).subscribe(
      (data) => {
        this.cookieService.set("shop", data.data.idShop);
        this.cookieService.set("nameShop", data.data.nameShop);
        this.cookieService.set("idBroadcaster", data.data.idBroadcaster);
        if (data.data.typeAdmin == "Radio") {
          this.setAuthToken(data.data.jwt, data.data.idUser);
          this.cookieService.set("latitude", data.data.latitude);
          this.cookieService.set("longitude", data.data.longitude);
          this.router.navigate(["/contratos/comercio"]);
        } else {
          if (data.data.typeAdmin == "Comercio") {
            /*if(data.data.isPlanActive == false){          
            this.loading = true
            this.urlPayout = this.sanitizer.bypassSecurityTrustResourceUrl('https://libup.mx/payment/index.php?uid_shop=' + data.data.idShop + '&id_admin=' + data.data.idUser)
            this.openIframe()
            return;
          }      */
          }
          this.setAuthToken(data.data.jwt, data.data.idUser);
          this.router.navigate(["/comercios"]);
          this.cookieService.set("latitude", data.data.latitude);
          this.cookieService.set("longitude", data.data.longitude);
        }
        var rolEncrypted = this.EncrDecr.set(
          this.apiConf.encript,
          data.data.typeAdmin.toString()
        );
        this.cookieService.set("rol", rolEncrypted);
        this.dialog.closeAll();
      },
      (error) => {
        this.showToastError(error);
        this.dialog.closeAll();
      }
    );
  }

  onLoad() {
    this.loading = false;
  }

  cancelar() {
    this.dialog.closeAll();
  }

  showToastError(message: string) {
    this._snackBar.open(message, "Ok", {
      duration: 1500,
      panelClass: ["snackbarerror"],
    });
  }

  showSuccess(msg: any) {
    this._snackBar.open(msg, "Ok", {
      duration: 1500,
      panelClass: ["snackbarsuccess"],
    });
  }
}
