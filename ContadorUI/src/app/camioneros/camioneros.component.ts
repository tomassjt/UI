import { NgFor } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Cliente } from '../Models/cliente.models';
import { ClientesServiceService } from '../Services/clientes-service.service';
Camionero
/*material*/

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { NotificacionComponent } from '../utils/notificacion/notificacion.component';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';


//servicios
import { NotificacionService } from '../Services/notificacion.service';
import { take } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { CamionerosService } from '../Services/camioneros.service';
import { Camionero } from '../Models/camionero.models';
@Component({
  selector: 'app-camioneros',
  templateUrl: './camioneros.component.html',
  styleUrls: ['./camioneros.component.css']
})

export class CamionerosComponent implements OnInit, AfterViewInit{
  nuevoCamionero: Camionero;
  camioneros: Camionero[] = new Array();
  camionero: Camionero = new Camionero();
  existenCamioneros: boolean = false;
  mostrarNotificacion: boolean = false;
  aceptado: boolean = false;
  displayedColumns: string[] = ['id', 'nombre', 'telefono', 'direccion', 'Porcentaje Flete', 'Editar', 'Eliminar'];
  dataSource = new MatTableDataSource<Camionero>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  pageSize = 5;

  notificationRef: any; // Tipo debe ser ajustado según tu configuración de TypeScript
  notificationResponse$ = this.notificationService.getNotificationResponse$();


  constructor(
    private camioneroService: CamionerosService,
    private notificationService: NotificacionService,
    private matPaginatorIntl: MatPaginatorIntl) {
    this.nuevoCamionero = new Camionero();

  }

  ngOnInit() {

    this.matPaginatorIntl.itemsPerPageLabel = 'Elementos por página:';
    this.matPaginatorIntl.nextPageLabel = 'Siguiente página';
    this.matPaginatorIntl.previousPageLabel = 'Página anterior';


    //this.dataSource.data = this.clientes;
    //this.dataSource.paginator = this.paginator;
    this.ObtenerCamioneros();

  }

  ngAfterViewInit() {

    this.dataSource.paginator = this.paginator;
    setTimeout(() => { this.dataSource.paginator = this.paginator }, (250));
  }


  showNotification(texto: string): void {

    this.notificationService.showNotification("Atención",texto,false);

  }
    //openNotification(): void {
  //  if (this.notificationRef) {
  //    this.notificationRef.instance.open();
  //  }
  //}

  //closeNotification(): void {
  //  if (this.notificationRef) {
  //    this.notificationRef.instance.close();
  //  }
  //}

  ObtenerCamioneros() {
    console.log("obteniendo camioneros")
    this.camioneroService.getCamioneros()
      .pipe(
        finalize(() => {
          if (this.camioneros.length > 0) {
            this.existenCamioneros = true;

            this.dataSource.data = [];
            this.dataSource.data = this.camioneros;
            this.dataSource.paginator = this.paginator;
            console.log("se ejecuto el metodo finalice", this.camioneros)
          }
          else {
            this.existenCamioneros = false;
          }
        }))

      .subscribe(camioneros => {
        this.camioneros = camioneros;
      });
    setTimeout(() => { this.dataSource.paginator = this.paginator }, (250));
  }

  agregarCamionero() {
    this.nuevoCamionero = this.camionero;
    console.log("camionero a agregar ", this.nuevoCamionero)
    this.showNotification("Esta seguro que desea agregar el camionero?");
    this.notificationResponse$.pipe(take(1)).subscribe((response) => {
      if (response) {
        console.log("entro a cambiar");

        this.camioneroService.postCamioneros(this.nuevoCamionero).subscribe(
          response => {
            console.log('Datos enviados con éxito:', response);
            this.ObtenerCamioneros()
          },
          error => {
            console.error('Error al enviar los datos:', error);
          });



      }
    });

  }

  eliminarCamionero(id: number) {
    
    this.showNotification("Esta seguro que desea eliminar el camionero?");
    this.notificationResponse$.pipe(take(1)).subscribe((response) => {
      if (response) {
        console.log("intentando eliminar camionero: ", id)
        this.camioneroService.deleteCamionero(id).subscribe(
          response => {
            console.log('Eliminado con éxito:', response);
            // Realiza cualquier lógica adicional después de enviar los datos
            this.ObtenerCamioneros()
          },
          error => {
            console.error('Error al eliminar:', error);
          }
        );
        //refrescamos la lista de clientes
      }
    });

  }

  editarCamionero(camionero: Camionero) {

    console.log("el valor que se va a enviar es", camionero.Nombre);
    this.camioneroService.editarCamionero(camionero);
  }






}
