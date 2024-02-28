import { Overlay } from '@angular/cdk/overlay';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, filter, map, Observable, of, tap, throwError } from 'rxjs';
import { Factura } from '../Models/factura.models';
import { facturaRendidaAVital } from '../Models/facturaRendidaAVital';
import { Cliente } from '../Models/cliente.models';
import { ClientesServiceService } from './clientes-service.service';


@Injectable({
  providedIn: 'root'
})
export class FacturasService {
  facturas: Factura[] = new Array();
  private apiBaseUrl = 'http://tomasstome-001-site1.itempurl.com/api/Facturas/';
                                               
  private apiBaseUrlCli = 'http://tomasstome-001-site1.itempurl.com/api/Clientes1/';
  private apiBaseUrlVital = 'http://tomasstome-001-site1.itempurl.com/api/FacturasRendidasAVitals';
                                                    
  constructor(private http: HttpClient, private overlay: Overlay, private clientesServiceService: ClientesServiceService) { }

  getFacturas(): Observable<Factura[]> {
    const endpoint = this.apiBaseUrl;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://localhost:44313' // Cambia la URL según corresponda
      })
    };

    return this.http.get<any[]>(endpoint).pipe(
      
      tap(facturasresp => {
        // Realiza el console.log aquí
        console.log('Datos antes del mapeo:', facturasresp);
      }),
      
      map(facturasresp => 
        facturasresp
         
       .map((facturasresp: any) => this.mapToFactura(facturasresp))  
  
      )
      

    );

  }
  //obtener facturas retorna un promise
  obtenerFacturasPromise(): Promise<any> {
    var factura: Factura[] = new Array();
    var facturaMapeada = this.mapToFactura(factura);
    return new Promise<any>((resolve, reject) => {
      var facturaMapeada = this.mapToFactura(this.http.get<any>(this.apiBaseUrl));
   
      resolve(facturaMapeada);
      catchError((error) => {
        console.error('Error en el post:', error);
        reject(new Error('Ocurrió un error al realizar el post de la nota de crédito'));
        return throwError('Ocurrió un error al realizar el post de la nota de crédito');
      })
    })
  }     
 

  //metodo que retorna lista de facturas no entregadas
  getFacturasNoEntregadas(): Observable<Factura[]> {
    return this.http.get<any[]>(`${this.apiBaseUrl}`).pipe(
      map(facturas =>
        facturas
          .filter(factura => !factura.estado || factura.estado.trim().toLowerCase().includes('entregada'))
          .map(factura => this.mapToFactura(factura))
        )
       );
  }
   
  
  //metodo que retorna lista de facturas entregadas
  getFacturasEntregadas(): Observable<Factura[]> {
    return this.http.get<any[]>(`${this.apiBaseUrl}`).pipe(
      map(facturas =>
        facturas
          .filter(factura => factura.estado && factura.estado.trim().toLowerCase().includes('entregada'))
          .map(factura => this.mapToFactura(factura))
      )
    );
  }
  //mapeo la variable data de tipo any que retorna el back en Factura
  private mapToFactura(data: any): Factura {
    
    return {
      id: data.id,
      Camionero: data.camionero,
      Vendedor: data.vendedor,
      Punto: data.punto,
      Numero: data.numero,
      Cliente: data.cliente,
      cargaNumero: data.cargaNumero,
      RendidaAVital: data.rendidaAVital,
      Fecha: data.fecha,
      FechaEntrega: data.fechaEntrega,
      Tipo: data.tipo,
      Monto: data.monto,
      MontoFlete: data.montoFlete,
      Pagado: data.pagado,
      Deuda: data.deuda,
      Favor: data.favor,
      FechaDesde: data.fechaDesde,
      FechaHasta: data.fechaHasta,
      Estado: data.estado,
      EstadoBool: data.estadoBool,
      PorcentajeAdmin: data.porcentajeAdmin,
      PorcentajeVenvedor: data.porcentajeVenvedor,
      PorcentajeCamionero: data.porcentajeCamionero,
      porcentajeFlete: data.porcentajeFlete
      
    };
  }


  //actualizar factura marcarla como pagada o como finalizada 
  actualizarfactura(id: number): Observable<any> {
     //marcarla como entregada
    const url = `${this.apiBaseUrl}${id}`;
    var respuesta = this.http.put(`${this.apiBaseUrl}${id}/entregar`, {})
    return respuesta;
  }

  //eliminar factura
  eliminarFactura(id: number): Observable<any> {
    return this.http.delete(`${this.apiBaseUrl}${id}`);
  }

  //metodo put para poder modificar las facturas como nosotros querramos 
  actualizarFactura(id: number, factura: Factura): Observable<any> {
     
    return this.http.put(`${this.apiBaseUrl}${id}`, factura);
  }

  //
  cerrarCarga(fac: Factura[]): Promise<boolean> {
    let resp = false;

    // Utilizamos map para obtener un array de promesas
    const promises = fac.map(async (f) => {
      const url = `${this.apiBaseUrl}${f.id}/cerrarCarga`;

      try {
        // Utilizamos el método put para enviar la solicitud PUT
        await this.http.put<any>(url, {}).toPromise();
        resp = true;
      } catch (error) {
        // Manejar errores si es necesario
        console.error(`Error al cerrar carga para factura con ID ${f.id}`, error);
      }
    });

    // Esperar a que todas las solicitudes se completen antes de devolver el resultado
    return Promise.all(promises).then(() => resp);
  }

  rendirAVital(factura: Factura, Cli: Cliente): Observable<any> {
    console.log("marcando");
    var factura_para_vital: facturaRendidaAVital = new facturaRendidaAVital();
     
   

     
    //el id de la carga se encuentra y carga en el back
    factura_para_vital.FacId = factura.id;
    factura_para_vital.CliId = factura.Cliente;
    factura_para_vital.VenId = factura.Vendedor;
    factura_para_vital.CamId = factura.Camionero;
    factura_para_vital.Carga = 1;
    factura_para_vital.Cli = Cli;
    factura_para_vital.Fac = factura;

    //rendir factura a vital
    const url_vital = `${this.apiBaseUrlVital}`;
    console.log(url_vital);
    var respuesta_vital = this.http.post<any>(url_vital, factura_para_vital);
    console.log(JSON.stringify(respuesta_vital));

    return this.http.post<any>(url_vital, factura_para_vital);
  }

 


  //filtrar facturas


  filtrarFacturas(filtro: Factura, facturas: Factura[], fechaDesde: string, fechaHasta: string): Factura[] {

    const fechaDesdeObj = fechaDesde;
    const fechaHastaObj = fechaHasta;
    // console.log(filtro);
    console.log("filtrando por 777", filtro)


    return facturas.filter(factura => {
      // Verifica si hay un valor para cada campo de filtro y compara los valores
      return (!filtro.id || factura.id == filtro.id) &&
        (!filtro.Punto || factura.Punto == filtro.Punto) &&
        (!filtro.Numero || factura.Numero == filtro.Numero) &&
        (!filtro.Cliente || factura.Cliente == filtro.Cliente) &&
        (!filtro.Vendedor || factura.Vendedor == filtro.Vendedor) &&
        (!filtro.Camionero || factura.Camionero == filtro.Camionero) &&
        (!filtro.Tipo || factura.Tipo?.toLowerCase().includes(filtro.Tipo.toLowerCase())) &&
        (!filtro.Monto || factura.Monto == filtro.Monto) &&
        (!filtro.MontoFlete || factura.MontoFlete == filtro.MontoFlete) &&
        (!filtro.Pagado || factura.Pagado == filtro.Pagado) &&
        (!filtro.cargaNumero || factura.cargaNumero == filtro.cargaNumero) &&
        (!filtro.Deuda || factura.Deuda == filtro.Deuda) &&
        (!filtro.Favor || factura.Favor == filtro.Favor) &&
        (!factura.Fecha || factura.Fecha >= fechaDesdeObj) ||
        (!factura.Fecha || factura.Fecha <= fechaHastaObj);
    });
  }

  //filtrar por fecha
  filtrarFacturasPorFecha(facturas: Factura[], fechaDesde: string, fechaHasta: string, numeroCarga: number): Observable<Factura[]> {
    const fechaDesdeObj = fechaDesde;
    const fechaHastaObj = fechaHasta;
    const cargaNumero = numeroCarga;
    console.log("los datos del filtro",fechaDesde, fechaHasta, numeroCarga)
    console.log("se estan por filtrar las facturas", facturas)
    let facturasFiltradas: Factura[] = [];

    if (fechaDesde.length == 0 || fechaHasta.length == 0) {
      // Filtrar solo por número de carga si no hay fechas especificadas
      facturasFiltradas = facturas
        .filter(factura => !factura.cargaNumero || factura.cargaNumero == cargaNumero)
         
    } else {
      // Filtrar por fechas y número de carga
      facturasFiltradas = facturas
        .filter(factura =>
          (!factura.Fecha || (factura.Fecha >= fechaDesde && factura.Fecha <= fechaHasta)) &&
          (!factura.cargaNumero || factura.cargaNumero == cargaNumero)
        )
        
    }
    console.log("las facturas filtradas son ", facturasFiltradas)
    return of(facturasFiltradas);
  }

  filtrarSoloPorNumero(facturas: Factura[], cargaNumero: number): Observable< Factura[]>{
    const facturasFiltradas = facturas
      .filter(factura => factura.cargaNumero === cargaNumero);
 
       //console.log("imprime service solo por numero", facturasFiltradas)
    return of(facturasFiltradas);
  }
 



  convertirFormatoFecha(fechaOriginal: string): string {
    // Convierte la cadena de fecha original en un objeto Date
    const fechaObj = new Date(fechaOriginal);

    // Obtiene el año, mes y día de la fecha
    const año = fechaObj.getFullYear();
    const mes = fechaObj.getMonth() + 1; // Los meses comienzan desde 0, así que se suma 1
    const dia = fechaObj.getDate();

    // Formatea el mes y el día para asegurar que tengan dos dígitos
    const mesFormateado = mes < 10 ? `0${mes}` : mes.toString();
    const diaFormateado = dia < 10 ? `0${dia}` : dia.toString();

    // Crea la nueva cadena de fecha en el formato deseado
    const nuevaFecha = `${año}-${mesFormateado}-${diaFormateado}`;

    return nuevaFecha;
  }
  

  //agregar factura
  postFacturas(factura: Factura): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*' // Esto permite cualquier origen, puedes ajustarlo según tus necesidades
    });
    console.log("factura antes de enviar el post", factura)
    return this.http.post<any>(this.apiBaseUrl, factura)
      .pipe(
        catchError(error => {
          console.error("Error en la solicitud POST:", error);
          return throwError(error); // Propaga el error para manejo adicional si es necesario
        })
      );
  }

  GetcantidadTotalFacturas(): Observable<number>  {
    let cant: number = 0;
    //cant = this.http.get<number>(this.apiBaseUrl + '/cantidadTotalFacturas');
    return this.http.get<number>(this.apiBaseUrl + 'cantidadTotalFacturas');;
  }

}
