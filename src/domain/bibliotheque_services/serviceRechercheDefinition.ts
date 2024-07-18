import { ServiceRechercheID } from './serviceRechercheID';

export class ServiceRechercheDefinition {
  id: ServiceRechercheID;
  titre: string;
  sous_titre: string;
  icon_url: string;
  univers: string;
  external_url?: string;

  constructor(serviceDef?: ServiceRechercheDefinition) {
    Object.assign(this, serviceDef);
  }
}