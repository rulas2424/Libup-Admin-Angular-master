import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatTableDataSource, MatDialog, MatPaginator, MatSort } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoriesService } from '../../services/categories-service';
import { CommonAlerts } from '../../Common/common-alerts';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  templateRef: TemplateRef<any>;
  limit: number = 10;
  totalLength: number = 0;
  pageIndex: number = 0;
  pageLimit: number[] = [5, 10, 20];
  formCategory: FormGroup;
  title: string = "";
  isUpdate: boolean = false;
  idCategory: string;
  public categories = new MatTableDataSource<any>();
  public displayedColumns = ['name', 'active', 'update'
  ];
  buttonText: string = "Agregar";
  isLoaded: boolean = false;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('spinner', { static: true }) spinerDialog: TemplateRef<any>;
  constructor(public fb: FormBuilder, public dialog: MatDialog, private categoriesServive: CategoriesService, private comonAlerts: CommonAlerts) {
    this.formCategory = this.fb.group({
      name: ['', Validators.required]
    })
  }

  ngAfterViewInit() {
    this.categories.paginator = this.paginator;
    this.categories.sort = this.sort;
  }

  ngOnInit() {
    this.getAllCategories();
  }

  public applyFilter = (value: string) => {
    this.categories.filter = value.trim().toLocaleLowerCase();
  }

  getAllCategories() {
    this.openSpinner();
    this.categoriesServive.getAllCategories().subscribe((response: any) => {
      this.categories.data = response.data.categoryList;     
      this.isLoaded = true;
    }, (error) => {
      this.comonAlerts.showToastError(error)
    });
    this.cleanData();
  }

  openDialogAddCategory(templateRef: TemplateRef<any>) {
    this.cleanData();
    this.isUpdate = false;
    this.buttonText = "Agregar";
    this.title = "¿Deseas registrar una nueva categoría?";
    this.dialog.open(templateRef, { disableClose: true });
  }


  openDialogUpdate(templateRef: TemplateRef<any>, categoria: any) {
    this.title = "¿Deseas actualizar la categoría?";
    this.isUpdate = true;
    this.idCategory = categoria.idCategory;
    this.buttonText = "Actualizar";
    this.formCategory.controls['name'].setValue(categoria.name);
    this.dialog.open(templateRef, { disableClose: true });
  }

  cleanData() {
    this.formCategory.reset();
    this.dialog.closeAll()
  }

  openSpinner() {
    this.dialog.open(this.spinerDialog, {
      panelClass: 'my-spinner'
    });
  }


  addOrUpdateCategory(categoryForm: any) {
    if (!categoryForm.valid) {
      return;
    }
    this.openSpinner();
    if (this.isUpdate == true) {
      var paramUpdate = {
        idCategory: this.idCategory,
        nameCategory: this.formCategory.value.name,
      };
      let body = JSON.stringify(paramUpdate);
      this.categoriesServive.updateCategories(body).subscribe((response: any) => {
        this.comonAlerts.showSuccess(response.header.message)
        this.getAllCategories();
      }, (error) => {
        this.comonAlerts.showToastError(error)
        this.cleanData()
      });

    } else {
      var param = {
        nameCategory: categoryForm.value.name,
      };
      let body = JSON.stringify(param);
      this.categoriesServive.addCategories(body).subscribe((response: any) => {
        this.comonAlerts.showSuccess(response.header.message)
        this.getAllCategories();
      }, (error) => {
        this.comonAlerts.showToastError(error)
        this.cleanData()
      });
    }
  }

  changeStatusActive(event: any, idCategory: string) {
    var param = {
      idCategory: idCategory,
      active: event.checked
    }
    let body = JSON.stringify(param);
    this.categoriesServive.changeStatus(body).subscribe((response: any) => {
      this.comonAlerts.showSuccess(response.header.message)
      this.getAllCategories()
    }, (error) => {      
      this.comonAlerts.showToastError(error)
      this.getAllCategories()
    });
  }


}
