import { Factura } from '../Models/factura.models';
import { NgFor } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Cliente } from '../Models/cliente.models';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { ClientesServiceService } from '../Services/clientes-service.service';
import { NotificacionService } from '../Services/notificacion.service';
import { VendedoresService } from '../Services/vendedores.service';
import { Vendedor } from '../Models/vendedor.models';
import { finalize, take } from 'rxjs';
import { FacturasService } from '../Services/facturas.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Balance } from '../Models/balance.models';



@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.css']
})

export class BalanceComponent implements OnInit {
  factura: Factura = new Factura();
  facturas: Factura[] = new Array();
  facturasNoEntregadas: Factura[] = new Array();
  facturasEntregadas: Factura[] = new Array();
  balance: Balance = new Balance(); 
  existenFacturas: boolean = false;
  displayedColumns: string[] = ['id', 'Punto', 'Numero', 'Cliente', 'Vendedor', 'Monto', 'Fecha', 'Tipo', 'Monto_flete', 'Pagado', 'Deuda', 'Favor'];
  dataSource = new MatTableDataSource<Factura>();
  clientesDeudores: Cliente[] = new Array();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  pageSize = 5;
  subtotal?: number = 0;
  suma: number = 0;
  deuda: any = 0;
  constructor(
    private clienteService: ClientesServiceService,
    private vendedoresService: VendedoresService,
    private notificationService: NotificacionService,
    private facturasService: FacturasService,
    private matPaginatorIntl: MatPaginatorIntl) {
    this.factura = new Factura();
    
  }

  @ViewChild('divToExport', { static: false })
    divToExport!: ElementRef;

