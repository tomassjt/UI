import { Component, OnInit, ViewChild } from '@angular/core';
import { Balance } from '../Models/balance.models';
import { Factura } from '../Models/factura.models';
import { FacturasService } from '../Services/facturas.service';
import { ClientesServiceService } from '../Services/clientes-service.service';
import { NotificacionService } from '../Services/notificacion.service';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../Services/adminService';
import { Cliente } from '../Models/cliente.models';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Camionero } from '../Models/camionero.models';
import { NotaDeCredito } from '../Models/notaDeCredito';
import { notaDeCreditoService } from '../Services/notaDeCredito.service';
import { CamionerosService } from '../Services/camioneros.service';
import { Admin } from '../Models/admin.models ';
import { Vendedor } from '../Models/vendedor.models';
import { VendedoresService } from '../Services/vendedores.service';
 
@Component({
  selector: 'app-pago-vital',
  templateUrl: './pago-vital.component.html',
  styleUrls: ['./pago-vital.component.css']
})
export class PagoVitalComponent implements OnInit{
  //definimos las variables globales
  PagoVitalForm: FormGroup;
  guia: number = 0;
  balance: Balance = new Balance();
  factENT: Factura[] = new Array;
  factENTAux: Factura[] = new Array;
  loading: boolean = false;
  clientes: Cliente[] = new Array;
  notasDeCredito: NotaDeCredito[] = new Array();
  //variables tablas
  displayedColumnsEntregadas: string[] = ['id', 'Guia', 'Cliente','Camionero', 'Fecha',  'Monto'];
  dataSourceEntregadas = new MatTableDataSource<any>();
  @ViewChild('pag2') pag2!: MatPaginator;
  pageSizeEntregadas = 5;
  //variablas tabla notas de credito
  displayedColumnsNotas: string[] = ['cliId', 'facId', 'monto', 'desc'];
  dataSourceNotas = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginatorNotas!: MatPaginator;
  pageSizeNotas = 5;
  camioneros: Camionero[] = new Array();
  vendedores: Vendedor[] = new Array();
  admin: Admin = new Admin();
  calculado: boolean = false;
  totalCamioneros: number = 0;
  totalVendedores: number = 0;
  camionerosRespaldo: Camionero[] = new Array();
  vendedoresRespaldo: Vendedor[] = new Array();
  constructor(
    private fb: FormBuilder,
    private facturasService: FacturasService,
    private clientesService: ClientesServiceService,
    private camionerosService:CamionerosService,
    private notificationService: NotificacionService,
    private vendedoresService: VendedoresService,
    private adminService: AdminService,
    private matPaginatorIntl: MatPaginatorIntl,
    private matPaginatorIntl2: MatPaginatorIntl,
    private notaDeCreditoService: notaDeCreditoService
  ) {
    this.PagoVitalForm = this.fb.group({
      numeroGuia: [
        null,
        [Validators.min(1)]
      ],
      numeroCliente: [
        null,
        [Validators.min(1)]
      ],
      idCamionero: [
        null,
        [Validators.min(1)]
      ],
    });


  }

  ngOnInit() {
    this.obtenerFacturas();
    this.obtenerClientes();
    this.obtenerCamioneros();
    this.obtenerAdmin();
    this.obtenerVendedores();
    this.obtenerNotasDeCredito();
    
    
  }
  obtenerVendedores() {
    this.vendedoresService.getVendedores().subscribe((v) => {
      this.vendedores = v;
      this.vendedoresRespaldo = this.vendedores;
      console.log("vendedores", this.vendedores);
    })
  }
  obtenerAdmin() {
    this.adminService.getAdmins().subscribe((a) => {
      console.log(a[0])
      var ad: any = a[0];
      
      this.admin.PorcentajeFlete = ad.porcentajeFlete/100;

    
    })
  }
   
  obtenerCamioneros() {
    this.camionerosService.getCamioneros().subscribe((c) => {
      this.camioneros = c;
      this.camionerosRespaldo = this.camioneros;
    })
  }
  //definimos las funciones
  obtenerFacturas() {
    this.obtenerFacturasEntregadas()
      .then((facEn) => {
        this.factENT = facEn;
        this.dataSourceEntregadas.data = [];
        this.dataSourceEntregadas.data = this.factENT;
        this.dataSourceEntregadas.paginator = this.pag2;

        //this.factENT.forEach(f => {
        //  if (this.guia == f.cargaNumero) {
        //    if (f.Deuda)
        //      this.balance.porCobrar = f.Deuda;
        //  }
          
        //})
        
      })
  }



