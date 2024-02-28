import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentanaEditarVendedorComponent } from './ventana-editar-vendedor.component';

describe('VentanaEditarVendedorComponent', () => {
  let component: VentanaEditarVendedorComponent;
  let fixture: ComponentFixture<VentanaEditarVendedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VentanaEditarVendedorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VentanaEditarVendedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
