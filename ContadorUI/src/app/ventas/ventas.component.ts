import { Component,OnInit, ViewChild } from '@angular/core';
import { FacturasService } from '../Services/facturas.service';
import { Factura } from '../Models/factura.models';
import { Cliente } from '../Models/cliente.models';
import { ClientesServiceService } from '../Services/clientes-service.service';
import { Camionero } from '../Models/camionero.models';
import { Vendedor } from '../Models/vendedor.models';
import { CamionerosService } from '../Services/camioneros.service';
import { VendedoresService } from '../Services/vendedores.service';
import { NotificacionService } from '../Services/notificacion.service';
import { notaDeCreditoService } from '../Services/notaDeCredito.service';
import { NotaDeCredito } from '../Models/notaDeCredito';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { take } from 'rxjs';
 
@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css']
})
export class VentasComponent implements OnInit {


  constructor(
    private facturasService: FacturasService,
    private clientesService: ClientesServiceService,
    private camionerosService: CamionerosService,
    private vendedoresService: VendedoresService,
    private notificacionService: NotificacionService,
    private notaDeCreditoService: notaDeCreditoService,
    private matPaginatorIntl: MatPaginatorIntl,
    private matPaginatorIntl2: MatPaginatorIntl,
    private notificationService: NotificacionService
  ) {

  }
  async ngOnInit() {




    /*this.traerDatosPesados();*/
    this.obtenerFacturas();
    this.notasDeCredito = await this.obtenerNotasDeCredito();
    this.obtenerClientes();
    this.obtenerVendedores();
    this.obtenerCamioneros();
    setTimeout(() => {
      this.obtenerClientes();
    }, 1000);

  }

  fechaDesde: string = '';
  fechaHasta: string = '';
  fechaDesde1: string = '';
  fechaHasta1: string = '';
  facturas: Factura[] | undefined;
  facturasfiltradas: Factura[] | undefined;
  Clientes: any[] = new Array();
  facturasNoEntregadas: Factura[] | any;
  facturasEntregadas: Factura[] = [];
  semanas: number[] = [1, 2, 3, 4, 5];
  existenFacturas: boolean = false;
  dineroPorCobrar: number = 0;
  fechaPorCobrar: any = "";
  nombreDeClientePorCobrar: string = "";
  dineroPorCobrarR: number = 0;
  clientesPorCobrar: number = 0;
  clientesDeudores: Cliente[] = new Array();
  facturasPorCobrar: number = 0;
  cantidadTotalFacturas: number = 0;
  facturasCobradas: number = 0;
  numeroGuia: number = 0;
  cliente: number = 0;
  vendedor: number = 0;
  camionero: number = 0;
  filtro: Factura = new Factura();
  clientes: Cliente[] = new Array();
  camioneros: Camionero[] = new Array();
  vendedores: Vendedor[] = new Array();
  filtrosAbiertos: boolean = false;
  notasDeCredito: NotaDeCredito[] = new Array();
  RESULTADO: any;
  loading: boolean = false;
  displayedColumns: string[] = ['id', 'Guia', 'Camionero', 'Cliente', 'Fecha', 'Monto'];
  displayedColumnsEntregadas: string[] = ['id', 'Guia', 'Cliente', 'Fecha', 'FEntrega', 'Monto'];
  dataSource = new MatTableDataSource<any>();
  dataSourceEntregadas = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  pageSize = 5;

  notificationRef: any; // Tipo debe ser ajustado según tu configuración de TypeScript
  notificationResponse$ = this.notificationService.getNotificationResponse$();

  @ViewChild('pag2') pag2!: MatPaginator;
  pageSizeEntregadas = 5;


