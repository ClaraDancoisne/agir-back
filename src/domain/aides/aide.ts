import { Thematique } from '../contenu/thematique';

export class Aide {
  constructor(data: Aide) {
    Object.assign(this, data);
  }
  content_id: string;
  titre: string;
  contenu: string;
  url_simulateur: string;
  is_simulateur: boolean;
  codes_postaux: string[];
  thematiques: Thematique[];
  montant_max: number;
}
