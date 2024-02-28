
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
 

@Injectable({
  providedIn: 'root'
})
export class VendedoresService {
  private apiUrl = 'https://localhost:44313';
  private apiBaseUrl = 'http://tomasstome-001-site1.itempurl.com/api/Vendedores/'; // Cambia la URL de acuerdo a tu configuración

  constructor(private http: HttpClient, private overlay: Overlay) { }

  getVendedores(): Observable<Vendedor[]> {
    const endpoint = `http://tomasstome-001-site1.itempurl.com/api/Vendedores`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://localhost:44313' // Cambia la URL según corresponda
      })
    };

    return this.http.get<any[]>(endpoint).pipe(

      map(vendedoresresp => {
        console.log("VENDEDORESSS", vendedoresresp)
        let vendedoresRet: any[] = new Array();
        vendedoresresp.forEach(vendedorResp => {
          let vendedor: Vendedor = new Vendedor();
          vendedor.id = vendedorResp.id;
          vendedor.Direccion = vendedorResp.direccion;
          vendedor.nombre = vendedorResp.nombre; 
          vendedor.Flete = vendedorResp.flete;
          vendedor.Mail = vendedorResp.mail;
          vendedor.Saldo = vendedorResp.Saldo;
          vendedor.PorcentajeFlete = vendedorResp.porcentajeFlete;
          vendedoresRet.push(vendedor);
        });
        return vendedoresRet;
      })
    );

  }

  //agregar vendedor
  postClientes(vendedor: Vendedor): Observable<any> {
    console.log("entro a hacer el post");
     

    return this.http.post<any>(this.apiBaseUrl, vendedor)
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


  //eliminar vendedor
  deleteVendedor(id: number): Observable<any> {
    const endpoint = `${this.apiBaseUrl}${id}`;

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

  //buscar vendedor
  getVendedor(id: number): Observable<Vendedor> {
    const endpoint = `${this.apiBaseUrl}${id}`;
    return this.http.get<any>(endpoint).pipe(
      catchError(error => {
        console.log("hubo un error al intentar obtener el vendedor");
        throw error;
      }));
  }

  //editar cliente
  editarVendedorVentana(vendedor: Vendedor): ComponentRef<VentanaEditarVendedorComponent> {
    const positionStrategy = this.overlay
      .position()
      .global()
      .centerHorizontally()
      .top('10%');

    const overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: false,
    });
    const notificationPortal = new ComponentPortal(VentanaEditarVendedorComponent);
    const componentRef = overlayRef.attach(notificationPortal);

    componentRef.instance.VendedorAEditar = vendedor;

    // Devuelve una referencia al componente para permitir el control de botones
    return componentRef;
  }

  //actualizar cliente
  actualizarVendedor(id: number, cliente: any) {
    console.log("cliente a actualizar id", id, "cliente", cliente)
    const url = `${this.apiBaseUrl}${id}`;
    return this.http.put(url, cliente);
  }

  //obtener cantidad total de vendedores
  cantidadTotalVendedores(): Observable<number> {
    const endpoint = `${this.apiBaseUrl}cantidadTotalVendedores`;
    return this.http.get<any>(endpoint).pipe(
      catchError(error => {
        console.log("hubo un error al intentar obtener vendedores");
        throw error;
      }));
  }


}
