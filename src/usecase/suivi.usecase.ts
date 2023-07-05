import { Injectable } from '@nestjs/common';
import { SuiviRepository } from '../infrastructure/repository/suivi.repository';
import { Suivi } from '../domain/suivi/suivi';
import { SuiviCollection } from '../../src/domain/suivi/suiviCollection';

@Injectable()
export class SuiviUsecase {
  constructor(private suiviRepository: SuiviRepository) {}

  async createSuivi(suivi: Suivi, utilisateurId: string): Promise<Suivi> {
    suivi.calculImpacts();
    const idSuivi = await this.suiviRepository.createSuivi(
      suivi,
      utilisateurId,
    );
    suivi['id'] = idSuivi;
    return suivi;
  }
  async listeSuivi(
    utilisateurId: string,
    type?: string,
  ): Promise<SuiviCollection> {
    return this.suiviRepository.listAllSuivi(utilisateurId, type);
  }
  async getLastSuivi(
    utilisateurId: string,
    type?: string,
  ): Promise<Suivi | null> {
    return this.suiviRepository.getLastSuivi(utilisateurId, type);
  }
  async buildSuiviDashboard(utilisateurId: string): Promise<any> {
    let suiviCollection = await this.suiviRepository.listAllSuivi(
      utilisateurId,
      undefined,
      20,
    );
    const lastSuivi = suiviCollection.getLastDayMergedSuivi();
    if (!lastSuivi) {
      return {};
    }
    return {
      date_dernier_suivi: lastSuivi.getDate(),
      impact_dernier_suivi: lastSuivi.getTotalImpact(),
    };
  }
}