  exportToPdf() {
    const divToExport = this.divToExport.nativeElement;

    html2canvas(divToExport).then(canvas => {
      // Obtiene la imagen del div como un canvas

      const imgData = canvas.toDataURL('image/png');

      
      // Calcula el tamaño del PDF basándose en el tamaño del div
      const pdfWidth = divToExport.offsetWidth  ; // Multiplica por 2 debido al escalamiento
      const pdfHeight = divToExport.offsetHeight ; // Multiplica por 2 debido al escalamiento

      // Configura el tamaño del PDF
      const pdf = new jsPDF('p', 'mm', [pdfWidth, pdfHeight]);

      // Agrega la imagen al PDF
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight); // Usa pdfWidth y pdfHeight como tamaño


      // Guarda el PDF como archivo
      pdf.save('exported-div.pdf');
    });
  }


  ngOnInit() {
    this.obtenerFacturas();
   
    
  }



  obtenerFacturas() {
    this.facturasService.getFacturas()
      .pipe(
        finalize(() => {
          if (this.facturas.length > 0) {
            this.existenFacturas = true;
            this.dataSource.data = [];
            this.dataSource.data = this.facturas;
            this.dataSource.paginator = this.paginator;
          }
          else {
            this.existenFacturas = false;
          }
        }))
      .subscribe((facturas: any[]) => {
        this.facturas = facturas;
        console.log(this.facturas)

        this.facturas.forEach(fact => {
      console.log(fact.Estado)

      if (fact.Estado && fact.Estado.toString().includes("Entregada")) {
        //console.log("ESTA ESTA ENTREGADA")
        let factura: Factura = new Factura();
        factura.id = fact.id;
        factura.Cliente = fact.Cliente;
        factura.Vendedor = fact.Vendedor;
        factura.Deuda = fact.Deuda;
        factura.Favor = fact.Favor;
        factura.Monto = fact.Monto;
        factura.MontoFlete = fact.MontoFlete;
        factura.Numero = fact.Numero;
        factura.Punto = fact.Punto;
        factura.Pagado = fact.Pagado;
        factura.Camionero = fact.Camionero;
        factura.Tipo = fact.Tipo;
        factura.Fecha = fact.Fecha;
        factura.Estado = String(fact.Estado);
        factura.EstadoBool = false;
        this.facturasEntregadas.push(factura);
      }
      else { //almacenamos las facturas que nb
        let factura: Factura = new Factura();
        factura.id = fact.id;
        factura.Cliente = fact.Cliente;
        factura.Vendedor = fact.Vendedor;
        factura.Deuda = fact.Deuda;
        factura.Favor = fact.Favor;
        factura.Monto = fact.Monto;
        factura.MontoFlete = fact.MontoFlete;
        factura.Numero = fact.Numero;
        factura.Punto = fact.Punto;
        factura.Pagado = fact.Pagado;
        factura.Camionero = fact.Camionero;
        factura.Tipo = fact.Tipo;
        factura.Fecha = fact.Fecha;
        factura.Estado = String(fact.Estado);
        factura.EstadoBool = false;
        this.facturasNoEntregadas.push(factura);


      }
         
    });
        this.CalcularTodo();



      });

    
  }


  CalcularTodo() {
    this.balance.ganancias = 0;
    this.balance.porCobrar = 0;
    this.balance.cantidadDeFacturasEntregadas = 0;
    this.balance.cantidadDeFacturasPorEntregar = 0;

    this.facturasEntregadas.forEach((fac) => {
      if (fac.Pagado != null && this.balance.ganancias != null) {
        this.balance.ganancias = this.balance.ganancias + fac.Pagado;
        
      }
    });
    this.facturasNoEntregadas.forEach((fac) => {
      if (fac.Deuda != null && this.balance.porCobrar != null) {
        this.balance.porCobrar = this.balance.porCobrar + fac.Deuda;
      }
    });
    this.balance.cantidadDeFacturasEntregadas = this.facturasEntregadas.length;
    this.balance.cantidadDeFacturasPorEntregar = this.facturasNoEntregadas.length;

  }

  //obtenerFacturas() {
  //  this.dataSource.data = [];
  //  this.facturasNoEntregadas = [];
  //  this.dataSource.paginator = null;
  //  this.facturas = [];

  //  //this.facturasService.getFacturas().subscribe((f: any) => {

  //  //  this.facturas = [];

  //  //  if (!f) {
  //  //    f.forEach((factu: any) => {
  //  //      if(f.esta)
  //  //      this.facturas.push(f);
  //  //      console.log("facturas ", factu);
  //  //    })
  //  //  }


  //  //});


  //  this.facturasService.getFacturas()
  //    .subscribe((fact) => {
  //      if (fact.length > 0) {
  //        this.facturas = [];
  //        this.facturas = fact;
  //        //this.facturas[0].Camionero = fact[0].Camioenro;
  //        this.facturas.forEach(fact => {
  //          console.log(fact.Estado)

  //          if (fact.Estado && fact.Estado.toString().includes("Entregada")) {
  //            //console.log("ESTA ESTA ENTREGADA")
  //          }
  //          else { //almacenamos las facturas que nb
  //            let factura: Factura = new Factura();
  //            factura.id = fact.id;
  //            factura.Cliente = fact.Cliente;
  //            factura.Vendedor = fact.Vendedor;
  //            factura.Deuda = fact.Deuda;
  //            factura.Favor = fact.Favor;
  //            factura.Monto = fact.Monto;
  //            factura.MontoFlete = fact.MontoFlete;
  //            factura.Numero = fact.Numero;
  //            factura.Punto = fact.Punto;
  //            factura.Pagado = fact.Pagado;
  //            factura.Camionero = fact.Camionero;
  //            factura.Tipo = fact.Tipo;
  //            factura.Fecha = fact.Fecha;
  //            factura.Estado = String(fact.Estado);
  //            factura.EstadoBool = false;
  //            this.facturasNoEntregadas.push(factura);


  //          }

  //        });

  //        if (this.facturasNoEntregadas.length > 0) {
  //          this.existenFacturas = true;
  //          this.facturas = [];
  //          this.facturas = this.facturasNoEntregadas;
  //          this.dataSource.data = this.facturasNoEntregadas;
  //          this.dataSource.paginator = this.paginator;
  //        } else {
  //          this.existenFacturas = false;
  //        }
  //      } else {
  //        this.existenFacturas = false;
  //      }
  //    })

  //}







  calcularBalance() {
    var suma: any = 0;
    this.subtotal = 0;
    for (const elemento of this.facturas) {
      if (elemento != null) {
        suma = elemento.Monto;
      }
      this.subtotal = suma + this.subtotal;
    }
  }
  calcularDeudas() {
    this.deuda = 0;
    for (const elemento of this.facturas) {
      this.deuda += elemento.Deuda;      
    }
  }

  async calcularDeudores() {
     
    this.clientesDeudores = [];
    var clientesDeudores = "";
    var deudaTotal = 0;
    for (const elemento of this.facturas) {

      if (elemento.Deuda && elemento.Estado && elemento.Deuda > 0.0 && !elemento.Estado.includes("Entregada")) {
        
        var cliente = new Cliente();
        if (elemento.Cliente)
           var cli: any = await this.clienteService.getCliente(elemento.Cliente).toPromise(); 
        this.clientesDeudores.push(cli);
        clientesDeudores = clientesDeudores + cli.nombre + " " + "  Monto:" + elemento.Deuda + "  Fecha:" + elemento.Fecha + '\n';
        deudaTotal = deudaTotal + elemento.Deuda;
      }
     
    }

    if (clientesDeudores.length > 0) {
        

        ("clientes deudores: " + '\n' + clientesDeudores);
    }
    else {
      alert("actualmente, nadie debe nada")
    }
  }




}