  traerDatosPesados() {
    this.notaDeCreditoService.obtenerCantidadEspectacularDeDatos()
      .then((r) => this.RESULTADO = r)
      .catch((e) => this.RESULTADO = e);

  }
  obtenerNotasDeCredito(): Promise<NotaDeCredito[]> {
    this.loading = true;
    return new Promise((resolve) => {
      {
        this.notaDeCreditoService.getNotas().subscribe((n) => {
          this.notasDeCredito = n;
          this.loading = false;
          resolve(this.notasDeCredito);
        })
      }
    })
  }
  obtenerClientes() {
    this.clientesService.getClientes().subscribe(clientes => { this.clientes = clientes; this.Clientes = clientes; });

  }
  switchearVentanaFiltros() {

    this.filtrosAbiertos = !this.filtrosAbiertos;

  }
  obtenerCamioneros() {
    this.camioneros = new Array();
    
    this.camionerosService.getCamioneros().subscribe((c) => {
      this.camioneros = c;
      console.log("los camioneros son: ", this.camioneros)
    });
    
  }
  obtenerVendedores() {
    this.vendedoresService.getVendedores().subscribe((v) => this.vendedores = v);
  }
  async limpiarFiltros() {
    //this.existenFacturas = true;
    this.filtro.Punto = undefined;
    this.filtro.Numero = undefined;
    this.filtro.Tipo = undefined;
    this.filtro.Fecha = undefined;
    this.filtro.cargaNumero = undefined;
    this.filtro.Cliente = undefined;
    this.filtro.FechaDesde = undefined;
    this.filtro.FechaHasta = undefined;
    this.filtro.Camionero = undefined;
    this.filtro = new Object();
    this.facturas = [];
    this.fechaDesde1 = '';
    this.fechaHasta1 = '';
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.facturas = [];
    this.facturasEntregadas = [];
    this.facturasNoEntregadas = [];
    this.clientesPorCobrar = 0;
    this.dineroPorCobrar = 0;
    this.facturasPorCobrar = 0;
    this.numeroGuia = 0;
    this.clientesService.getClientes().subscribe((c) => { this.Clientes = c })
    this.obtenerFacturas();
    this.notasDeCredito = await this.obtenerNotasDeCredito();
  }
  obtenerNumeroDeCliente(id: number) {
    var numero: any = "SN";
    var cliente: Cliente | undefined = new Cliente();
    cliente = this.clientes.find(cli => cli.id == id)
    if (cliente) {
      numero = cliente.NumeroDeCliente;
    }
    return numero;
  }
  obtenerNombreCliente(idCliente: number | undefined): string {
    var clienteEncontrado: Cliente = new Cliente();

    if (idCliente) {
      clienteEncontrado = this.Clientes.find(cliente => cliente.id == idCliente);
    }
    if (clienteEncontrado.nombre && clienteEncontrado.NumeroDeCliente) {
      var id_nombre: any = clienteEncontrado?.NumeroDeCliente + "-" + clienteEncontrado.nombre
    }
    else {

    }
    return id_nombre || idCliente + 'SN';
  }
  SendDataonChangeDesde(event: any) {
    this.fechaDesde = event.target.value;
    this.filtro.FechaDesde = this.fechaDesde as unknown as Date;
    console.log(this.fechaDesde)
  }
  SendDataonChangeHasta(event: any) {
    this.fechaHasta = event.target.value;
    this.filtro.FechaHasta = this.fechaHasta as unknown as Date;
    console.log(this.fechaHasta)
  }
  SendnumeroGuia(event: any) {
    this.numeroGuia = parseInt(event.target.value);
    console.log("Numero de Guia:", this.numeroGuia)

  }
  limpiar() {
    this.fechaDesde1 = '';
    this.fechaHasta1 = '';
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.facturas = [];
    this.filtro.Cliente = undefined;
    this.filtro.Camionero = undefined;
    this.filtro.cargaNumero = undefined;
    this.facturasEntregadas = [];
    this.facturasNoEntregadas = [];
    this.clientesPorCobrar = 0;
    this.dineroPorCobrar = 0;
    this.facturasPorCobrar = 0;
    this.numeroGuia = 0;
  }
  //obtener semanas del mes
  obtenerFacturas(): Promise<boolean> {
    //inicializamos las variables de almacenamiento
    this.dataSource.data = [];
    this.facturasNoEntregadas = [];
 

    this.facturas = [];
    this.loading = true;

    return new Promise((resolve, reject) => {

      this.obtenerFacturasTotales()
        .then((fac) => {
          this.facturas = fac;
          this.obtenerFacturasEntregadas()
            .then((facEn) => {
              this.facturasEntregadas = facEn;
              this.dataSourceEntregadas.data = [];
              this.dataSourceEntregadas.data = this.facturasEntregadas;
              this.dataSourceEntregadas.paginator = this.pag2;
              this.obtenerFacturasNoEntregadas()
                .then((facNe) => {
                  this.facturasNoEntregadas = facNe;
                  this.dataSource.data = [];

                  this.dataSource.data = this.facturasNoEntregadas;
                  this.dataSource.paginator = this.paginator;
                  this.calcularNoCobradas();
                  resolve(true);
                  this.loading = false;

                })
            });

        });



    });

  }
  obtenerFacturasTotales(): Promise<Factura[]> {
    return new Promise((resolve, reject) => {
      this.facturasService.getFacturas()
        .subscribe((fac) => {
          this.facturas = fac;

          resolve(this.facturas);
        });
    })
  }
  obtenerFacturasEntregadas(): Promise<Factura[]> {
    return new Promise((resolve) => {
      this.facturasService.getFacturasEntregadas()
        .subscribe(f => {
          this.facturasEntregadas = f;
          this.dataSourceEntregadas.data = this.facturasEntregadas;
          this.dataSourceEntregadas.paginator = this.pag2;
          resolve(this.facturasEntregadas);
        });
    })
  }
  obtenerFacturasNoEntregadas(): Promise<Factura[]> {
    return new Promise((resolve) => {
      this.facturasService.getFacturasNoEntregadas()
        .subscribe(f => {
          this.facturasNoEntregadas = f;
          this.dataSource.data = [];
          this.dataSource.data = this.facturasNoEntregadas;
          this.dataSource.paginator = this.paginator;
          resolve(this.facturasNoEntregadas);

        });
    })

  }
  cargaNumeroChange(event: any) {
    console.log(event)
    this.filtro.cargaNumero = event.target.value;
  }
  filtrarFacturaCompleto() {
    this.notasDeCredito = [];
    this.obtenerNotasDeCredito()
      .then((n) => {
        this.notasDeCredito = n;
        if (this.notasDeCredito) {
          let filtroNotas: NotaDeCredito = new NotaDeCredito();
          let notasFiltradas: NotaDeCredito[] = new Array();
          filtroNotas.idFactura = this.filtro.id;
          filtroNotas.numeroGuia = this.filtro.cargaNumero;
          filtroNotas.cliId = this.filtro.Cliente;
          notasFiltradas = this.notaDeCreditoService.filtrarNotasDeCredito(filtroNotas, this.notasDeCredito);
          this.notasDeCredito = [];
          this.notasDeCredito = notasFiltradas;
        }
      });


    this.clientesService.getClientes().subscribe((c) => { this.Clientes = c })
    this.obtenerFacturas()
      .then(() => {

        //alert(this.filtro.cargaNumero)

        if (this.facturas) {
          this.facturasfiltradas = this.facturasService.filtrarFacturas(this.filtro, this.facturas, this.fechaDesde, this.fechaHasta);
          if (this.facturasfiltradas && this.facturasfiltradas.length > 0) {
            this.existenFacturas = false;
            this.facturas = [];
            this.facturas = this.facturasfiltradas;
            this.procesarListadeFacturas(this.facturas)
              .then((r) => {
                this.calcularNoCobradas();
              })

          }
          else {
            this.existenFacturas = false;
            this.notificacionService.showNotification("Atencion", "No se encontraron resultados para los filtros especificados. Por defecto se mostraran todos los resultados, pero debe volver a filtrar.", false)
            this.filtro.Cliente = undefined;
            this.filtro.Camionero = undefined;
            this.filtro.cargaNumero = undefined;
          }
        }
      });

  }
  imprimir() {

    this.notificacionService.showNotification(
      "Tiket:",

      "<br> Cliente: " + this.nombreDeClientePorCobrar
      + "<br> Fecha: " + this.fechaPorCobrar
      + "<br> Monto:$ " + this.dineroPorCobrar
      , true
    );
  }
  vendedorselectFiltroChange(event: any) {
    //console.log("vendedor", event.target.value);
    this.filtro.Vendedor = event.target.value;
    //this.filtrarFactura();
  }
  clienteselectChangeFiltro(event: any) {
    /*  this.factura.Cliente = event.target.value;*/
    //const nombreSeleccionado = event.target.options[event.target.selectedIndex].getAttribute('data-nombre');
    this.filtro.Cliente = event.target.value;
    console.log("cliente seleccionado", this.filtro.Cliente);
    //this.filtrarFactura();
  }
  camioneroselectChangeFiltro(event: any) {
    /*this.factura.Camionero = event.target.value;*/
    //const nombreSeleccionado = event.target.options[event.target.selectedIndex].getAttribute('data-nombre');
    this.filtro.Camionero = event.target.value;
    console.log("camionero seleccionado", this.filtro.Camionero);
    //this.filtrarFactura();
  }
  procesarListadeFacturas(fac: Factura[]): Promise<boolean> {
    this.facturasEntregadas = [];
    this.facturasNoEntregadas = [];
    this.dataSource.data = [];

    return new Promise((resolve) => {
      fac.forEach(fact => {
        if (fact.Estado && fact.Estado.toString().includes("Entregada")) {
          let factura: Factura = new Factura();
          factura = fact;
          factura.EstadoBool = true;
          this.facturasEntregadas?.push(factura);
        }

        else { //almacenamos las facturas que no se entregaron
          let factura: Factura = new Factura();
          factura = fact;
          factura.EstadoBool = false;
          //alert("se pusheo una factura");
          this.facturasNoEntregadas?.push(factura);

        }
      });
      //rellenamos las tablas de facturas entregadas y no entregadas
      this.dataSourceEntregadas.data = this.facturasEntregadas;
      this.dataSourceEntregadas.paginator = this.pag2;

      this.dataSource.data = this.facturasNoEntregadas;
      this.dataSource.paginator = this.paginator;
      resolve(true);

    })



  }
  calcularNoCobradas() {

    //alert("se esta por calcular con las facturas " + JSON.stringify(this.facturasNoEntregadas));
    let clientes: number[] | any;
    let cliAnt: number;
    this.clientesPorCobrar = 0;
    this.dineroPorCobrar = 0;
    this.facturasPorCobrar = 0;

    if (this.facturas)
      this.cantidadTotalFacturas = this.facturas?.length;
    if (this.facturas != undefined && this.facturas[0].Fecha != "") {
      this.nombreDeClientePorCobrar = this.obtenerNombreCliente(this.facturas[0].Cliente);
      this.fechaPorCobrar = this.facturas[0].Fecha;
    }
    if (this.facturasEntregadas)
      this.facturasCobradas = this.facturasEntregadas.length;

    if (this.facturasNoEntregadas) {
      this.facturasPorCobrar = this.facturasNoEntregadas?.length;
    }

    if ((this.facturasNoEntregadas[0].Cliente != null &&
      this.facturasNoEntregadas[0].Cliente != undefined)) {
      this.clientesPorCobrar++;
      this.dineroPorCobrar = Number(this.dineroPorCobrar) +
        Number(this.facturasNoEntregadas[0].Monto) +
        Number(this.facturasNoEntregadas[0].MontoFlete
        )

      //comparo con el primer elemento de la factura no entregasdas
      if (this.facturasPorCobrar > 0) {
        // alert("aafactura id " + this.facturasNoEntregadas[0].id);
        this.notasDeCredito.forEach((n) => {
          //alert("comparando " + this.facturasNoEntregadas[0].id + " -- " + n.idFactura);
          if (this.facturasNoEntregadas[0].id == n.idFactura) {
            if (n.monto != null && n.monto != undefined) {
              //alert("RESTANDOOOO:" + this.dineroPorCobrar + " a " + n.monto);
              this.dineroPorCobrar = this.dineroPorCobrar - n.monto;
            }
          }
        });
      }



      //if (this.facturasPorCobrar == 1) {
      //  // alert("aafactura id " + this.facturasNoEntregadas[0].id);
      //  this.notasDeCredito.forEach((n) => {
      //     //alert("comparando " + this.facturasNoEntregadas[0].id + " -- " + n.idFactura);
      //    if (this.facturasNoEntregadas[0].id == n.idFactura) {
      //      if (n.monto != null && n.monto != undefined) {
      //        //alert("RESTANDOOOO:" + this.dineroPorCobrar + " a " + n.monto);
      //        this.dineroPorCobrar = this.dineroPorCobrar - n.monto;
      //      }
      //    }
      //  });
      //}


    }

    for (var i = 1; i < this.facturasNoEntregadas.length; i++) {
      //alert(this.facturasNoEntregadas[i].Cliente)
      if (this.facturasNoEntregadas[i - 1].Cliente != null && this.facturasNoEntregadas[i - 1].Cliente != undefined &&
        this.facturasNoEntregadas[i].Cliente != null && this.facturasNoEntregadas[i].Cliente != undefined) {
        if (this.facturasNoEntregadas[i - 1].Cliente != this.facturasNoEntregadas[i].Cliente) {
          if (this.facturas != null && this.facturas[i] != undefined) {
            //compruebo que no sea el admin el que vendio 
            if (this.facturas[i].Cliente != 0 && this.facturas[i].Cliente != 1) {
              this.clientesPorCobrar = this.clientesPorCobrar + 1;
            }
          }
        }
      }

      //sumo dinero por cobra
      if (this.facturasNoEntregadas[i].Monto && this.facturasNoEntregadas[i].MontoFlete) {
        this.dineroPorCobrar = this.dineroPorCobrar + this.facturasNoEntregadas[i].Monto + this.facturasNoEntregadas[i].MontoFlete;
        for (var e = 0; e < this.notasDeCredito.length; e++) {
          let resta = this.notasDeCredito[e].monto;
          if (this.facturasNoEntregadas[i].id == this.notasDeCredito[e].idFactura) {
            if (resta != undefined && resta != null && resta > 0) {
              this.dineroPorCobrar = this.dineroPorCobrar - resta;
            }
          }
        }
      }
    }
    //redondeamos
    this.dineroPorCobrar = parseFloat(this.dineroPorCobrar.toFixed(2));
  }
  enviarWsp() {
    var nombreCliente: string = this.nombreDeClientePorCobrar.replace(/\s/g, '');
    var camionero: Camionero | undefined;
    var numeroCamionero = '';
    console.log(this.camioneros)
    var id = this.filtro.Camionero;
    camionero = this.camioneros.find((c) => c.Id = id)
    if (camionero != undefined && camionero.Telefono != undefined) {
      numeroCamionero = camionero?.Telefono.replace(/\s/g, '');
      if (numeroCamionero.length < 14) {
        this.showNotification("El número del camionero no esta cargado como +549 343 #### se enviara al teléfono del admin, para que se envie automaticamente al número del camionero se debe corregir el número en la sección camioneros.");
        numeroCamionero = '+5493434563685';
        this.notificationResponse$.pipe(take(1)).subscribe((response) => {
          if (response) {
            var phoneNumber = numeroCamionero;
            var message = 'Hola ' + this.obtenerNombreCamionero(this.filtro.Camionero) + ', ¿cómo estás?.De la guia Numero: ' + this.filtro.cargaNumero +
              ' Se debe cobrar al cliente ' + nombreCliente +
              ' $' + this.dineroPorCobrar + '.'

              ; // Reemplaza con el mensaje deseado

            // Crear el enlace de WhatsApp
            var whatsappLink = 'https://wa.me/' + phoneNumber + '?text=' + encodeURIComponent(message);

            // Abrir una nueva ventana o pestaña del navegador con el enlace de WhatsApp
            window.open(whatsappLink, '_blank');
          }
        })
      }
      else {
        var phoneNumber = numeroCamionero;
        var message = 'Hola ' + this.obtenerNombreCamionero(this.filtro.Camionero) + ', ¿cómo estás?.De la guia número: ' + this.filtro.cargaNumero +
          ' Se debe cobrar al cliente ' + nombreCliente +
          ' $' + this.dineroPorCobrar + '.'

          ; // Reemplaza con el mensaje deseado

        // Crear el enlace de WhatsApp
        var whatsappLink = 'https://wa.me/' + phoneNumber + '?text=' + encodeURIComponent(message);

        // Abrir una nueva ventana o pestaña del navegador con el enlace de WhatsApp
        window.open(whatsappLink, '_blank');
      }
    }
  }
  enviarWspAdmin() {
    var nombreCliente: string = this.nombreDeClientePorCobrar.replace(/\s/g, '');
    var phoneNumber = '+5493434563685'; // Reemplaza con el número de teléfono deseado
    var message = 'Hola ' + this.obtenerNombreCamionero(this.filtro.Camionero) + ', ¿cómo estás?.De la guia número: ' + this.filtro.cargaNumero +
      ' Se debe cobrar al cliente ' + nombreCliente +
      ' $' + this.dineroPorCobrar + '.'

      ; // Reemplaza con el mensaje deseado

    // Crear el enlace de WhatsApp
    var whatsappLink = 'https://wa.me/' + phoneNumber + '?text=' + encodeURIComponent(message);

    // Abrir una nueva ventana o pestaña del navegador con el enlace de WhatsApp
    window.open(whatsappLink, '_blank');
  }

 

