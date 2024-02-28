export class Factura {
  public id?: number;
  public Punto?: number ;
  public Numero?: number;
  public Cliente?: number;
  public Vendedor?: number;
  public cargaNumero?: number;
  public Camionero?: any;
  public Fecha?: String;
  public FechaEntrega?: String;
  public Tipo?: string;
  public Monto?: number;
  public MontoFlete?: any;
  public Pagado?: number;
  public Deuda?: number;
  public Favor?: number;
  public FechaDesde?: Date;
  public FechaHasta?: Date;
  public Estado?: String;
  public EstadoBool?: boolean = true;
  public PorcentajeAdmin?: number = 0;
  public PorcentajeVenvedor?: number = 0;
  public PorcentajeCamionero?: number = 0;
  public porcentajeFlete?: number = 0;
  public RendidaAVital?: number = 0;
}
 
 
