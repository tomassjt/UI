import { Injectable, ComponentRef } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { NotificacionComponent } from '../utils/notificacion/notificacion.component';
import { ComponentPortal } from '@angular/cdk/portal';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private notificationResponse$ = new Subject<boolean>();
  constructor(private overlay: Overlay) { }

  // Mostrar notificación
  showNotification(titulo: string | undefined, message: string, botonPdf: boolean | undefined): ComponentRef<NotificacionComponent> {
    const positionStrategy = this.overlay
      .position()
      .global()
      .centerHorizontally()
      .top('10%');

    const overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: false,
    });
    const notificationPortal = new ComponentPortal(NotificacionComponent);
    const componentRef = overlayRef.attach(notificationPortal);
    componentRef.instance.titulo = titulo;
    componentRef.instance.message = message;
    componentRef.instance.botonPdf = botonPdf;
    // Devuelve una referencia al componente para permitir el control de botones
    return componentRef;
  }

  // Método para obtener el Observable del estado de aceptación/cancelación
  getNotificationResponse$() {
    return this.notificationResponse$.asObservable();
  }

  // Método para notificar el estado desde el componente de notificación
  notifyResponse(response: boolean) {
    this.notificationResponse$.next(response);
  }




}