  obtenerNotasDeCredito() {
    this.notasDeCredito = [];
    var notasFiltradas: NotaDeCredito[] = new Array();
    this.dataSourceNotas.data = [];

      this.notaDeCreditoService.getNotas().subscribe((n) => {
      this.notasDeCredito = n;
        this.dataSourceNotas.data = this.notasDeCredito;
        notasFiltradas = this.notasDeCredito.filter((nota) => {
          return this.factENT.some((factura) => nota.idFactura === factura.id);
        });
         
        this.notasDeCredito = notasFiltradas;
        this.dataSourceNotas.data = notasFiltradas;
        this.calcular();
    })
  }

  filtrarNotasPorFacturas() {
   
    var notasFiltradas: NotaDeCredito[] = new Array();
    console.log("se esta por filtrar entre estas notas", this.notasDeCredito, " se buscan las siguientes fact", this.factENT)
      notasFiltradas = this.notasDeCredito.filter((nota) => {
        return this.factENT.some((factura) => nota.idFactura === factura.id);
      });
    //alert(JSON.stringify(notasFiltradas))
    this.notasDeCredito = notasFiltradas;
    this.dataSourceNotas.data = notasFiltradas;

 
  }

  obtenerFacturasEntregadas(): Promise<Factura[]> {
    this.factENT = [];
    var facAux: Factura[] = new Array();
    return new Promise((resolve) => {
      this.facturasService.getFacturasEntregadas()
        .subscribe(f => {
        
          facAux = f
            .filter((f) => {
              return f.RendidaAVital != 1
            })
          console.log("las facturas luego de filtrarlas por el 1", facAux)
  
          this.factENT = facAux;
          this.dataSourceEntregadas.data = this.factENT;
          this.dataSourceEntregadas.paginator = this.pag2;
          resolve(this.factENT);
         
        });
    })
  }


