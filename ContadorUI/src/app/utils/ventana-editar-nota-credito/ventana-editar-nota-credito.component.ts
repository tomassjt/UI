import { Component, Input, OnInit } from '@angular/core';
import { NotaDeCredito } from '../../Models/notaDeCredito';
import { notaDeCreditoService } from '../../Services/notaDeCredito.service';

@Component({
  selector: 'app-ventana-editar-nota-credito',
  templateUrl: './ventana-editar-nota-credito.component.html',
  styleUrls: ['./ventana-editar-nota-credito.component.css']
})

export class VentanaEditarNotaCreditoComponent implements OnInit {
  nuevaNota: NotaDeCredito = new NotaDeCredito();
  @Input() notaAEditar?: NotaDeCredito;
  isVisible: boolean = true;
  constructor(private notaDeCreditoService: notaDeCreditoService) {

  }
  ngOnInit() {
    this.nuevaNota.descripcion = this.notaAEditar?.descripcion;
    this.nuevaNota.monto = this.notaAEditar?.monto;
    this.nuevaNota.cliId = this.notaAEditar?.cliId;
    this.nuevaNota.id = this.notaAEditar?.id;
    this.nuevaNota.idFactura = this.notaAEditar?.idFactura;
    this.nuevaNota.numeroFactura = this.notaAEditar?.numeroFactura;
    this.nuevaNota.puntoFactura = this.notaAEditar?.puntoFactura;
    this.nuevaNota.numeroGuia = this.notaAEditar?.numeroGuia;
  }

  editarNota(nuevaNota: NotaDeCredito) {

    this.notaDeCreditoService.actualizarNotaDeCredito(nuevaNota).subscribe(
      () => {
        console.log('Nota  actualizada con éxito');
        // Realiza cualquier operación necesaria después de la actualización
        
        this.isVisible = false;
        return;
      },
      (error) => {
        console.error('Error al actualizar la nota de credito:', error);
        this.isVisible = false;
        return;
      }
    )
  }

  cancelar() {
    this.isVisible = false;
  }



}
