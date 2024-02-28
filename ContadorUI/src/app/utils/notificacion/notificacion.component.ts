import { Component, ElementRef, Input, ViewChild } from '@angular/core';
 
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NotificacionService } from '../../Services/notificacion.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

 

@Component({
  selector: 'app-notificacion',
  templateUrl: './notificacion.component.html',
  styleUrls: ['./notificacion.component.css'],

})
export class NotificacionComponent {
  @Input() titulo: string | undefined;
  @Input() message: string | undefined;
  @Input() botonPdf: boolean | undefined;
  isVisible: boolean = true;

  constructor(private notificationService: NotificacionService) {

  }

  open(): void {
    // Lógica para abrir la notificación
    // Por ejemplo, mostrar más detalles
    //console.log('Notificación abierta.');
    this.notificationService.notifyResponse(true);
    this.isVisible = false;
  }

  close(): void {
    this.notificationService.notifyResponse(false);
    this.isVisible = false;
  }

  @ViewChild('divToExport', { static: false })
  divToExport!: ElementRef;

  exportToPdf() {
    const divToExport = this.divToExport.nativeElement;

    html2canvas(divToExport, { scale: 3}).then((canvas: {
        height: number;
        width: number; toDataURL: (arg0: string) => any; 
}) => {
      // Obtiene la imagen del div como un canvas

      const imgData = canvas.toDataURL('image/png'); 


      // Calcula el tamaño del PDF basándose en el tamaño del div
      const pdfWidth = 1200; //595.28 * 2;//divToExport.offsetWidth; // Multiplica por 2 debido al escalamiento
      const pdfHeight = 800;//841.89 ;//divToExport.offsetHeight; // Multiplica por 2 debido al escalamiento

      // Configura el tamaño del PDF
      const pdf = new jsPDF('p', 'mm', [pdfWidth, pdfHeight]);

      // Define el tamaño de la imagen en el PDF (ajusta según sea necesario)
      const imageSizeInPdf = 0.5; // Por ejemplo, 75% del tamaño original


      // Calcula la posición central del PDF
      const centerX = pdfWidth / 2.3;
      const centerY = pdfHeight / 2;

      // Calcula la posición de inicio para centrar la imagen en el PDF
      const startX = centerX - (canvas.width * imageSizeInPdf / 2);
      const startY = 0;

      // Agrega la imagen al PDF centrada
      pdf.addImage(imgData, 'PNG', startX, startY, pdfWidth * imageSizeInPdf, pdfHeight * imageSizeInPdf, undefined, 'FAST');


      // Guarda el PDF como archivo
      pdf.save('exported-div.pdf');
    });
  }


}
