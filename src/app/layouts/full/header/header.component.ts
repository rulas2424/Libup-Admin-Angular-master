import { Component, OnInit } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { Router } from "@angular/router";
import { EncrDecrService } from "../../../classes/EncrDecrService";
import { ApiConfigService } from "../../../services/api-config.service";
import { UserService } from "../../../services/user.service";
declare var $: any;
@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: [],
})
export class AppHeaderComponent implements OnInit {
  constructor(
    public cookieService: CookieService,
    private router: Router,
    private EncrDecr: EncrDecrService,
    private userAdminService: UserService,
    private apiconf: ApiConfigService
  ) {}
  ngOnInit(): void {
    this.getPlanActive();
  }

  goToProfile() {
    this.router.navigateByUrl("profile");
  }

  cerrarSesion() {
    this.cookieService.deleteAll();
    this.router.navigate(["login"]);
  }

  decriptValue() {
    var decrypted = this.EncrDecr.get(
      this.apiconf.encript,
      this.cookieService.get("rol").toString()
    );
    return decrypted.toString();
  }

  getValue(valor: any) {
    console.warn(this.cookieService.get(valor));
    return this.cookieService.get(valor);
  }

  getPlanActive() {
    if (this.cookieService.check("isLogin")) {
      console.log(this.cookieService.get("shop"));
      this.userAdminService
        .verifyPlan(this.cookieService.get("shop"))
        .subscribe(
          (response: any) => {
            console.log(response.data);
            $("#used").text(response.data.notificationsUsed);
            $("#allowed").text(response.data.notificationsAllowed);
            $("#vence").text(response.data.dateEnded);
          },
          (error) => {
            console.warn(error);
            this.router.navigateByUrl("/login");
          }
        );
    }
  }
}
