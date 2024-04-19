import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { StatistiqueRepository } from '../../src/infrastructure/repository/statitstique.repository';

@Injectable()
export class StatistiqueUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private statistiqueRepository: StatistiqueRepository,
  ) {}

  async trace_date_action() {
    
  }
  async calculStatistique(): Promise<string[]> {
    const listeUtilisateursIds =
      await this.utilisateurRepository.listUtilisateurIds();

    const resultat: string[] = [];

    for (let index = 0; index < listeUtilisateursIds.length; index++) {
      const user = await this.utilisateurRepository.getById(
        listeUtilisateursIds[index],
      );
      const nombreDefisRealisesParUtilisateur =
        user.defi_history.getNombreDefisRealises();

      const nombreDefisAbandonnesParUtilisateur =
        user.defi_history.getNombreDefisAbandonnes();

      await this.statistiqueRepository.upsertStatistiquesDUnUtilisateur(
        user.id,
        nombreDefisRealisesParUtilisateur,
        nombreDefisAbandonnesParUtilisateur,
      );
      resultat.push(user.id);
    }

    return resultat;
  }
}
