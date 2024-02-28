import { ComponentRef, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Cliente } from '../Models/cliente.models';
import { catchError, map, Observable, tap } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { VentanaEditarClienteComponent } from '../utils/ventana-editar-cliente/ventana-editar-cliente.component';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
 
 

@Injectable({
  providedIn: 'root'
})


export class ClientesServiceService {
  private apiUrl = 'https://localhost:44313';
  private apiBaseUrl = 'http://tomasstome-001-site1.itempurl.com/api/Clientes1/'; // Cambia la URL de acuerdo a tu configuración

  constructor(private http: HttpClient, private overlay: Overlay) { }

  getClientes(): Observable<Cliente[]> {
    const endpoint = `http://tomasstome-001-site1.itempurl.com/api/Clientes1/`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://localhost:44313' // Cambia la URL según corresponda
      })
    };

    return this.http.get<any[]>(endpoint).pipe(
     
      map(clientesresp => {
        let clientesRet: any[] = new Array();
        clientesresp.forEach(clienteResp => {
          let cliente: Cliente = new Cliente();
          cliente.id = clienteResp.id;
          cliente.Direccion = clienteResp.direccion;
          cliente.nombre = clienteResp.nombre;
          cliente.Ciudad = clienteResp.ciudad;
          cliente.Cuit = clienteResp.cuit;
          cliente.Provincia = clienteResp.provincia;
          cliente.Flete = clienteResp.flete;
          cliente.Mail = clienteResp.mail;
          cliente.Idvendedor = clienteResp.Idvendedor;
          cliente.NumeroDeCliente = clienteResp.numeroDeCliente;
          
          cliente.Saldo = clienteResp.Saldo;
          cliente.Deuda = clienteResp.Deuda;
          clientesRet.push(cliente);           
          //nuevos campos en bd
          cliente.camioneroid = clienteResp.camioneroid;
          cliente.vendedorid = clienteResp.vendedorid;
          cliente.PorcCamionero = clienteResp.porccamionero;
          cliente.PorcVendedor = clienteResp.porcvendedor;
        });
        return clientesRet;
      })
    );

  }

  //agregar cliente
  postClientes(cliente: Cliente): Observable<any> {
    console.log("entro a hacer el post");
    const endpoint = `http://tomasstome-001-site1.itempurl.com/api/Clientes1`;

    return this.http.post<any>(endpoint, cliente)
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

 
  //eliminar cliente
  deleteCliente(id: number): Observable<any> {
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

  //buscar cliente
  getCliente(id: number): Observable<Cliente> {
    console.log("buscando cliente")
    const endpoint = `${this.apiBaseUrl}${id}`;
    return this.http.get<any>(endpoint).pipe(
      catchError(error => {
        console.log("hubo un error al intentar obtener el cliente");
        throw error;
      }));
  }

  //editar cliente
  editarClienteVentana(cliente: Cliente): ComponentRef<VentanaEditarClienteComponent> {
    const positionStrategy = this.overlay
      .position()
      .global()
      .centerHorizontally()
      .top('10%');

    const overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: false,
    });
    const notificationPortal = new ComponentPortal(VentanaEditarClienteComponent);
    const componentRef = overlayRef.attach(notificationPortal);

    componentRef.instance.clienteAEditar = cliente;

    // Devuelve una referencia al componente para permitir el control de botones
    return componentRef;
  }

  //actualizar cliente
  actualizarCliente(id: number, cliente: any) {
    console.log("cliente a actualizar id", id, "cliente", cliente)
    const url = `${this.apiBaseUrl}${id}`;
    return this.http.put(url,cliente);
  }
  //obtener la cantidad total de clientes
  cantidadTotalClientes():  Observable<number> {
     
    const url = `${this.apiBaseUrl}cantidadTotalClientes`;
   
    var cantidad = this.http.get<number>(url);
     
    return cantidad;
  }
  



}






 
