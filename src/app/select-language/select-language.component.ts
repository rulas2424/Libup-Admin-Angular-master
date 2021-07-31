import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-select-language',
  template: ``,
//   template: `
//   <select #langSelect style="background: #f9efd3; border-color: #f9efd3" (change)="translate.use(langSelect.value)">
//   <option
//     *ngFor="let lang of translate.getLangs()"
//     [value]="lang"
//     [attr.selected]="lang === translate.currentLang ? '' : null"
//   >{{lang == 'es' ? 'Español' : 'English'}}</option>
// </select>
//   `,
  styles: []
})
export class SelectLanguageComponent implements OnInit {

  constructor(public translate: TranslateService) {
    translate.addLangs(['en', 'es']);
    translate.setDefaultLang('es');

    const browserLang = translate.getBrowserLang();
    translate.use(browserLang.match(/en|es/) ? browserLang : 'es');
  }

  ngOnInit() {
  }


}


