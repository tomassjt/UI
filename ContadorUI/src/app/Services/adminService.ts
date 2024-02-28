
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
import { Admin } from '../Models/admin.models ';
 

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'https://localhost:44313';
  private apiBaseUrl = 'http://tomasstome-001-site1.itempurl.com/api/Admins/'; // Cambia la URL de acuerdo a tu configuración

  constructor(private http: HttpClient, private overlay: Overlay) { }

  getAdmins(): Observable<Admin[]> {
    const endpoint = `http://tomasstome-001-site1.itempurl.com/api/Admins`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://localhost:44313' // Cambia la URL según corresponda
      })
    };

    return this.http.get<any[]>(endpoint).pipe(

      map(admins => {
        console.log("admins", admins)
        let aadmins: any[] = new Array();
        admins.forEach(admin => {
          let ad: Admin = new Admin();
          ad = admin; 
          aadmins.push(admin);
        });
        return aadmins;
      })
    );

  }

  //registrar un pago a vital
  registrarPagoVital(formulario: any): Promise<boolean> {
    return new Promise<any>((resolve, reject) => {
      try {
        resolve(true)
      }
      catch {
        reject(false);
      }
    }

    )
  };
  


  //agregar Admin
  postAdmins(admin: Admin): Observable<any> {
    console.log("entro a hacer el post");
     

    return this.http.post<any>(this.apiBaseUrl, admin)
      .pipe(
        tap(response => {
         
          console.log("BAAAAACK", response);
          
          
        }),
        catchError(error => {
          console.error("Error en la solicitud POST:", error);
          throw error; // Propaga el error para manejo adicional si es necesario
        })
      );
  }


  //eliminar vendedor
  deleteAdmin(id: number): Observable<any> {
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
  getAdmin(id: number): Observable<any> {
    const endpoint = `${this.apiBaseUrl}${id}`;
    let admin: Admin = new Admin();
    let adminRet: any = new Object;

    return this.http.get<any>(endpoint);

    //  .pipe(
    //    (adminresp) => {
    //      console.log("respuesta back ", adminresp);
    //      admin.id = adminresp.Id;
    //      admin.Correo = adminresp.correo;
    //      admin.Direccion = adminresp.direccion;
    //      admin.Dni = adminresp.dni;
    //      admin.nombre = adminresp.nombre;
    //      admin.PorcentajeFlete = adminresp.porcentajeFlete;
    //      adminRet = admin;
    //      console.log("respuesta service", adminRet);
    //    });
    //return adminRet;
        
   

   
   

  }

  //editar cliente
  editarAdmin(admin: Admin): ComponentRef<VentanaEditarVendedorComponent> {
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

    componentRef.instance.VendedorAEditar = admin;

    // Devuelve una referencia al componente para permitir el control de botones
    return componentRef;
  }

  //actualizar cliente
  actualizarAdmin(id: number, admin: any) {
    console.log("Admin a actualizar id", id, "cliente", admin)
    const url = `${this.apiBaseUrl}${id}`;
    return this.http.put(url, admin);
  }

  //obtener cantidad total de Admins
  cantidadTotalAdmin(): Observable<number> {
    const endpoint = `${this.apiBaseUrl}cantidadTotalAdmins`;
    return this.http.get<any>(endpoint).pipe(
      catchError(error => {
        console.log("hubo un error al intentar obtener Admins");
        throw error;
      }));
  }


}
