import { Component, Input , OnInit} from '@angular/core';
import { ClientesServiceService } from '../../Services/clientes-service.service';
/*material*/

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Cliente } from '../../Models/cliente.models';
import { FormsModule } from '@angular/forms';
import { Camionero } from '../../Models/camionero.models';
import { CamionerosService } from '../../Services/camioneros.service';
import { VendedoresService } from '../../Services/vendedores.service';
import { Vendedor } from '../../Models/vendedor.models';


@Component({
  selector: 'app-ventana-editar-cliente',
  templateUrl: './ventana-editar-cliente.component.html',
  styleUrls: ['./ventana-editar-cliente.component.css']
})

export class VentanaEditarClienteComponent implements OnInit {
  //variables
  nuevoCliente: Cliente = new Cliente();
  isVisible: boolean = true;
  @Input() clienteAEditar?: Cliente;
  camioneros: Camionero[] = new Array();
  vendedores: Vendedor[] = new Array();

  constructor(
    private clienteService: ClientesServiceService,
    private camioneroService: CamionerosService,
    private vendedoresService: VendedoresService
  ) {

  }
  ngOnInit() {
    this.obtenerVendedores();
    this.obtenerCamioneros();

    this.nuevoCliente = new Cliente();
    this.nuevoCliente.nombre = this.clienteAEditar?.nombre;

    if (this.clienteAEditar != null) {
      this.nuevoCliente = this.clienteAEditar;
    }
    console.log("el cliente ingresado en el consturctor es", this.clienteAEditar)

  }

  editarCliente(id: any, clienteActualizado: Cliente) {

    this.clienteService.actualizarCliente(id, clienteActualizado).subscribe(
      () => {
        console.log('Cliente actualizado con éxito');
        // Realiza cualquier operación necesaria después de la actualización
        this.isVisible = false;
      },
      (error) => {
        console.error('Error al actualizar el cliente:', error);
      }
    )
  };

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
 
}
