import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


//components
import { PrincipalComponent } from './principal/principal.component';
import { BalanceComponent } from './balance/balance.component';
import { ClientesComponent } from './clientes/clientes.component';
import { FacturasComponent } from './facturas/facturas.component';
import { VendedoresComponent } from './vendedores/vendedores.component';
import { PagoVitalComponent } from './pago-vital/pago-vital.component';
import { VentasComponent } from './ventas/ventas.component';
import { CamionerosComponent } from './camioneros/camioneros.component';

const routes: Routes = [
  { path: '', component: PrincipalComponent },
  { path: 'pago-vital', component: PagoVitalComponent },
  { path: 'principal', component: BalanceComponent },
  { path: 'facturas', component: FacturasComponent },
  { path: 'clientes', component: ClientesComponent },
  { path: 'ventas', component: VentasComponent },
  { path: 'vendedores', component: VendedoresComponent },
  { path: 'camioneros', component: CamionerosComponent },
  { path: 'balance', component: BalanceComponent },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