  obtenerNombreCamionero(id :number) {
    var camionero: Camionero | undefined;
    var nombre = '';
    camionero = this.camioneros.find((c) => c.Id = id)
    if (camionero != undefined && camionero.Nombre != undefined) {
      nombre=this.quitarEspaciosNombre(camionero?.Nombre);
      return nombre;
    }
    else {
      return "";
    }
  }

  quitarEspaciosNombre(nombreCliente: string) {
    // Encuentra la última letra del nombre
    var ultimaLetra = nombreCliente.trim().slice(-1);

    // Encuentra la posición de la última letra en la cadena original
    var posicionUltimaLetra = nombreCliente.lastIndexOf(ultimaLetra);

    // Elimina los espacios en blanco al final del nombre
    var nombreSinEspaciosAlFinal = nombreCliente.slice(0, posicionUltimaLetra + 1);

    return nombreSinEspaciosAlFinal;
  }


  showNotification(texto: string): void {

    this.notificationService.showNotification("Atención", texto, false);

  }


}

//En este código, la función obtenerSemanasDelMes toma el número de mes y el año como entrada y devuelve un array de objetos que representa las semanas del mes.Cada objeto tiene dos propiedades: inicio y fin, que representan el primer y último día de la semana respectivamente.
//Recuerda que los meses en JavaScript están indexados desde 0(enero) hasta 11(diciembre).En el ejemplo, mes se establece en 10 para representar noviembre.Asegúrate de ajustar el mes según tus necesidades.
