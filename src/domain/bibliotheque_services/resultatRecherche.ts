import { ResultatRecherche_v0 } from '../object_store/service/BibliothequeService_v0';

export class ResultatRecherche {
  id: string;
  titre: string;

  adresse_rue?: string;
  adresse_nom_ville?: string;
  adresse_code_postal?: string;

  site_web?: string;

  longitude?: number;
  latitude?: number;

  impact_carbone_kg?: number;

  type_plat?: string;
  difficulty_plat?: string;
  temps_prepa_min?: number;

  distance_metres?: number;

  est_favoris?: boolean;
  nombre_favoris?: number;

  constructor(res: ResultatRecherche_v0) {
    this.id = res.id;
    this.titre = res.titre;
    this.adresse_rue = res.adresse_rue;
    this.adresse_nom_ville = res.adresse_nom_ville;
    this.adresse_code_postal = res.adresse_code_postal;
    this.site_web = res.site_web;
    this.latitude = res.latitude;
    this.longitude = res.longitude;
    this.type_plat = res.type_plat;
    this.difficulty_plat = res.difficulty_plat;
    this.temps_prepa_min = res.temps_prepa_min;
    this.distance_metres = res.distance_metres;
    this.impact_carbone_kg = res.impact_carbone_kg;

    this.est_favoris = false;
    this.nombre_favoris = 0;
  }
}
