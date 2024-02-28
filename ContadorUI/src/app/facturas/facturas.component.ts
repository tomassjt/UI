import { Factura } from '../Models/factura.models';
import { NgFor } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Cliente } from '../Models/cliente.models';
import { ClientesServiceService } from '../Services/clientes-service.service';
import * as XLSX from 'xlsx';
import { forkJoin } from 'rxjs';
/*material*/
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
import { NotificacionService } from '../Services/notificacion.service';
import { VendedoresService } from '../Services/vendedores.service';
import { Vendedor } from '../Models/vendedor.models';
import { Observable, catchError, finalize, take } from 'rxjs';
import { FacturasService } from '../Services/facturas.service';
import { Camionero } from '../Models/camionero.models';
import { CamionerosService } from '../Services/camioneros.service';
import { AdminService } from '../Services/adminService';
import { Admin } from '../Models/admin.models ';
import { NotaDeCredito } from '../Models/notaDeCredito';
import { notaDeCreditoService } from '../Services/notaDeCredito.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { async } from '@angular/core/testing';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Component({
  selector: 'app-facturas',
  templateUrl: './facturas.component.html',
  styleUrls: ['./facturas.component.css']
})
export class FacturasComponent implements OnInit, AfterViewInit {
  factura: Factura = new Factura();
  facturas: Factura[] = new Array();
  facturasfiltradas: Factura[] = new Array();
  facturasNoEntregadas: Factura[] = new Array();
  porcentajes: any[] = ["Seleccione ", 3, 4, 5, 6, 7, 8];
  filtro: Factura = new Factura();
  vendedores: Vendedor[] = new Array();
  camioneros: Camionero[] = new Array();
  camionero: Camionero = new Camionero();
  vendedorImp: Vendedor = new Vendedor();
  clientes: Cliente[] = new Array();
  clientesSelect: any[] = new Array();
  existenFacturas: boolean = false;
  existenVendedores: boolean = false;
  existenClientes: boolean = false;
  fechaDesde: any = "";
  fechaHasta: any = "";
  tipoDePagoSeleccionado: string = "";
  displayedColumns: string[] = ['id', 'Cliente', 'Vendedor', 'Camionero', 'Fecha', 'Monto', 'MontoFlete', 'Deuda','Eliminar'];
  displayedColumnsNotas: string[] = ['cliId', 'facId', 'monto', 'desc', 'Editar', 'Baja', 'Eliminar'];
  mostrarTooltip: boolean = false;
  dataSource = new MatTableDataSource<any>();
  dataSourceNotas = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatPaginator) paginatorNotas!: MatPaginator;
  pageSize = 5;
  tipos: string[] = ["MP - M. pago", "EF - efectivo", "T - Transferencias", "P - Postnet", "SM - Saldo Mercaderia", "F- Fiados", "A - Arreglo de precios"];
  notificationRef: any; // Tipo debe ser ajustado según tu configuración de TypeScript
  notificationResponse$ = this.notificationService.getNotificationResponse$();
  MontoCalculado: boolean = false;
  MontoTotal: any = 0;
  admin: any = new Object();
  notasDeCredito: NotaDeCredito[] = new Array();
  notaDeCreditoNueva: NotaDeCredito[] = new Array();
  notaDeCreditoForm: FormGroup;
  verFormularioNotaDeCredito: boolean = false;
  loading: boolean = false;
  porcentajeFlete: number = 0;
  deudaClienteSeleccionadoFactura: number = 0;
  deudaClienteSeleccionadoFlete: number = 0;
  deudaClienteSeleccionadoTotal: number = 0;
  facturasAsociadasAlCliente: Factura[] = new Array();
  clienteSeleccionado: Cliente = new Cliente();
  MontoPagado: number = 0;
  MontoQueDebe: number = 0;
  numeroDeClienteBuscado: number = 0;
  clienteEncontrado: boolean = false;
  
  constructor(
    private fb: FormBuilder,
    private clienteService: ClientesServiceService,
    private vendedoresService: VendedoresService,
    private notificationService: NotificacionService,
    private facturasService: FacturasService,
    private camioneroService: CamionerosService,
    private adminService: AdminService,
    private matPaginatorIntl: MatPaginatorIntl,
    private notaDeCreditoService: notaDeCreditoService,
    private http: HttpClient
  ) {
    this.factura = new Factura();

    this.notaDeCreditoForm = this.fb.group({
      textarea: [
        '',
        [
          Validators.required,
          Validators.maxLength(240),
          Validators.pattern(/^[a-zA-Z0-9\s]*$/)
        ]
      ],
      monto: [
        null,
        [Validators.required,
        Validators.min(1)]
      ]
      ,
      numero: [
        null,
        [Validators.required,
        Validators.min(1)]
      ],
      idFactura: [],
      puntoFactura: [],
      numeroFactura: [],
      numeroGuia: []

    });

  }

  async ngOnInit() {

    this.vendedores = await this.obtenerVendedores()
    this.obtenerClientes();
    this.obtenerCamioneros()
      .then((cam) => {
        this.camioneros = cam;
      })

      .catch((er) => {
        this.notificationService.showNotification("Error:", " " + er, false);
      })

    //alert("VENDEDORES" + JSON.stringify(this.vendedores[0]));
    this.matPaginatorIntl.itemsPerPageLabel = 'Elementos por página:';
    this.matPaginatorIntl.nextPageLabel = 'Siguiente página';
    this.matPaginatorIntl.previousPageLabel = 'Página anterior';
    this.facturas = await this.obtenerFacturas();
    this.obtenerNotasDeCredito();






    this.notaDeCreditoService.getNotas().subscribe((n) => this.notasDeCredito = n)
    setTimeout(() => {
      this.dataSource.data = this.facturas;
      this.dataSource.paginator = this.paginator;
      this.dataSourceNotas.data = this.notasDeCredito;
      //console.log(this.dataSourceNotas)
      this.loading = false;
    }, (200));


    this.loading = false;
  }

  ngAfterViewInit() {

    this.obtenerAdmin();
    this.dataSourceNotas.data = this.notasDeCredito;
    this.loading = false;
  }

  imprimirTiket() {
    var camionero = this.obtenerNombreCamionero(this.clienteSeleccionado.camioneroid)
    var vendedor = this.obtenerNombreVendedor(this.clienteSeleccionado.vendedorid)

    var fecha = new Date();
    // Obtener los componentes de la fecha
    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1; // Los meses en JavaScript van de 0 a 11
    const año = fecha.getFullYear();
    const horas = fecha.getHours();
    const minutos = fecha.getMinutes();
    const segundos = fecha.getSeconds();
    // Formatear la fecha y la hora según el formato DD/MM/AAAA HH:MM:SS
    const fechaFormateada = `${dia}/${mes}/${año} ${horas}:${minutos}:${segundos}`;

    this.clienteSeleccionado.nombre
     
    this.notificationService.showNotification("Tiket de cobro",
      "<p > Fecha: " + fechaFormateada + "</p>" +
      "<p > Cliente: " + this.clienteSeleccionado.nombre + "</p>" +
      "<p > Vendedor: " + vendedor + "</p>" +
      "<p > Camionero: " + camionero + "</p>" +
      "<hr>" +
      "<p > Monto:$ " + this.deudaClienteSeleccionadoFactura + "</p>" +
      "<p > Flete:$ " + this.deudaClienteSeleccionadoFlete + "</p>" +
      "<p > Total:$ " + this.deudaClienteSeleccionadoTotal + "</p>" +
      "<hr>" 
      , true)}

  GenerarNotaCreditoFactura(element: any) {
    this.verFormularioNotaDeCredito = true;
    this.notaDeCreditoForm.patchValue({
      idFactura: element.id,
      puntoFactura: element.Punto,
      numeroFactura: element.Numero,
      numeroGuia: element.cargaNumero,
      numero: element.Cliente
    });
    //alert("la carga que se le va a asignar es " + JSON.stringify(element));
    //console.log('Formulario rellenado en GenerarNotaCreditoFactura(:', this.notaDeCreditoForm.value);
  }

  enviarWsp() {
    
    var fecha = new Date();
    // Obtener los componentes de la fecha
    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1; // Los meses en JavaScript van de 0 a 11
    const año = fecha.getFullYear();
    const horas = fecha.getHours();
    const minutos = fecha.getMinutes();
    const segundos = fecha.getSeconds();
    // Formatear la fecha y la hora según el formato DD/MM/AAAA HH:MM:SS
    const fechaFormateada = `${dia}/${mes}/${año} ${horas}:${minutos}:${segundos}`;

    if (this.clienteSeleccionado.nombre)
      var nombreCliente: string = this.clienteSeleccionado.nombre.replace(/\s/g, '');
    
    var camionero: any;
    var numeroCamionero = '';
    if (this.clienteSeleccionado.camioneroid)
      this.camioneroService.getCamionero(this.clienteSeleccionado.camioneroid).subscribe((c) => {
        camionero = c
       // alert("camionero " + camionero.telefono)
        if (camionero != undefined && camionero.telefono != undefined) {
          numeroCamionero = camionero?.telefono.replace(/\s/g, '');
          if (numeroCamionero.length < 14) {
            this.showNotification("El número del camionero no esta cargado como +549 343 #### se enviará al teléfono del admin, para que se envie automaticamente al número del camionero se debe corregir el número en la sección camioneros.");
            numeroCamionero = '+5493435177163';
            this.notificationResponse$.pipe(take(1)).subscribe((response) => {
              if (response) {
                var phoneNumber = numeroCamionero;
                var nombreCamionero: string = this.obtenerNombreCamionero(this.clienteSeleccionado.camioneroid).trimEnd();
                var message = 'Hola ' + nombreCamionero + ', ¿cómo estás?.' +
                  ' Se debe cobrar al cliente ' + nombreCliente +

                  " *Monto:*$ " + this.deudaClienteSeleccionadoFactura +
                  " *Flete:*$ " + this.deudaClienteSeleccionadoFlete +
                  " *Total:*$ " + this.deudaClienteSeleccionadoTotal +
                  " Fecha del tiket" + fechaFormateada
                  ; // Reemplaza con el mensaje deseado

                // Crear el enlace de WhatsApp
                var whatsappLink = 'https://wa.me/' + phoneNumber + '?text=' + encodeURIComponent(message);

                // Abrir una nueva ventana o pestaña del navegador con el enlace de WhatsApp
                window.open(whatsappLink, '_blank');
              }
            })
          }

        }
      });
     
    


   

  }
 

  obtenerNotasDeCredito() {
    this.notaDeCreditoService.getNotas().subscribe((n) => {
      this.notasDeCredito = n;
      this.dataSourceNotas.data = this.notasDeCredito;
    })

  }

  editarNotaDeCredito(element: any) {

    this.notaDeCreditoService.editarNotaCreditoVentana(element);
    this.notasDeCredito = [];
    this.dataSourceNotas.data = [];
    this.obtenerNotasDeCredito();

  }

  bajaNotaDeCredito(element: any) {
    this.notaDeCreditoService.bajaNotaDeCredito(element).subscribe((r) => {
      if (r) { alert("se dio de baja correctamente") }
      else { alert("ups, ocurrio un error al dar de baja") }
    })
  }

  eliminarNotaDeCredito(element: any) {
    //console.log("eliminando");
    
    this.notificationService.showNotification
    this.notificationService.showNotification("Atencion", "Esta seguro que desea eliminar esta notita de credito?   Estos cambios seran irecuperables.", false);
    this.notificationResponse$.pipe(take(1)).subscribe((response) => {
      if (response) {
        //console.log("entro a cambiar");

        this.notaDeCreditoService.borrarNotaDeCredito(element).subscribe(
          response => {
            //console.log('Datos enviados con éxito:', response);
            this.obtenerNotasDeCredito();
          },
          error => {
            console.error('Error al enviar los datos:', error);
          });



      }
    });

  }

  async funcionPesada(num: number): Promise<any> {
    return await new Promise((resolve, reject) => {
      setTimeout(() => {
        var numR = num * 2;
        resolve(numR);
      }, 5000)
    });
  }


  enviarFormulario(): void {
    this.verFormularioNotaDeCredito = false;
    // Aquí puedes manejar la lógica para enviar el formulario
    //console.log('Formulario enviado:', this.notaDeCreditoForm.value);
    this.notaDeCreditoService.postNotaDeCredito(this.notaDeCreditoForm.value)
      .subscribe(
        respuesta => {
          // Manejar la respuesta aquí si es necesario
          this.notificationService.showNotification("Exito", "La nota de creido se cargo correctamente.", false);
          this.limpiarFormulario();
          this.obtenerNotasDeCredito();
        },
        error => {
          // Manejar el error aquí si es necesario
          this.notificationService.showNotification("Ups!", "Ocurrio un error al intentar guardar la nota de credito en la Base de datos", false);
        }
      );
  }

  limpiarFormulario(): void {
    // Resetea el formulario

    this.notaDeCreditoForm.reset();

  }
  CancelarFormulario(): void {
    // Resetea el formulario
    this.verFormularioNotaDeCredito = false;
    this.notaDeCreditoForm.reset();

  }

  obtenerAdmin() {
    this.adminService.getAdmin(1).subscribe(ad => {

      //this.admin.correo = ad.correo
      //this.admin.direccion = ad.direccion;
      //this.admin.dni = ad.dni;
      //this.admin.id = ad.id;
      //this.admin.nombre = ad.nombre;
      //this.admin.porcentajeFlete = ad.porcentajeFlete;
      //this.admin.saldo = ad.saldo;
      this.admin = ad;
      this.factura.PorcentajeAdmin = this.admin.porcentajeFlete;
    })
  }
  exportToExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.facturasNoEntregadas);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Facturas_No_Entregadas');
    XLSX.writeFile(wb, 'exported-data.xlsx');
  }


  showNotification(texto: string): void {
    this.notificationService.showNotification("Atención", texto, false);
  }



  obtenerVendedores(): Promise<Vendedor[]> {

    return new Promise((resolve, reject) => {
      this.vendedoresService.getVendedores().subscribe((v) => {
        this.loading = true;
        this.vendedores = v;

        if (this.vendedores.length > 0) {
          resolve(this.vendedores);
          this.loading = false;
        }
        else {
          reject(new Error('Ocurrio un error al obtener los vendedores.'));
          this.loading = false;
        }
      })
    })
    this.loading = false;
  }

  obtenerCamioneros(): Promise<Camionero[]> {
    this.loading = true;
    return new Promise((resolve, reject) => {

      this.camioneroService.getCamioneros()
        .subscribe(camioneros => {
          this.camioneros = camioneros;

          if (this.camioneros.length > 0) {
            resolve(this.camioneros);

          }
          else {
            reject(" Ups! No existen camioneros u ocurrio un error en el back.");
            this.loading = false;
          }
        });

    })

    this.loading = false;
  }


  obtenerClientes() {
    this.clienteService.getClientes()
      .pipe(
        finalize(() => {
          if (this.clientes.length > 0) {
            this.existenClientes = true;

          }
          else {
            this.existenClientes = false;
          }

        }))
      .subscribe(clientes => {

        this.clientes = clientes;
        //console.log("clientes", this.clientes)

      });

    const selectClientes = document.getElementById("selectClientes");
    this.clientes.forEach(cliente => {

    });
    this.loading = false;
  }

  obtenerNombreCliente(clienteId: any): any {
    const cliente = this.clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nombre : 'NN';
  }

  obtenerNombreClientePorNumero(clienteNumero: number): any {
    var cliente = new Cliente();
    const numeroCliente = clienteNumero.toString().trim();
    this.clientes.forEach(c => {
      if (c.NumeroDeCliente && c.NumeroDeCliente.toString().includes(numeroCliente))
        cliente = c;
    });

    return cliente ? cliente.nombre : 'Naa';
  }
  obtenerNombreVendedor(vendedorId: any): any {
    if (vendedorId != undefined) {
      const vendedor = this.vendedores.find(c => c.id === vendedorId);
      return vendedor ? vendedor.nombre : 'NN';
    }
    else {
      return 'NN';
    }


  }

  obtenerNombreCamionero(camioneroId: any): any {
    if (camioneroId != undefined) {
      const camionero = this.camioneros.find(c => c.Id === camioneroId);
      return camionero ? camionero.Nombre : 'NN';
    }
    else {
      return 'NN';
    }
  }

  obtenerFacturas(): Promise<Factura[]> {
    this.loading = true;
    //reseteamos valores de variables
    this.dataSource.data = [];
    this.facturasNoEntregadas = [];
    this.facturas = [];
               
    this.dataSource.data = this.facturasNoEntregadas;
    this.dataSource.paginator = this.paginator;
    this.dataSource.paginator = null;
    this.facturas = [];

    return new Promise((resolve, reject) => {

      this.facturasService.getFacturas()
        .subscribe((fact) => {
          //console.log(fact)
          if (fact.length > 0) {
            this.facturas = [];
            this.facturas = fact;
            //this.facturas[0].Camionero = fact[0].Camioenro;
            this.facturas.forEach(fact => {
              //console.log(fact.Estado)
              //no incluimos las facturas entregadas a la lista 
              if (fact.Estado && fact.Estado.toString().includes("Entregada")) {
                ////console.log("ESTA ESTA ENTREGADA o rendida a vital")
              }
              else { //almacenamos las facturas que nb
                if (fact.RendidaAVital != 1) {
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
                  factura.cargaNumero = fact.cargaNumero;
                  factura.Camionero = fact.Camionero;
                  factura.Tipo = fact.Tipo;
                  factura.Fecha = fact.Fecha;
                  factura.Estado = String(fact.Estado);
                  factura.PorcentajeAdmin = fact.PorcentajeAdmin;
                  factura.PorcentajeCamionero = fact.PorcentajeCamionero;
                  factura.PorcentajeVenvedor = fact.PorcentajeVenvedor;
                  factura.EstadoBool = false;
                  this.facturasNoEntregadas.push(factura);
                }
                else {console.log("rendida a vital") }

              }

            });

            if (this.facturasNoEntregadas.length > 0) {
              this.existenFacturas = true;
              this.facturas = [];
              this.facturas = this.facturasNoEntregadas;
              this.dataSource.data = this.facturasNoEntregadas;
              this.dataSource.paginator = this.paginator;
              resolve(this.facturas);
              this.loading = false;
            } else {
              this.existenFacturas = false;
              reject(new Error('No se pudo obtener ninguna factura'))
              this.loading = false;
            }
          } else {
            this.existenFacturas = false;
            reject(new Error('No se pudo obtener ninguna factura'))
            this.loading = false;
          }
        })


      this.loading = false;
    })




  }


  async agregarFactura() {
    this.facturasAsociadasAlCliente = [];
    if (this.factura.Cliente !== null && this.factura.Cliente !== undefined &&
      this.factura.cargaNumero !== null && this.factura.cargaNumero !== undefined &&
      this.factura.Monto !== null && this.factura.Monto !== undefined) {
     console.log("esta entrando a agregar")
      this.factura.Camionero = this.factura.Camionero;

      this.factura.MontoFlete = parseFloat(this.factura.MontoFlete)
      if (this.factura.Monto != null && this.factura.Pagado != null && this.factura.Pagado != null) {
        this.factura.Deuda = this.factura.Monto + this.factura.MontoFlete - this.factura.Pagado;
      }

      this.showNotification("Esta seguro que desea agregar la factura?");

      this.notificationResponse$.pipe(take(1)).subscribe((response) => {
        if (response) {
          //console.log("entro a agregar esta factura ", this.factura);

          this.facturasService.postFacturas(this.factura).subscribe(
            response => {
              console.log('Datos enviados con éxito:', response);
              this.obtenerFacturas();
             //  this.obtenerFacturas();
            },
            error => {
              console.error('Error al enviar los datos:', error);
            });



        }
      });
    }
    else {
      this.showNotification("Debe completar los datos de formulario antes de agregar la factura");

      this.notificationResponse$.pipe(take(1)).subscribe((response) => {

      });
    }
  

  }

  clienteselectChange(event: any) {

    //const nombreSeleccionado = event.target.options[event.target.selectedIndex].getAttribute('data-nombre');
    //this.filtro.Cliente = this.factura.Cliente;
    var cliente: Cliente = new Cliente();
    var camionero: any = new Camionero();
    var vendedor: any = new Vendedor();
    var idCliente: number;
    var idVendedor: number;
    var idCamionero: number;

    idCliente = this.buscarIdDeClientePorNumero(event.target.value);

    if (idCliente != 0) {
      this.clienteEncontrado = true;
      this.clienteService.getCliente(idCliente).subscribe((c) => {
        cliente = c;
        if (cliente.vendedorid != null)
          this.vendedoresService.getVendedor(cliente.vendedorid)
            .subscribe((v) => {
              vendedor = v
              if (cliente.camioneroid)
                this.camioneroService.getCamionero(cliente.camioneroid).subscribe((c) => {
                  camionero = c

                  this.factura.Camionero = cliente.camioneroid;
                  this.factura.Vendedor = cliente.vendedorid;
                  this.factura.Cliente = cliente.id;
                  this.factura.PorcentajeCamionero = camionero.porcentajeFlete;
                  this.factura.PorcentajeVenvedor = vendedor.porcentajeFlete;
                  //console.log("camionero", camionero)
                  //console.log("vendedor", vendedor)
                  //console.log("cliente seleccionado", cliente)
                  //console.log("cliente seleccionado", this.factura);

                })


            })

      })

    }
    else {
      this.factura.Camionero = undefined;
      this.factura.Vendedor = undefined;
      this.factura.Cliente = undefined;
      this.factura.PorcentajeCamionero = undefined;
      this.factura.PorcentajeVenvedor = undefined;
      this.clienteEncontrado = false;
    }
  }

  obtenerNombreCamioneroDeCliente(cliente: Cliente) {
    var camionero: Camionero;
    var nombre: string = "Sin Nombre";
    if (cliente.camioneroid != null && cliente.camioneroid != undefined)
      this.camioneroService.getCamionero(cliente.camioneroid)
        .subscribe((c) => {
          camionero = c;

          nombre = camionero.Id + "-" + camionero.Nombre;

        })

    return nombre;
  }
  obtenerNombreVendedorDeCliente(cliente: Cliente) {
    var vendedor: Vendedor;
    var nombre: string = "Sin Nombre";
    if (cliente.vendedorid != null && cliente.vendedorid != undefined)
      this.vendedoresService.getVendedor(cliente.vendedorid)
        .subscribe((v) => {
          vendedor = v;

          nombre = vendedor.id + "-" + vendedor.nombre;

        })

    return nombre;
  }



  buscarIdDeClientePorNumero(numero:any) {
    var numeroCliente = 0;
    var idcliente: any = 0;
    var num:number = numero;
    if(num!= undefined)
      idcliente = this.clientes.find(cli => cli.NumeroDeCliente?.trim() === num.toString())?.id;
    if (idcliente == undefined || idcliente == null) {
      idcliente = 0;
    }
  // alert(idcliente)
    return idcliente;

  }

  clienteselectChangeParaImrimir(event: any) {
    
    //const nombreSeleccionado = event.target.options[event.target.selectedIndex].getAttribute('data-nombre');
    //this.filtro.Cliente = this.factura.Cliente;
    var cliente: Cliente = new Cliente();
    var camionero: any = new Camionero();
    var vendedor: any = new Vendedor();
    var idCliente: number;
    var idVendedor: number;
    var idCamionero: number;
    this.facturasAsociadasAlCliente = new Array();
    
    idCliente = this.buscarIdDeClientePorNumero(event.target.value);

    this.clienteService.getCliente(idCliente).subscribe((c) => {
      cliente = c;
      this.clienteSeleccionado = c;



      if (cliente.vendedorid != null)
        this.vendedoresService.getVendedor(cliente.vendedorid)
          .subscribe((v) => {
            vendedor = v
            if (cliente.camioneroid)
              this.camioneroService.getCamionero(cliente.camioneroid).subscribe((c) => {
                camionero = c



                //console.log("cliente seleccionado", cliente)
                //console.log("camionero del cliente", camionero)
                //console.log("vendedor del cliente", vendedor)
                this.facturasAsociadasAlCliente = this.facturas.filter((f) => f.Cliente == cliente.id);
                //console.log("facturas asociadas al cliente", this.facturasAsociadasAlCliente);
                this.deudaClienteSeleccionadoFactura = 0;
                this.deudaClienteSeleccionadoFlete = 0;
                this.deudaClienteSeleccionadoTotal = 0;
                if (this.facturasAsociadasAlCliente.length > 0) {
                  this.facturasAsociadasAlCliente.forEach(fac => {

                    if (fac.Monto != null && fac.Monto != undefined) {
                      this.deudaClienteSeleccionadoFactura += fac.Monto;
                    }

                    if (fac.MontoFlete != null && fac.MontoFlete != undefined) {
                      this.deudaClienteSeleccionadoFlete += fac.MontoFlete;
                    }

                    if (fac.Deuda != null && fac.Deuda != undefined) {
                      this.deudaClienteSeleccionadoTotal += fac.Deuda;
                    }
                  })
                }

              })


          })

    })


  }

  IngresanMontoPagado(event: any) {
    this.MontoPagado = event.target.value;
    if (this.MontoPagado <= this.deudaClienteSeleccionadoTotal && this.MontoPagado > 0) {
      this.MontoQueDebe = this.deudaClienteSeleccionadoTotal - this.MontoPagado;
    }
    else {
      this.notificationService.showNotification("Advertencia", "El valor ingresado " + this.MontoPagado + " no puede ser cero, menor que cero, ni mayor que el valor que deben " + this.deudaClienteSeleccionadoTotal  + " verificar valor e intentar nuevamente.", false);
      this.MontoPagado = 0;
      this.MontoQueDebe = 0;
    }
  }

  registrarPagoCompleto() {
      this.MontoPagado = this.deudaClienteSeleccionadoTotal;
      this.MontoQueDebe = 0;
  }

  

  registrarPago() {
    var contador = 0;
    var id = -1;
    var respuesta;
    var totalFacturas = this.facturasAsociadasAlCliente.length;

    // Crear un array para almacenar todas las solicitudes actualizadas
    var solicitudes: any[] = [];

    // Iterar sobre las facturas y guardar cada solicitud en el array
    this.facturasAsociadasAlCliente.forEach((factura, index) => {
      if (factura.id != null && factura.id != undefined) {
        let id = factura.id;
        try {
          factura.Estado = "Entregada";
          if (this.tipoDePagoSeleccionado == "") {
            this.tipoDePagoSeleccionado = this.tipos[0].substring(0, 2);
          }
          factura.Tipo = this.tipoDePagoSeleccionado;
           
          // Guardar cada solicitud en el array
          const observable = this.facturasService.actualizarFactura(id, factura);
          solicitudes.push(observable);
        }
        catch (error) {
          console.error(error);
        }
      }
    })

    // Utilizar forkJoin para esperar a que todas las solicitudes se completen
    forkJoin(solicitudes).subscribe(
      (responses) => {
        this.showNotification("se marcaron las facturas con exito");
        this.notificationResponse$
          .pipe(take(1)).subscribe((response) => {
            if (response) {
              if (this.MontoQueDebe > 0) {
              //generamos una nueva factura para agregar pero con el monto que queda debiendo el cliente
              var factura: Factura = new Factura();

              //como es una factura de deuda solo colocamos el campo deuda, el monto y el flete lo dejamos en cero
              factura.Cliente = this.clienteSeleccionado.id;
              factura.Camionero = this.clienteSeleccionado.camioneroid;
              factura.Vendedor = this.clienteSeleccionado.vendedorid;
              factura.Deuda = this.MontoQueDebe;
              factura.Monto = factura.Deuda;
              factura.Favor = 0;
              factura.Numero = 0;
              factura.Punto = 0;
              factura.Tipo = "D";
              factura.MontoFlete = 0;
              factura.Estado = "Deuda por pago en partes";

              this.factura = new Factura();
              this.factura = factura;
              this.facturasService.postFacturas(this.factura).subscribe(
                response => {
                  console.log('Datos enviados con éxito:', response);
                  this.obtenerFacturas();
                  this.facturasAsociadasAlCliente = [];
                  this.MontoQueDebe = 0;
                  this.MontoPagado = 0;
                  
                },
                error => {
                  console.error('Error al enviar los datos:', error);
                });

              }
              this.obtenerFacturas();
              this.facturasAsociadasAlCliente = [];
              this.MontoQueDebe = 0;
              this.MontoPagado = 0;
            }
          });
      })
  }
   
   
  async CalcularDeudaDeCliente(id: any): Promise<number> {
  /*  var cliente: Cliente = new Cliente();*/
    var idCliente: number;
    var monto: number = 0;
    var flete: number = 0;
    var total: number = 0;
    this.facturasAsociadasAlCliente = new Array();
    idCliente = id;

    // Esperar a que la petición al servicio clienteService se complete
    
    const cliente = await this.clienteService.getCliente(idCliente).toPromise();
    if(cliente)
    this.facturasAsociadasAlCliente = this.facturas.filter((f) => f.Cliente == cliente.id);
    this.deudaClienteSeleccionadoFactura = 0;
    this.deudaClienteSeleccionadoFlete = 0;
    this.deudaClienteSeleccionadoTotal = 0;

    if (this.facturasAsociadasAlCliente.length > 0) {
      this.facturasAsociadasAlCliente.forEach(fac => {
        if (fac.Monto != null && fac.Monto != undefined) {
          monto += fac.Monto;
        }
        if (fac.MontoFlete != null && fac.MontoFlete != undefined) {
          flete += fac.MontoFlete;
        }
        if (fac.Deuda != null && fac.Deuda != undefined) {
          total += fac.Deuda;
        }
      });
    }

    return total;
  }



  facturasAsociadasAlcliente(id: any) { }

    exportarExel() {
      var montosDeudas: number[];
      var itemData: any[];
      var data: any[] = [
        ['Nro. cliente', 'Cliente', 'Vendedor', 'Camionero', 'Debe']
      ];

      // Map sobre la matriz de clientes para crear un array de promesas
      const promises = this.clientes.map(c => this.CalcularDeudaDeCliente(c.id));

      // Espera a que todas las promesas se resuelvan y obtén los resultados
      Promise.all(promises).then(deudas => {
        // Itera sobre los resultados y crea los datos para cada cliente
        this.clientes.forEach((c, index) => {
          itemData = [c.NumeroDeCliente, c.nombre?.trimEnd(), c.vendedorid + " - " + this.obtenerNombreVendedor(c.vendedorid).trimEnd(),
          c.camioneroid + " - " + this.obtenerNombreCamionero(c.camioneroid).trimEnd(), deudas[index]];
          data.push(itemData);
          itemData = [];
        });

        //console.log("archivo exel");
        //console.log(data);
        const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, 'datos.xlsx');

        // Aquí puedes continuar con tu lógica después de obtener los datos
      }).catch(error => {
        // Manejar cualquier error que pueda ocurrir con las promesas
        console.error('Error al calcular las deudas de los clientes:', error);
      });
     
    
  }

  clienteselectChangeParaMarcarPago(event: any) {

    //const nombreSeleccionado = event.target.options[event.target.selectedIndex].getAttribute('data-nombre');
    //this.filtro.Cliente = this.factura.Cliente;
    var cliente: Cliente = new Cliente();
    var camionero: any = new Camionero();
    var vendedor: any = new Vendedor();
    var idCliente: number;
    var idVendedor: number;
    var idCamionero: number;
    this.facturasAsociadasAlCliente = new Array();
    idCliente = event.target.value;

    this.clienteService.getCliente(idCliente).subscribe((c) => {
      cliente = c;
      this.clienteSeleccionado = c;



      if (cliente.vendedorid != null)
        this.vendedoresService.getVendedor(cliente.vendedorid)
          .subscribe((v) => {
            vendedor = v
            if (cliente.camioneroid)
              this.camioneroService.getCamionero(cliente.camioneroid).subscribe((c) => {
                camionero = c



                //console.log("cliente seleccionado", cliente)
                //console.log("camionero del cliente", camionero)
                //console.log("vendedor del cliente", vendedor)
                this.facturasAsociadasAlCliente = this.facturas.filter((f) => f.Cliente == cliente.id);
                //console.log("facturas asociadas al cliente", this.facturasAsociadasAlCliente);
                this.deudaClienteSeleccionadoFactura = 0;
                this.deudaClienteSeleccionadoFlete = 0;
                this.deudaClienteSeleccionadoTotal = 0;
                if (this.facturasAsociadasAlCliente.length > 0) {
                  this.facturasAsociadasAlCliente.forEach(fac => {

                    if (fac.Monto != null && fac.Monto != undefined) {
                      this.deudaClienteSeleccionadoFactura += fac.Monto;
                    }

                    if (fac.MontoFlete != null && fac.MontoFlete != undefined) {
                      this.deudaClienteSeleccionadoFlete += fac.MontoFlete;
                    }

                    if (fac.Deuda != null && fac.Deuda != undefined) {
                      this.deudaClienteSeleccionadoTotal += fac.Deuda;
                    }
                  })
                }

              })


          })

    })


  }


  clienteselectChangeFiltro(event: any) {
    var cliente: Cliente = new Cliente();
    cliente = event.target.value;

    this.factura.Cliente = cliente.id;
    //const nombreSeleccionado = event.target.options[event.target.selectedIndex].getAttribute('data-nombre');
    this.filtro.Cliente = this.factura.Cliente;
    ////console.log("cliente seleccionado", this.factura.Cliente);
    
    //console.log("factura por agregar", this.factura)
    this.filtrarFactura();
  }

  camioneroselectChangeFiltro(event: any) {
    this.factura.Camionero = event.target.value;
    //const nombreSeleccionado = event.target.options[event.target.selectedIndex].getAttribute('data-nombre');
    this.filtro.Camionero = this.factura.Camionero;
    ////console.log("cliente seleccionado", this.factura.Cliente);
    this.filtrarFactura();
  }

  vendedorselectChange(event: any) {
    //console.log(event.target.value)
    
    this.factura.Vendedor = parseInt(event.target.value);

    //console.log(this.vendedores.find(ven => ven.id == event.target.value)?.PorcentajeFlete)
    this.factura.PorcentajeVenvedor = this.vendedores.find(ven => ven.id == event.target.value)?.PorcentajeFlete;
    this.filtro.Vendedor = this.factura.Vendedor;
 
    //console.log(this.factura.Vendedor)
  }
  camioneroselectChange(event: any) {
    
    this.factura.Camionero = parseInt(event.target.value);
    this.factura.PorcentajeCamionero = this.camioneros.find(cam => cam.Id == event.target.value)?.PorcentajeFlete;
    //console.log(this.factura)
    this.filtro.Camionero = this.factura.Camionero;
    this.calcularCostoFlete();
 
  }

  vendedorselectFiltroChange(event: any) {
    ////console.log("vendedor", event.target.value);
    this.filtro.Vendedor = event.target.value;
     this.filtrarFactura(); 
  }

   SendDataonChangeDesde(event: any) {
    
     this.fechaDesde = event.target.value;
   
  }

  SendDataonChangeHasta(event: any) {
     
    this.fechaHasta = event.target.value;
    
  }




  FinalizarFactura(factura: Factura) {
    //console.log("factura por finalizar", factura);
       if (factura.id != null){ 
      var id = factura.id;
    }
    this.showNotification("Esta seguro que desea finalizar la factura Id: " + factura.id + "?");
    this.notificationResponse$
      .pipe(take(1)).subscribe((response) => {
        if (response) {

          factura.Estado = "Entregada";
          this.facturasService.actualizarfactura(id).subscribe(
            response => {
              this.obtenerFacturas();
            },
            error => {
              //console.log(error);
            });

      
           }
      });
    var cli: Cliente = new Cliente();
    if (factura.Cliente) { 
    this.clienteService.getCliente(factura.Cliente).subscribe(
      response => {
        cli = response;
      },
      error => {
        //console.log(error);
      });
    }


    this.facturasService.rendirAVital(factura,cli).subscribe(
      response => {
        //alert(JSON.stringify(response));
      },
      error => {
        //console.log(error);
      });





      }

 


  ElimnarFactura(f: Factura) {
    var id = f.id;
    this.notificationService.showNotification("Atención", "Esta seguro que desea eliminar la factura? " + f.id + " Los datos de esta factura se eliminaran permanentemente.", false)
    this.notificationResponse$.pipe(take(1)).subscribe((response) => {
      if (response) {
        if(id != undefined)
        this.facturasService.eliminarFactura(id).subscribe(
          () => {
            console.log('La factura se eliminó con éxito');
            this.obtenerFacturas();
          },
          error => {
            console.error('Error al eliminar la factura:', error);
            // Maneja el error adecuadamente
          }
        );


      }
    });
  }

  procesarFacturas() {
    
    this.facturas = [];
    this.facturasService.getFacturas()
      .subscribe((facturas: any[])   => {

        this.facturas = facturas;
       
      this.dataSource.data = [];
      this.dataSource.data = facturas;
        this.dataSource.paginator = this.paginator;
        //console.log("finalizado")
        //console.log("this.facturas", this.facturas)
         for (var i = 0; i < this.facturas.length; i++) {
      //console.log(this.facturas[i])
      if (this.facturas[i].Estado?.includes("E")) {

        //console.log("estado igual a E")
      }
      else {
        //console.log("estado distinto a E")
      }
         }
      });

   
   
      
   
 
  }

  filtrarFactura() {
    this.facturasfiltradas = this.facturasService.filtrarFacturas(this.filtro, this.facturas, this.fechaDesde, this.fechaHasta);
    //this.facturasService.filtrarFacturas(this.filtro).subscribe(result => {
    //  //console.log("facturas encontradas RESULT",result)
      
    //  this.dataSource.data = result;
    //  this.dataSource.paginator = this.paginator;

    //  //console.log("facturas encontradas", this.facturas);
    //  if (result.length == 0) {
    //    this.obtenerFacturas();
    //  }
    //});
    if (this.facturasfiltradas.length > 0) {
      this.existenFacturas = true;
      this.dataSource.data = [];
      this.dataSource.data = this.facturasfiltradas;
      this.dataSource.paginator = this.paginator;
    }
    else {
      this.existenFacturas = false;
    }
  }

  calcularCostoFlete() {

    if (this.factura.Monto != null || this.factura.Monto != undefined && this.factura.MontoFlete != null || this.factura.MontoFlete != undefined) {
      // Habilita la bandera para indicar que el Monto ha sido calculado
      this.MontoCalculado = true;

      // Parsea las variables MontoFlete y Monto a números
      var montoflete: number = parseFloat(this.factura.MontoFlete);

      var monto: any = this.factura.Monto;  

      // Calcula el MontoTotal y redondea a dos decimales
      this.MontoTotal = Math.round((montoflete + monto) * 100) / 100;

      // Actualiza la propiedad Deuda con el MontoTotal
      this.factura.Deuda = this.MontoTotal;

      // Muestra el MontoTotal en la consola
      //console.log("MONTO RECALCULADO", this.MontoTotal);
    }
    
    
  }

  porcentaje_flete_selectChange(event: any) {
    //// Parsea el porcentaje del evento y divídelo por 100
    //this.factura.porcentajeFlete = parseInt(event.target.value.split('%').join(''));
    //let porcentajeFlete = parseInt(event.target.value.split('%').join('')) / 100.00;
    ////console.log(typeof (this.factura.porcentajeFlete))
    //// Verifica que la propiedad Monto no sea nula ni indefinida
    //if (this.factura.Monto != null || this.factura.Monto != undefined) {
    //  // Calcula el MontoFlete y redondea a dos decimales
    //  this.factura.MontoFlete = (this.factura.Monto * porcentajeFlete).toFixed(2);
    //}

    //// Verifica que Monto y MontoFlete no sean nulos ni indefinidos
    //if (this.factura.Monto != null || this.factura.Monto != undefined && this.factura.MontoFlete != null || this.factura.MontoFlete != undefined) {
    //  // Habilita la bandera para indicar que el Monto ha sido calculado
    //  this.MontoCalculado = true;

    //  // Parsea las variables MontoFlete y Monto a números
    //  var montoflete: number = parseFloat(this.factura.MontoFlete);

    //  var monto: any = this.factura.Monto;
     
    //  // Calcula el MontoTotal y redondea a dos decimales
    //  this.MontoTotal = Math.round((montoflete + monto) * 100) / 100;

    //  // Actualiza la propiedad Deuda con el MontoTotal
    //  this.factura.Deuda = this.MontoTotal;

    //  // Muestra el MontoTotal en la consola
    //  //console.log("MONTO RECALCULADO", this.MontoTotal);
    //}
  }
  porcentajeFleteInputChange(event:any) {
    // Parsea el porcentaje del evento y divídelo por 100
    this.porcentajeFlete = event.target.value;
    this.porcentajeFlete = this.porcentajeFlete / 100;
    //alert(this.porcentajeFlete);
   // this.factura.porcentajeFlete = parseInt(event.target.value.split('%').join(''));
    this.factura.porcentajeFlete = this.porcentajeFlete;
    //let porcentajeFlete = parseInt(event.target.value.split('%').join('')) / 100.00;
    let porcentajeFlete = this.porcentajeFlete;
    //console.log(typeof (this.factura.porcentajeFlete))
    // Verifica que la propiedad Monto no sea nula ni indefinida
    if (this.factura.Monto != null && this.factura.Monto != undefined) {
      // Calcula el MontoFlete y redondea a dos decimales
      this.factura.MontoFlete = (this.factura.Monto * porcentajeFlete).toFixed(2);
      //alert(this.factura.MontoFlete);
    }

    // Verifica que Monto y MontoFlete no sean nulos ni indefinidos
    if (this.factura.Monto != null && this.factura.Monto != undefined && this.factura.MontoFlete != null && this.factura.MontoFlete != undefined) {
      // Habilita la bandera para indicar que el Monto ha sido calculado
      this.MontoCalculado = true;

      // Parsea las variables MontoFlete y Monto a números
      var montoflete: number = parseFloat(this.factura.MontoFlete);

      var monto: any = this.factura.Monto;

      // Calcula el MontoTotal y redondea a dos decimales
      this.MontoTotal = Math.round((montoflete + monto) * 100) / 100;

      // Actualiza la propiedad Deuda con el MontoTotal
      this.factura.Deuda = this.MontoTotal;

      // Muestra el MontoTotal en la consola
      //console.log("MONTO RECALCULADO", this.MontoTotal);
    }
  }

  tiposselectChange(event: any) {

    //console.log("tipo", event.target.value)
    this.factura.Tipo = event.target.value.substring(0, 2);
    this.tipoDePagoSeleccionado = event.target.value.substring(0, 2);
  }

  ImprimirFactura(elem: any) {
    var cliente = new Cliente();
    
    var element = elem;


   this.vendedoresService.getVendedor(elem.Vendedor).subscribe(ven => {
      this.vendedorImp = ven;
      //console.log("vendedor", this.vendedorImp.nombre)
    });


    this.clienteService.getCliente(elem.Cliente).subscribe(cli => {
      cliente = cli;

      //console.log("cliente" + cliente.nombre);

   


      //console.log("vendedor" + this.vendedorImp.nombre);
      this.notificationService.showNotification(
        "Datos de la factura ID:" + elem.id,
        
        + "<br> Punto: " + elem.Putno
        + " - Número: " + elem.Numero
        + "<br> Fecha: " + elem.Fecha
        + "<br> Forma de pago: " + elem.Tipo
        + "<br> Monto: $" + elem.Monto
        + "<br> MontoFlete: $" + elem.MontoFlete
        + "<br> Pagado: $" + elem.Pagado
        + "<br> Deuda: $" + elem.Deuda
        + "<br> "
 
       // + ".________________________________________________________________________________________________________________________________________." +
        + "<br> Este cliente ID: " + elem.Cliente + " Nombre: " + cliente.nombre + " debe : $" + elem.Deuda
       // + ".________________________________________________________________________________________________________________________________________." +
        + "<br> Fue vendido por el vendedor ID: " + elem.Vendedor + " Nombre: " + this.vendedorImp.nombre 
      ,true);

      this.notificationResponse$.pipe(take(1)).subscribe((response) => {
        if (response) {

          

         //this.clienteService.postClientes(this.nuevoCliente).subscribe(
          //  response => {
          //    //console.log('Datos enviados con éxito:', response);
          //    this.ObtenerClientes()
          //  },
          //  error => {
          //    console.error('Error al enviar los datos:', error);
          //  });



        }
      });

    });
  }

  limpiarFiltros() {
    this.existenFacturas = true;
    this.filtro.Punto = undefined;
    this.filtro.Numero = undefined;
    this.filtro.Tipo = undefined;
    this.filtro.Fecha = undefined;
    this.facturas = [];
    this.facturasfiltradas = this.facturas;
    this.dataSource.data = [];
    this.dataSource.data = this.facturasfiltradas;
    this.dataSource.paginator = this.paginator;
    //console.log("limpiados")
    this.obtenerFacturas();
    this.obtenerNotasDeCredito();

  }

}



