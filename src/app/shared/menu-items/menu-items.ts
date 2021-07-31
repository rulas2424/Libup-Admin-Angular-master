import { Injectable } from '@angular/core';

export interface Menu {
  state: string;
  name: string;
  type: string;
  icon: string;
}

const MENUITEMS = [
  { state: 'comercios', type: 'link', name: 'Comercios', icon: 'store_mall_directory' },
  { state: 'categorias', type: 'link', name: 'Categorías', icon: 'category' },
  { state: 'usuarios-app', type: 'link', name: 'Usuarios APP', icon: 'people_alt' },
  { state: 'usuarios-admin', type: 'link', name: 'Usuarios Admin', icon: 'perm_identity' },
  { state: 'promociones', type: 'link', name: 'Promociones', icon: 'card_giftcard' },
  { state: 'descuentos', type: 'link', name: 'Descuentos', icon: 'receipt' },
];

@Injectable()
export class MenuItems {
  getMenuitem(): Menu[] {
    return MENUITEMS;
  }
}
