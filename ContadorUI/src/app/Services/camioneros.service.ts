import { ComponentRef, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Cliente } from '../Models/cliente.models';
import { catchError, map, Observable, tap } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { VentanaEditarClienteComponent } from '../utils/ventana-editar-cliente/ventana-editar-cliente.component';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Vendedor } from '../Models/vendedor.models';
import { VentanaEditarVendedorComponent } from '../utils/ventana-editar-vendedor/ventana-editar-vendedor.component';
import { Camionero } from '../Models/camionero.models';
import { VentanaEditarCamioneroComponent } from '../utils/ventana-editar-camionero/ventana-editar-camionero.component';


@Injectable({
  providedIn: 'root'
})
export class CamionerosService {
  private apiUrl = 'http://tomasstome-001-site1.itempurl.com';
  private apiBaseUrl = 'http://tomasstome-001-site1.itempurl.com/api/Camionero'; // Cambia la URL de acuerdo a tu configuración

  constructor(private http: HttpClient, private overlay: Overlay) { }

  getCamioneros(): Observable<Camionero[]> {
    const endpoint = `http://tomasstome-001-site1.itempurl.com/api/Camionero`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://tomasstome-001-site1.itempurl.com/api/Camionero' // Cambia la URL según corresponda
      })
    };

    return this.http.get<any[]>(endpoint).pipe(
      
      map(camioneroresp => {
        console.log(camioneroresp);
        let vendedoresRet: any[] = new Array();
        camioneroresp.forEach(camioneroResp => {
          let camionero: Camionero = new Camionero();
          camionero.Id = camioneroResp.id;
          camionero.Direcicon = camioneroResp.direcicon;
          camionero.Nombre = camioneroResp.nombre;
          camionero.Telefono = camioneroResp.telefono;
          camionero.Flete = camioneroResp.flete;
          camionero.PorcentajeFlete = camioneroResp.porcentajeFlete;
          vendedoresRet.push(camionero);
        });
        return vendedoresRet;
      })
    );

  }

  //agregar camionero
  postCamioneros(camionero: Camionero): Observable<any> {
    console.log("entro a hacer el post");
    console.log("Camionero a guardar", camionero);

    return this.http.post<any>(this.apiBaseUrl, camionero)
      .pipe(
        tap(response => {
          console.log("ret", response);
        }),
        catchError(error => {
          console.error("Error en la solicitud POST:", error);
          throw error; // Propaga el error para manejo adicional si es necesario
        })
      );
  }


  //eliminar camionero
  deleteCamionero(id: number): Observable<any> {
    const endpoint = `${this.apiBaseUrl}/${id}`;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    console.log("eliminando")

    return this.http.delete<any>(endpoint, httpOptions).pipe(
      catchError(error => {
        console.error("Error en la solicitud DELETE:", error);
        throw error; // Propaga el error para manejo adicional si es necesario
      }));
  }

  //buscar camionero
  getCamionero(id: number): Observable<Camionero> {
    const endpoint = `${this.apiBaseUrl}/${id}`;
    return this.http.get<any>(endpoint).pipe(
      catchError(error => {
        console.log("hubo un error al intentar obtener el cliente");
        throw error;
      }));
  }

  //obtener cantidad total de clientes
  cantidadTotalCamioneros(): Observable<number> {
    const endpoint = `${this.apiBaseUrl}/cantidadTotalCamioneros`;
    return this.http.get<any>(endpoint).pipe(
      catchError(error => {
        console.log("hubo un error al intentar obtener el cliente");
        throw error;
      }));
  }
  //actualizar cliente
  actualizarCamionero(id: any, camionero: Camionero) {
    console.log("cliente a actualizar id", id, "cliente", camionero);
    const url = `${this.apiBaseUrl}/${id}`;
    return this.http.put(url, camionero);
  }


  //editar cliente
  editarCamionero(camionero: any): ComponentRef<VentanaEditarCamioneroComponent> {
    const positionStrategy = this.overlay
      .position()
      .global()
      .centerHorizontally()
      .top('10%');

    const overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: false,
    });
    const notificationPortal = new ComponentPortal(VentanaEditarCamioneroComponent);
    const componentRef = overlayRef.attach(notificationPortal);

    //se pasa el objeto camionero a la instancia del componente en este caso a vendedorAEditar
    componentRef.instance.camioneroAEditar = camionero;

    // Devuelve una referencia al componente para permitir el control de botones
    return componentRef;
  }



}