  obtenerClientes() {
    this.clientes = [];
    this.clientesService.getClientes()
      .subscribe((c) => {
        this.clientes = c;
      })
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
   

  Filtrar() {
    var factAUX: Factura[] = new Array();
     
    this.factENTAux = [];
    
    this.dataSourceEntregadas.data = [];
     
    this.obtenerFacturasEntregadas()
    
      .then(() => {
        this.factENT.forEach((factura: Factura) => {
          if (
            (!this.PagoVitalForm.get('numeroCliente')?.value || factura.Cliente == this.PagoVitalForm.get('numeroCliente')?.value) &&
            (!this.PagoVitalForm.get('idCamionero')?.value || factura.Camionero == this.PagoVitalForm.get('idCamionero')?.value) &&
            (!this.PagoVitalForm.get('numeroGuia')?.value || factura.cargaNumero == this.PagoVitalForm.get('numeroGuia')?.value)
          ) {
            factAUX.push(factura);
           
          }
        })

        this.factENT = factAUX;

        this.dataSourceEntregadas.data = [];
        this.dataSourceEntregadas.data = this.factENT;
        this.obtenerNotasDeCredito(); // ya se filtran ahi
        
      })
    this.calcular();
  }

  calcular() {
   
     
    this.calculado = true;

    this.balance.ganancias = 0;
    this.balance.totalNotasDeCredito = 0;
    this.factENT.forEach((f) => {
      //alert(this.admin.PorcentajeFlete)
      if (f.Monto != null && f.Monto != undefined && this.balance.ganancias != undefined) {
        //verifico que nos ea el admin en el caso de que sea no lo sumo a las ganancias 
        if (f.Vendedor != 0 && f.Vendedor != 1) {
        this.balance.ganancias = this.balance.ganancias + f.Monto;
        if (this.admin.PorcentajeFlete != undefined) {
          this.admin.GananciaFletes = f.Monto * this.admin.PorcentajeFlete;
          
        }
        }
       }
    })

    // Filtrar camioneros cuyos numeros de id esten incluidos dentro de facturasENT.ID
    if (this.camionerosRespaldo != undefined)
    this.camioneros = this.camionerosRespaldo;
    const camionerosFiltrados = this.camioneros.filter((camionero) =>
      this.factENT.some((factura) => factura.Camionero === camionero.Id)
    );
    this.camioneros = []
    this.camioneros = camionerosFiltrados;

    // Filtrar vendedores cuyos numeros de id esten incluidos dentro de facturasENT.ID
    if (this.vendedoresRespaldo != undefined)
    this.vendedores = this.vendedoresRespaldo;
    const vendedoresFiltrados = this.vendedores.filter((vendedor) =>
      this.factENT.some((factura) => factura.Vendedor === vendedor.id)
    );
    this.vendedores = [] 
    this.vendedores = vendedoresFiltrados;



    //calculamos ganancias de camioneros
    var camionerosAux: Camionero[] = new Array();
    camionerosAux = this.camioneros;
    
    this.camioneros.forEach((c, index) => {
      if (c.PorcentajeFlete && this.balance.ganancias)
      camionerosAux[index].ganancia = this.balance.ganancias * c.PorcentajeFlete / 100;
    })
    this.camioneros = camionerosAux;

    //calculamos el total de gnaancias de los camioneros para restarlo a lo de vital
    this.totalCamioneros = 0;
    this.camioneros.forEach((c) => {
      this.totalCamioneros = this.totalCamioneros + c.ganancia;
    })
   

    //calculamos el total de gnaancias de los vendedores para restarlo a lo de vital
    var vendedoresAux: Vendedor[] = new Array();
    vendedoresAux = this.vendedores
    this.vendedores.forEach((v, index) => {
      if (v.PorcentajeFlete && this.balance.ganancias)
        vendedoresAux[index].ganancia = this.balance.ganancias * v.PorcentajeFlete / 100;
    })
    this.vendedores = vendedoresAux;
    this.totalVendedores = 0;
    this.vendedores.forEach((v) => {
     
      if (v.ganancia)
      this.totalVendedores = this.totalVendedores + v.ganancia;
    })
    

    //calculamos el total de las notas de credito
    this.notasDeCredito.forEach((n) => {
      if (n.monto != null && n.monto != undefined && this.balance.totalNotasDeCredito != undefined) {
        this.balance.totalNotasDeCredito = this.balance.totalNotasDeCredito + n.monto;
      }
    })

    //calculamos cuanto se le debe enviar a vital restando ganancias propias y de camioneros
    this.balance.subTotal = this.balance.ganancias - this.balance.totalNotasDeCredito;

    this.balance.GananciaVital = parseFloat((this.balance.subTotal - this.admin.GananciaFletes - this.totalCamioneros - this.totalVendedores).toFixed(2));
 
   
    }

  obtenerPagosVital(){ }

  CerrarCarga() {
    this.loading = true;
   // alert("cerrando carga");
    console.log("se marcarian las siguientes facturas como enviadas a vital")
    console.log(this.factENT)
    var resp = this.facturasService.cerrarCarga(this.factENT)
          
      .then((resp) => {
        this.loading = false;
        if (resp) {
        this.notificationService.showNotification("Exito", "Se cerro la carga con exito.", false);
      }
      else {
        this.notificationService.showNotification("Error", "Ocurrio un error al cerrar la carga", false);
        }
        this.obtenerFacturas();
        this.obtenerNotasDeCredito();
        this.limpiarFormulario();

    })
     
    console.log("se marcarian las siguientes notas de credito como envia a virta l ")
    console.log(this.notasDeCredito)
  }


  enviarFormulario() {
    
    // Aquí puedes manejar la lógica para enviar el formulario
    console.log('Formulario enviado:', this.PagoVitalForm.value);
    this.adminService.registrarPagoVital(this.PagoVitalForm.value)
      .then(
        respuesta => {
          // Manejar la respuesta aquí si es necesario
          this.notificationService.showNotification("Exito", "La se guardo el formulario correctamente.", false);
          this.limpiarFormulario();
          this.obtenerPagosVital();
        },
        error => {
          // Manejar el error aquí si es necesario
          this.notificationService.showNotification("Ups!", "Ocurrio un error al intentar guardar el formulario en la Base de datos", false);
        }
      );


  }

  limpiarFormulario() {
    this.PagoVitalForm.reset();
    this.balance.ganancias = 0;
    this.balance.porCobrar = 0;
    this.balance.subTotal = 0;
    this.admin.GananciaFletes = 0;
    this.balance.ganancias = 0;
    this.balance.GananciaVital = 0;
  }

}
