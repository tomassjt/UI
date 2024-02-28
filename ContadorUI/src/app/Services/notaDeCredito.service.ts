import { Overlay } from '@angular/cdk/overlay';
import { ComponentRef, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
 
import { catchError, filter, map, Observable, of, tap, throwError } from 'rxjs';
import { Factura } from '../Models/factura.models';
import { facturaRendidaAVital } from '../Models/facturaRendidaAVital';
import { Cliente } from '../Models/cliente.models';
import { ClientesServiceService } from './clientes-service.service';
import { NotaDeCredito } from '../Models/notaDeCredito';
import { VentanaEditarNotaCreditoComponent } from '../utils/ventana-editar-nota-credito/ventana-editar-nota-credito.component';
import { ComponentPortal } from '@angular/cdk/portal';
 

@Injectable({
  providedIn: 'root'
})
export class notaDeCreditoService {
  notas: NotaDeCredito[] = new Array();
  private apiBaseUrl = 'http://tomasstome-001-site1.itempurl.com/api/NotaCredito/';
                                               
  private apiBaseUrlCli = 'http://tomasstome-001-site1.itempurl.com/api/Clientes1/';
  private apiBaseUrlVital = 'http://tomasstome-001-site1.itempurl.com/api/FacturasRendidasAVitals';
                                                    
  constructor(private http: HttpClient, private overlay: Overlay, private clientesServiceService: ClientesServiceService) { }

  getNotas(): Observable<NotaDeCredito[]> {
    const endpoint = this.apiBaseUrl;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://localhost:44313' // Cambia la URL según corresponda
      })
    };

    return this.http.get<any[]>(endpoint).pipe(     
      tap(notasResp => {
        // Realiza el console.log aquí
        console.log('Datos antes del mapeo NOTAS:', notasResp);
      }),
      
      map(notasResp => 
        notasResp.map((notasResp: any) => this.mapToNotaDeCredito(notasResp))  
        )
    );
   }

 
 

  //mapeo la varaible enviada data de tipo any y a nota de credito
  private mapToNotaDeCredito(data: any): NotaDeCredito {
   
    //console.log("datos de nota de credito antes de mapear", data)
    return {
      id: data.id,
      cliId: data.cliId,
      facId: data.facId,
      fecha: data.fecha,
      monto: data.monto,
      flete: data.flete,
      estado: data.estado,
      idFactura: data.idFactura,
      numeroGuia: data.numeroGuia,
      numeroFactura: data.numeroFactura,
      puntoFactura:data.puntoFactura,
      fechaBaja: data.fechaBaja,
      fletePorc: data.fletePorc,
      cuenta: data.cuenta,
      descripcion: data.descripcion,

    };
  }

  //dar de baja nota de credito por si se confundieron en la descripcion
   bajaNotaDeCredito(nuevaNota: any): Observable<NotaDeCredito> {

     nuevaNota.estado = 1;
     nuevaNota.fechaBaja = new Date();
    // alert("fecha asignada d ebaja"+ nuevaNota.fechaBaja)
    //alert(JSON.stringify(nuevaNota))
    let id = nuevaNota.id;
    const url = `${this.apiBaseUrl}${id}`;

    var respuesta = this.http.put(url, nuevaNota);
    return respuesta;
  }


  //actualizar nota de credito por si se confundieron en la descripcion
  actualizarNotaDeCredito(nuevaNota: any): Observable<NotaDeCredito> {
   
    
   //alert(JSON.stringify(nuevaNota))
    let id = nuevaNota.id;
    const url = `${this.apiBaseUrl}${id}`;
     
    var respuesta = this.http.put(url,nuevaNota);
    return respuesta;
  }
 
  //filtrar notas de credito
  filtrarNotasDeCredito(filtro: NotaDeCredito, notas: NotaDeCredito[]): NotaDeCredito[] {
    //alert("filtrando por" + JSON.stringify(filtro));
    //alert("de notas"+ JSON.stringify(notas));
    return notas.filter(nota => {
      // Verifica si hay un valor para cada campo de filtro y compara los valores
      return ((!filtro.numeroGuia || nota.numeroGuia == filtro.numeroGuia) &&
              (!filtro.idFactura || nota.idFactura == filtro.idFactura) &&
              (!filtro.cliId || nota.cliId == filtro.cliId));
    });
   
   
  }
  //promise
  async obtenerCantidadEspectacularDeDatos(): Promise<any> {
    var nu = 2;
    var ne = 3;

    return new Promise<any> ((resolve, reject) => {

      setTimeout(() => { 

      if (nu != ne) {
        resolve('Respuesta Correcta 10');
      }
      else {
        reject(new Error('Ocurrió un error después de 5000 ms'));

        }

      }, 3000)

    });
  
     
 
 }


  //agregar nota de credito
  postNotaDeCreditoTiempo(nota: any): Promise<any> {
    var Nota: NotaDeCredito = new NotaDeCredito();

    var notaMapeada = this.mapToNotaDeCredito(nota);
 
    console.log("nota antes de enviar el post", notaMapeada)
    const url = `${this.apiBaseUrl}`;
    console.log(url)

    return new Promise<any>((resolve, reject) => {

      resolve(this.http.post<any>(this.apiBaseUrl, notaMapeada))

      catchError((error) => {
        console.error('Error en el post:', error);
        reject(new Error('Ocurrió un error al realizar el post de la nota de crédito'));
        return throwError('Ocurrió un error al realizar el post de la nota de crédito');
      })
    

    
  })
  }       
  


   
  //agregar nota de credito
  postNotaDeCredito(nota: any): Observable<any> {
    var Nota: NotaDeCredito = new NotaDeCredito();
    Nota.descripcion = nota.textarea;
    Nota.cliId = nota.numero;
    Nota.monto = nota.monto;
    Nota.idFactura = nota.idFactura;
    Nota.puntoFactura = nota.puntoFactura;
    Nota.numeroFactura = nota.numeroFactura;
    Nota.numeroGuia = nota.numeroGuia;
    console.log("nota antes de enviar el post", Nota)
    const url = `${this.apiBaseUrl}`;
    console.log(url)

    return this.http.post<any>(url,Nota)
      .pipe(
        catchError(error => {
          console.error("Error en la solicitud POST:", error);
          return throwError(error); // Propaga el error para manejo adicional si es necesario
        })
      );
  }
  
  borrarNotaDeCredito(nota: NotaDeCredito): Observable <any> {
    const url = `${this.apiBaseUrl}${nota.id}`;
    return this.http.delete<any>(url);

  }
  //GetcantidadTotalNotas(): Observable<number>  {
  //  let cant: number = 0;
  //  //cant = this.http.get<number>(this.apiBaseUrl + '/cantidadTotalFacturas');
  //  return this.http.get<number>(this.apiBaseUrl + 'cantidadTotalNotas');;
  //}

  //editar cliente
  editarNotaCreditoVentana(nota: NotaDeCredito): ComponentRef<VentanaEditarNotaCreditoComponent> {
    const positionStrategy = this.overlay
      .position()
      .global()
      .centerHorizontally()
      .top('10%');

    const overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: false,
    });
    const notificationPortal = new ComponentPortal(VentanaEditarNotaCreditoComponent);
    const componentRef = overlayRef.attach(notificationPortal);

    componentRef.instance.notaAEditar = nota;

    // Devuelve una referencia al componente para permitir el control de botones
    return componentRef;
  }



}
