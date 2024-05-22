import { ContentType } from '../contenu/contentType';
import { MissionsUtilisateur_v0 } from '../object_store/mission/MissionsUtilisateur_v0';
import { ThematiqueUnivers } from '../univers/thematiqueUnivers';
import { Utilisateur } from '../utilisateur/utilisateur';
import { Mission, Objectif } from './mission';

export class MissionsUtilisateur {
  missions: Mission[];

  constructor(data?: MissionsUtilisateur_v0) {
    this.missions = [];
    if (data && data.missions) {
      data.missions.forEach((m) => {
        this.missions.push(new Mission(m));
      });
    }
  }

  public getMissionByThematiqueUnivers(them: ThematiqueUnivers): Mission {
    return this.missions.find((m) => m.thematique_univers === them);
  }
  public getMissionById(missionId: string): Mission {
    return this.missions.find((m) => m.id === missionId);
  }

  public validateContentDone(
    content_id: string,
    type: ContentType,
    utilisateur: Utilisateur,
  ) {
    const { mission, objectif } = this.getObjectifByContentId(content_id, type);

    if (objectif && !objectif.isDone()) {
      objectif.done_at = new Date();
      utilisateur.gamification.ajoutePoints(objectif.points);
      mission.unlockDefiIfAllContentDone();
    }
  }

  public getObjectifByContentId(
    content_id: string,
    type: ContentType,
  ): { mission: Mission; objectif: Objectif } {
    for (let index = 0; index < this.missions.length; index++) {
      const mission = this.missions[index];

      const objectif = mission.objectifs.find(
        (o) => o.content_id === content_id && o.type === type,
      );
      if (objectif) return { mission: mission, objectif: objectif };
    }
    return { mission: null, objectif: null };
  }

  public answerKyc(kycID: string, utilisateur: Utilisateur) {
    this.missions.forEach((mission) => {
      mission.answerKyc(kycID, utilisateur);
    });
  }
}