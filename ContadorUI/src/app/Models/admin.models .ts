export class Admin {
  public id?: number;
  public nombre?: string ;
  public Dni?: string;
  public Direccion?: string;
  public Correo?: string;
  public Saldo?: string;
  public PorcentajeFlete?: number ;
  public GananciaFletes: number =0;
  public GananciaVentas: number=0;

  Admin()
  {
    this.GananciaVentas = 0;
    this.GananciaFletes = 0;
  }
}
 
 
