import { Cliente } from "./cliente.models";
import { Factura } from "./factura.models";

export class facturaRendidaAVital  { 
  public Id ?: number; //pk

  public Carga?: number;

  public FacId?: number;//fk

  public CliId?: number;//fk

  public VenId?: number;
     
  public CamId?: number;

  public FechaAlt?: Date;

  public FechaAct?: Date;

  public Des?: string; 
  public Cli: Cliente = new Cliente();
  public Fac: Factura = new Factura(); 
    }
