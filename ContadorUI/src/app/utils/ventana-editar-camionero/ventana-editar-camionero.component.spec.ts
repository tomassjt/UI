import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentanaEditarClienteComponent } from './ventana-editar-cliente.component';

describe('VentanaEditarClienteComponent', () => {
  let component: VentanaEditarClienteComponent;
  let fixture: ComponentFixture<VentanaEditarClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VentanaEditarClienteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VentanaEditarClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
