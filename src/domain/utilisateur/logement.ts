import { Logement_v0 } from '../object_store/logement/logement_v0';
import { Onboarding } from './onboarding/onboarding';

export enum TypeLogement {
  maison = 'maison',
  appartement = 'appartement',
}

export enum Superficie {
  superficie_35 = 'superficie_35',
  superficie_70 = 'superficie_70',
  superficie_100 = 'superficie_100',
  superficie_150 = 'superficie_150',
  superficie_150_et_plus = 'superficie_150_et_plus',
}
export enum Chauffage {
  electricite = 'electricite',
  bois = 'bois',
  fioul = 'fioul',
  gaz = 'gaz',
  autre = 'autre',
}
export enum DPE {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
  ne_sais_pas = 'ne_sais_pas',
}

export class Logement {
  nombre_adultes: number;
  nombre_enfants: number;
  code_postal: string;
  commune: string;
  type: TypeLogement;
  superficie: Superficie;
  proprietaire: boolean;
  chauffage: Chauffage;
  plus_de_15_ans: boolean;
  dpe: DPE;

  constructor(log?: Logement_v0) {
    if (!log) return;
    this.nombre_adultes = log.nombre_adultes;
    this.nombre_enfants = log.nombre_enfants;
    this.code_postal = log.code_postal;
    this.commune = log.commune;
    this.type = log.type;
    this.superficie = log.superficie;
    this.proprietaire = log.proprietaire;
    this.chauffage = log.chauffage;
    this.plus_de_15_ans = log.plus_de_15_ans;
    this.dpe = log.dpe;
  }

  patch?(input: Logement) {
    this.nombre_adultes = this.AorB(input.nombre_adultes, this.nombre_adultes);
    this.nombre_enfants = this.AorB(input.nombre_enfants, this.nombre_enfants);
    this.code_postal = this.AorB(input.code_postal, this.code_postal);
    this.commune = this.AorB(input.commune, this.commune);
    this.type = this.AorB(input.type, this.type);
    this.superficie = this.AorB(input.superficie, this.superficie);
    this.proprietaire = this.AorB(input.proprietaire, this.proprietaire);
    this.chauffage = this.AorB(input.chauffage, this.chauffage);
    this.plus_de_15_ans = this.AorB(input.plus_de_15_ans, this.plus_de_15_ans);
    this.dpe = this.AorB(input.dpe, this.dpe);
  }

  public static buildFromOnboarding(data: Onboarding): Logement {
    return new Logement({
      version: 0,
      dpe: null,
      plus_de_15_ans: null,
      chauffage: data.chauffage,
      code_postal: data.code_postal,
      commune: data.commune,
      nombre_adultes: data.adultes,
      nombre_enfants: data.enfants,
      proprietaire: data.proprietaire,
      superficie: data.superficie,
      type: data.residence,
    });
  }

  private AorB?<T>(a: T, b: T): T {
    if (a === undefined) return b;
    return a;
  }
}
