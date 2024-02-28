import { NgFor } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Cliente } from '../Models/cliente.models';
import { ClientesServiceService } from '../Services/clientes-service.service';

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
import { CamionerosService } from '../Services/camioneros.service';
 

//servicios
import { NotificacionService } from '../Services/notificacion.service';
import { take } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { VendedoresService } from '../Services/vendedores.service';
import { Vendedor } from '../Models/vendedor.models';
import { Camionero } from '../Models/camionero.models';
@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})



export class ClientesComponent implements OnInit, AfterViewInit {
  nuevoCliente: Cliente;
  clientes: Cliente[] = new Array();
  cliente: any[] = new Array();
  existenClientes: boolean = false;
  mostrarNotificacion: boolean = false;
  aceptado: boolean = false;
  displayedColumns: string[] = ['numero', 'nombre', 'ciudad', 'direccion','vendedor','camionero', 'Editar', 'Eliminar'];
  dataSource = new MatTableDataSource<Cliente>();
  vendedores: Vendedor[] = new Array();
  camioneros: Camionero[] = new Array();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  pageSize = 5; 

  notificationRef: any; // Tipo debe ser ajustado según tu configuración de TypeScript
  notificationResponse$ = this.notificationService.getNotificationResponse$();


  constructor(
    private clienteService: ClientesServiceService,
    private notificationService: NotificacionService,
    private vendedoresService: VendedoresService,
    private camioneroService: CamionerosService,
    private matPaginatorIntl: MatPaginatorIntl) {
    this.nuevoCliente = new Cliente();

  }

  async ngOnInit() {
    this.obtenerVendedores();
   

    this.vendedores = await this.obtenerVendedores()
    this.obtenerCamioneros()
      .then((cam) => {
        this.camioneros = cam;
      })

    this.matPaginatorIntl.itemsPerPageLabel = 'Elementos por página:';
    this.matPaginatorIntl.nextPageLabel = 'Siguiente página';
    this.matPaginatorIntl.previousPageLabel = 'Página anterior';


    //this.dataSource.data = this.clientes;
    //this.dataSource.paginator = this.paginator;
    this.ObtenerClientes();

  }

  ngAfterViewInit() {
     
    this.dataSource.paginator = this.paginator;
    setTimeout(() => { this.dataSource.paginator = this.paginator },(250));

  }


  camioneroselectChange(event: any) {
 
    
    this.nuevoCliente.camioneroid = parseInt(event.target.value);
  }


  vendedorselectChange(event: any) {
   
    this.nuevoCliente.vendedorid = parseInt(event.target.value);

  }


  obtenerVendedores(): Promise<Vendedor[]> {

    return new Promise((resolve, reject) => {
      this.vendedoresService.getVendedores().subscribe((v) => {
         
        this.vendedores = v;

        if (this.vendedores.length > 0) {
          resolve(this.vendedores);
          
        }
        else {
          reject(new Error('Ocurrio un error al obtener los vendedores.'));
         
        }
      })
    })
     
  }

  obtenerCamioneros(): Promise<Camionero[]> {
     
    return new Promise((resolve, reject) => {

      this.camioneroService.getCamioneros()
        .subscribe(camioneros => {
          this.camioneros = camioneros;

          if (this.camioneros.length > 0) {
            resolve(this.camioneros);

          }
          else {
            reject(" Ups! No existen camioneros u ocurrio un error en el back.");
            
          }
        });

    })

    
  }


  showNotification(texto: string): void {

    this.notificationService.showNotification("Atención", texto,false);

  }
  agregarAdmin() {

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



  ObtenerClientes() {
    console.log("obteniendo clientes")
    this.clienteService.getClientes()
      .pipe(
        finalize(() => {
          if (this.clientes.length > 0) {
            this.existenClientes = true;
            
            this.dataSource.data = [];
            this.dataSource.data = this.clientes;
            this.dataSource.paginator = this.paginator;
            console.log("se ejecuto el metodo finalice", this.clientes)
          }
          else {
            this.existenClientes = false;
          }
        }))

      .subscribe(clientes => {
      this.clientes = clientes;
    });
    setTimeout(() => { this.dataSource.paginator = this.paginator }, (250));
  }

  agregarCliente() {
    
    this.showNotification("Esta seguro que desea agregar el cliente?");
    this.notificationResponse$.pipe(take(1)).subscribe((response) => {
      if (response) {
        console.log("entro a cambiar");
  
        this.clienteService.postClientes(this.nuevoCliente).subscribe(
          response => {
            console.log('Datos enviados con éxito:', response);
            this.ObtenerClientes()
          },
          error => {
            console.error('Error al enviar los datos:', error);
          });
     


      }
    });
 
}

  eliminarCliente(id: number) {
    this.showNotification("Esta seguro que desea eliminar el cliente?");
    this.notificationResponse$.pipe(take(1)).subscribe((response) => {
      if (response) {
        console.log("intentando eliminar cliente: ", id)
        this.clienteService.deleteCliente(id).subscribe(
          response => {
            console.log('Eliminado con éxito:', response);
            // Realiza cualquier lógica adicional después de enviar los datos
            this.ObtenerClientes()
          },
          error => {
            console.error('Error al eliminar:', error);
          }
        );
        //refrescamos la lista de clientes
      }
  });

  }

  editarCliente(cliente: Cliente) {
   
    console.log("el valor que se va a enviar es", cliente.nombre);
    this.clienteService.editarClienteVentana(cliente);
  }




}

  
