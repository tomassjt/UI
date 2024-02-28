import { Component, Input, OnInit } from '@angular/core';
import { NgModule } from '@angular/core'; 
import { ClientesServiceService } from '../../Services/clientes-service.service';
/*material*/

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Cliente } from '../../Models/cliente.models';
import { FormsModule } from '@angular/forms';
import { Camionero } from '../../Models/camionero.models';
import { CamionerosService } from '../../Services/camioneros.service';


@Component({
  selector: 'app-ventana-editar-camionero',
  templateUrl: './ventana-editar-camionero.component.html',
  styleUrls: ['./ventana-editar-camionero.component.css']
})

export class VentanaEditarCamioneroComponent implements OnInit {
  //variables
  nuevoCamionero: Camionero = new Camionero();
  isVisible: boolean = true;
  @Input() camioneroAEditar?: Camionero;

  constructor(private camioneroService: CamionerosService) {

  }
  ngOnInit() {
    this.nuevoCamionero = new Camionero();
    this.nuevoCamionero.Nombre = this.camioneroAEditar?.Nombre;

    if (this.camioneroAEditar != null) {
      this.nuevoCamionero = this.camioneroAEditar;
    }
    console.log("el camionero ingresado en el consturctor es", this.camioneroAEditar)

  }

  editarCamionero(id: any, camioneroActualizado: Camionero) {

    this.camioneroService.actualizarCamionero(id, camioneroActualizado).subscribe(
      () => {
        console.log('Camionero actualizado con éxito');
        // Realiza cualquier operación necesaria después de la actualización
        this.isVisible = false;
      },
      (error) => {
        console.error('Error al actualizar el camionero:', error);
      }
    )
  };

   
 
}
