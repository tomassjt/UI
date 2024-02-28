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
import { CamionerosService } from '../Services/camioneros.service';
import { Cantidades } from '../Models/cantiddades.models';
import { Factura } from '../Models/factura.models';
import { Admin } from '../Models/admin.models ';
import { AdminService } from '../Services/adminService';



@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css']
})
export class PrincipalComponent implements OnInit {

  //VARIABLES
  cantidades: Cantidades = new Cantidades();
  admin: Admin = new Admin();
  notificationRef: any; // Tipo debe ser ajustado según tu configuración de TypeScript
  notificationResponse$ = this.notificationService.getNotificationResponse$();
  existeAdmin: boolean = false;
  displayedColumns: string[] = ['id', 'nombre', 'Direccion', 'Correo', 'Saldo', 'PorcentajeFlete','Editar'];
  dataSource = new MatTableDataSource<any>();
  Editar : boolean = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  pageSize = 5;


  //CONSTRUCTOR
  constructor(
    private notificationService: NotificacionService,
    private matPaginatorIntl: MatPaginatorIntl,
    private vendedoresService: VendedoresService,
    private clientesServiceService: ClientesServiceService,
    private facturasService: FacturasService,
    private camionerosService: CamionerosService,
    private adminService: AdminService
  ) { }

  //ngoninit
  ngOnInit() {

    this.obtenerCantidades();
    this.obtenerAdmin();

    this.matPaginatorIntl.itemsPerPageLabel = 'Elementos por página:';
    this.matPaginatorIntl.nextPageLabel = 'Siguiente página';
    this.matPaginatorIntl.previousPageLabel = 'Página anterior';




    //this.matPaginatorIntl.itemsPerPageLabel = 'Elementos por página:';
    //this.matPaginatorIntl.nextPageLabel = 'Siguiente página';
    //this.matPaginatorIntl.previousPageLabel = 'Página anterior';


    //this.dataSource.data = this.clientes;
    //this.dataSource.paginator = this.paginator;

  }

  editarAdmin(element: any) {
    this.actualizarAdmin(element);
    this.obtenerAdmin();
  }

  HabilitaractualizarAdmin() {
    this.Editar = !this.Editar;
  }

  actualizarAdmin(admin: Admin) {

    if (admin.id != null) {
      var id = admin.id;
    }
    this.showNotification("Esta seguro que desea modificar el admin: " + admin.id + "?");
    this.notificationResponse$
      .pipe(take(1)).subscribe((response) => {
        if (response) {


          this.adminService.actualizarAdmin(id, admin).subscribe(
            response => {
              console.log(response);
            },
            error => {
              console.log(error);
            });


        }
        else {
          this.dataSource.data = [];
          this.obtenerAdmin();
        }
      });


    this.Editar = false;
   


  }

  obtenerAdmin() {
    this.admin = new Admin();
    var adm: any = new Object();
    this.dataSource.data = [];
    this.adminService.getAdmin(1).subscribe(ad => {
      adm = ad;
      console.log("adminnnnn", adm);
      this.admin = adm;
      this.admin.id = adm.id;
      this.admin.nombre = adm.nombre;
      this.admin.Correo = adm.correo;
      this.admin.PorcentajeFlete = adm.porcentajeFlete;
      this.admin.Direccion = adm.direccion;
      this.admin.Dni = adm.dni;
      this.admin.Saldo = adm.saldo;
      if (this.admin.id == 1) {
        this.existeAdmin = true;
        this.dataSource.data.push(this.admin);
        this.dataSource.paginator = this.paginator;
      }
      else {
        this.existeAdmin = false;
      }
    });
    
    
    console.log("ULTIMO RETORNO",this.admin)
  }


  agregarAdmin() {
   
    this.showNotification("Esta seguro que desea agregar el admin: " + this.admin.id + "?");
    this.notificationResponse$
      .pipe(take(1)).subscribe((response) => {
        if (response) {


          this.adminService.postAdmins(this.admin).subscribe(
            response => {
              console.log(response);
            },
            error => {
              console.log(error);
            });


        }
      });
    
  }
  showNotification(texto: string): void {

    this.notificationService.showNotification("Atención", texto,false);

  }

  obtenerCantidades() {
    this.clientesServiceService.cantidadTotalClientes().subscribe(
      (resultado: number) => {
        this.cantidades.clientes = resultado;
        //alert(resultado)
      },
      (error) => {
        console.error(error);
      }
    );
    
  this.facturasService.GetcantidadTotalFacturas().subscribe(
    (resultado: number) => {
        this.cantidades.facturas = resultado;
    },
    (error) => {
      console.error(error);
    }
    );

    this.camionerosService.cantidadTotalCamioneros().subscribe ( 
      (resultado: number) => {
        this.cantidades.camioneros = resultado;
      },
      (error) => {
        console.error(error);
      }
    );

    this.vendedoresService.cantidadTotalVendedores().subscribe(
      (resultado: number) => {
        this.cantidades.vendedores = resultado;
        
      },
      (error) => {
        console.error(error);
      }
    );


 
    this.cantidades.ventas = 0;
    
}


}


