import { Component, Input, OnInit } from '@angular/core';
import { ClientesServiceService } from '../../Services/clientes-service.service';
/*material*/

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Cliente } from '../../Models/cliente.models';
import { FormsModule } from '@angular/forms';
import { Vendedor } from '../../Models/vendedor.models';
import { VendedoresService } from '../../Services/vendedores.service';

@Component({
  selector: 'app-ventana-editar-vendedor',
  templateUrl: './ventana-editar-vendedor.component.html',
  styleUrls: ['./ventana-editar-vendedor.component.css']
})

export class VentanaEditarVendedorComponent implements OnInit{
  //variables
  vendedor: Vendedor = new Vendedor();
  isVisible: boolean = true;
  @Input() VendedorAEditar?: Vendedor;

  constructor(private VendedoresService: VendedoresService) {

  }


  ngOnInit() {
    this.vendedor = new Vendedor();

    if (this.VendedorAEditar != null) {
      this.vendedor = this.VendedorAEditar;
    }
    console.log("el cliente ingresado en el consturctor es", this.VendedorAEditar)

  }

  editarVendedor(id: any, vendedorActualizado: Cliente) {

    this.VendedoresService.actualizarVendedor(id, vendedorActualizado).subscribe(
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

}
