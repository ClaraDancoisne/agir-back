import { Thematique } from '../thematique';

export type Quizz = {
  content_id: string;
  titre: string;
  soustitre?: string;
  source?: string;
  image_url: string;
  partenaire?: string;
  rubrique_ids: string[];
  rubrique_labels: string[];
  codes_postaux: string[];
  duree?: string;
  frequence?: string;
  difficulty: number;
  points: number;
  thematique_principale: Thematique;
  thematiques: Thematique[];
};
