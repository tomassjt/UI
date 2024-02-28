import { AfterViewInit } from '@angular/core';
import { OnInit } from '@angular/core';
import { Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Vendedor } from '../Models/vendedor.models';
 
//servicios
import { NotificacionService } from '../Services/notificacion.service';
import { take } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { VendedoresService } from '../Services/vendedores.service';
import { ClientesServiceService } from '../Services/clientes-service.service';
import { FacturasService } from '../Services/facturas.service';
 


@Component({
  selector: 'app-vendedores',
  templateUrl: './vendedores.component.html',
  styleUrls: ['./vendedores.component.css']
})


export class VendedoresComponent implements OnInit, AfterViewInit{
  vendedor: Vendedor = new Vendedor();
  Vendedores : Vendedor [] = new Array();
  existenVendedores: boolean = true;
  dataSource = new MatTableDataSource<Vendedor>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: string[] = ['id', 'nombre', 'direccion', 'Porcentaje Flete', 'Editar', 'Eliminar'];
  pageSize = 5;
  notificationRef: any; // Tipo debe ser ajustado según tu configuración de TypeScript
  notificationResponse$ = this.notificationService.getNotificationResponse$();

  constructor(
    private notificationService: NotificacionService,
    private matPaginatorIntl: MatPaginatorIntl,
    private vendedoresService: VendedoresService) { }

  
  ngOnInit() {

    this.matPaginatorIntl.itemsPerPageLabel = 'Elementos por página:';
    this.matPaginatorIntl.nextPageLabel = 'Siguiente página';
    this.matPaginatorIntl.previousPageLabel = 'Página anterior';


    //this.dataSource.data = this.clientes;
    //this.dataSource.paginator = this.paginator;
    this.ObtenerVendedores();

  }

  ngAfterViewInit() {

    this.dataSource.paginator = this.paginator;
    setTimeout(() => { this.dataSource.paginator = this.paginator }, (250));
  }

  showNotification(texto: string): void {

    this.notificationService.showNotification("Atención", texto,false);


  }


  ObtenerVendedores() {
    console.log("obteniendo vendedores")
    this.vendedoresService.getVendedores()
      .pipe(
        finalize(() => {
          if (this.Vendedores.length > 0) {
            this.existenVendedores = true;

            this.dataSource.data = [];
            this.dataSource.data = this.Vendedores;
            this.dataSource.paginator = this.paginator;
            console.log("se ejecuto el metodo finalice", this.Vendedores)
          }
          else {
            this.existenVendedores = false;
          }
        }))

      .subscribe((vendedores: Vendedor[]) => {
        this.Vendedores = vendedores;
      });

    setTimeout(() => { this.dataSource.paginator = this.paginator }, (250));
  }

  agregarVendedor() {
    this.showNotification("Esta seguro que desea agregar el vendedor?");
    this.notificationResponse$.pipe(take(1)).subscribe((response) => {
      if (response) {
        

        this.vendedoresService.postClientes(this.vendedor).subscribe(
          response => {
            console.log('Datos enviados con éxito:', response);
            this.ObtenerVendedores()
          },
          error => {
            console.error('Error al enviar los datos:', error);
          });



      }
    });

  }

  editarVendedor(vendedor: Vendedor) {
    this.vendedoresService.editarVendedorVentana(vendedor);
    setTimeout(() => { this.dataSource.paginator = this.paginator }, (250));
  }

  eliminarVendedor(id: number) {
    this.showNotification("Esta seguro que desea eliminar el cliente?");
    this.notificationResponse$.pipe(take(1)).subscribe((response) => {
      if (response) {
        console.log("intentando eliminar cliente: ", id)
        this.vendedoresService.deleteVendedor(id).subscribe(
          response => {
            console.log('Eliminado con éxito:', response);
            // Realiza cualquier lógica adicional después de enviar los datos
            this.ObtenerVendedores()
          },
          error => {
            console.error('Error al eliminar:', error);
          }
        );
        //refrescamos la lista de clientes
      }
    });
  }
}
