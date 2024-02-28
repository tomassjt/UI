import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PrincipalComponent } from './principal/principal.component';
import { FacturasComponent } from './facturas/facturas.component';
import { VendedoresComponent } from './vendedores/vendedores.component';
import { BalanceComponent } from './balance/balance.component';
import { ClientesComponent } from './clientes/clientes.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { PagoVitalComponent } from './pago-vital/pago-vital.component';
import { VentasComponent } from './ventas/ventas.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
 import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificacionComponent } from './utils/notificacion/notificacion.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { VentanaEditarClienteComponent } from './utils/ventana-editar-cliente/ventana-editar-cliente.component';
import { VentanaEditarVendedorComponent } from './utils/ventana-editar-vendedor/ventana-editar-vendedor.component';
import { CamionerosComponent } from './camioneros/camioneros.component';
import { VentanaEditarCamioneroComponent } from './utils/ventana-editar-camionero/ventana-editar-camionero.component';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { VentanaEditarNotaCreditoComponent } from './utils/ventana-editar-nota-credito/ventana-editar-nota-credito.component';
import { LoadingComponent } from './utils/loading/loading.component';
@NgModule({
  declarations: [
    AppComponent,
    PrincipalComponent,
    FacturasComponent,
    VendedoresComponent,
    BalanceComponent,
    ClientesComponent,
    SidenavComponent,
    PagoVitalComponent,
    VentasComponent,
    NotificacionComponent,
    VentanaEditarClienteComponent,
    VentanaEditarVendedorComponent,
    VentanaEditarCamioneroComponent,
    CamionerosComponent,
    VentanaEditarNotaCreditoComponent,
    LoadingComponent,
     
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
      FormsModule,
      MatButtonModule,
      NgIf,
      MatDialogModule,
    
 
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
