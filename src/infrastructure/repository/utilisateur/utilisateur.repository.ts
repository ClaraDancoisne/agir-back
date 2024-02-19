import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Utilisateur as UtilisateurDB, Prisma } from '@prisma/client';
import { Utilisateur } from '../../../domain/utilisateur/utilisateur';
import { Profile } from '../../../domain/utilisateur/profile';
import {
  Impact,
  Onboarding,
  ThematiqueOnboarding,
} from '../../../domain/utilisateur/onboarding/onboarding';
import { OnboardingResult } from '../../../domain/utilisateur/onboarding/onboardingResult';
import { ApplicationError } from '../../../../src/infrastructure/applicationError';
import { Gamification } from '../../../domain/gamification/gamification';
import { History } from '../../../../src/domain/history/history';
import { UnlockedFeatures } from '../../../../src/domain/gamification/unlockedFeatures';
import {
  SerialisableDomain,
  Upgrader,
} from '../../../domain/object_store/upgrader';
import { ParcoursTodo } from '../../../../src/domain/todo/parcoursTodo';
import { KYC } from '../../../../src/domain/kyc/collectionQuestionsKYC';

@Injectable()
export class UtilisateurRepository {
  constructor(private prisma: PrismaService) {}

  async delete(utilisateurId: string) {
    await this.prisma.utilisateur.delete({ where: { id: utilisateurId } });
  }

  async getById(id: string): Promise<Utilisateur | null> {
    const user = await this.prisma.utilisateur.findUnique({
      where: {
        id,
      },
    });
    return this.buildUtilisateurFromDB(user);
  }
  async findByEmail(email: string): Promise<Utilisateur | null> {
    const user = await this.prisma.utilisateur.findUnique({
      where: {
        email,
      },
    });
    return this.buildUtilisateurFromDB(user);
  }

  async updateProfile(utilisateurId: string, profile: Profile) {
    return this.prisma.utilisateur.update({
      where: {
        id: utilisateurId,
      },
      data: {
        nom: profile.nom,
        prenom: profile.prenom,
        email: profile.email,
        code_postal: profile.code_postal,
        commune: profile.commune,
        revenu_fiscal: profile.revenu_fiscal,
        parts: profile.parts,
        abonnement_ter_loire: profile.abonnement_ter_loire,
        passwordHash: profile.passwordHash,
        passwordSalt: profile.passwordSalt,
      },
    });
  }

  async updateVersion(utilisateurId: string, version: number): Promise<any> {
    return this.prisma.utilisateur.update({
      where: { id: utilisateurId },
      data: { version: version },
    });
  }

  async lockUserMigration(): Promise<any> {
    return this.prisma.utilisateur.updateMany({
      data: { migration_enabled: false },
    });
  }
  async unlockUserMigration(): Promise<any> {
    return this.prisma.utilisateur.updateMany({
      data: { migration_enabled: true },
    });
  }

  async activateAccount(utilisateurId: string): Promise<any> {
    return this.prisma.utilisateur.update({
      where: { id: utilisateurId },
      data: {
        active_account: true,
      },
    });
  }
  async updateCode(
    utilisateurId: string,
    code: string,
    code_generation_time: Date,
  ): Promise<any> {
    return this.prisma.utilisateur.update({
      where: { id: utilisateurId },
      data: {
        code: code,
        code_generation_time: code_generation_time,
      },
    });
  }
  async updateUtilisateur(utilisateur: Utilisateur): Promise<any> {
    return this.prisma.utilisateur.update({
      where: { id: utilisateur.id },
      data: this.buildDBFromUtilisateur(utilisateur),
    });
  }

  async listUtilisateurIds(): Promise<string[]> {
    const result = await this.prisma.utilisateur.findMany({
      select: {
        id: true,
      },
    });
    return result.map((elem) => elem['id']);
  }

  async createUtilisateur(utilisateur: Utilisateur) {
    try {
      await this.prisma.utilisateur.create({
        data: this.buildDBFromUtilisateur(utilisateur),
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          ApplicationError.throwEmailAlreadyExistError(utilisateur.email);
        }
      }
      throw error;
    }
  }

  async countUsersWithAtLeastNThematiquesOfImpactGreaterThan(
    minImpact: Impact,
    nombreThematiques: number,
  ): Promise<number> {
    let query = `
    SELECT count(1)
    FROM "Utilisateur"
    WHERE ( 0 + `;
    for (
      let impact: number = minImpact;
      impact <= Impact.tres_eleve;
      impact++
    ) {
      query = query.concat(
        `+ JSONB_ARRAY_LENGTH("onboardingResult" -> 'ventilation_par_impacts' -> '${impact}') `,
      );
    }
    query = query.concat(`) >= ${nombreThematiques}`);
    let result = await this.prisma.$queryRawUnsafe(query);
    return Number(result[0].count);
  }

  async countUsersWithLessImpactOnThematique(
    maxImpact: Impact,
    targetThematique: ThematiqueOnboarding,
  ): Promise<number> {
    let query = `
    SELECT count(1)
    FROM "Utilisateur"
    WHERE CAST("onboardingResult" -> 'ventilation_par_thematiques' -> '${targetThematique}' AS INTEGER) < ${maxImpact}`;
    let result = await this.prisma.$queryRawUnsafe(query);
    return Number(result[0].count);
  }

  async countUsersWithMoreImpactOnThematiques(
    minImpacts: Impact[],
    targetThematiques: ThematiqueOnboarding[],
  ): Promise<number> {
    let query = `
    SELECT count(1)
    FROM "Utilisateur"
    WHERE 1=1 `;
    for (let index = 0; index < minImpacts.length; index++) {
      query = query.concat(
        ` AND CAST("onboardingResult" -> 'ventilation_par_thematiques' -> '${targetThematiques[index]}' AS INTEGER) > ${minImpacts[index]} `,
      );
    }
    let result = await this.prisma.$queryRawUnsafe(query);
    return Number(result[0].count);
  }

  async nombreTotalUtilisateurs(): Promise<number> {
    const count = await this.prisma.utilisateur.count();
    return Number(count);
  }

  private buildUtilisateurFromDB(user: UtilisateurDB): Utilisateur {
    if (user) {
      const unlocked_features = new UnlockedFeatures(
        Upgrader.upgradeRaw(
          user.unlocked_features,
          SerialisableDomain.UnlockedFeatures,
        ),
      );
      const parcours_todo = new ParcoursTodo(
        Upgrader.upgradeRaw(user.todo, SerialisableDomain.ParcoursTodo),
      );
      const history = new History(
        Upgrader.upgradeRaw(user.history, SerialisableDomain.History),
      );
      const gamification = new Gamification(
        Upgrader.upgradeRaw(user.gamification, SerialisableDomain.Gamification),
      );
      const onboarding = new Onboarding(
        Upgrader.upgradeRaw(user.onboardingData, SerialisableDomain.Onboarding),
      );
      const onboardingResult = new OnboardingResult(
        Upgrader.upgradeRaw(
          user.onboardingResult,
          SerialisableDomain.OnboardingResult,
        ),
      );
      const kyc = new KYC(
        Upgrader.upgradeRaw(user.kyc, SerialisableDomain.KYC),
      );

      return new Utilisateur({
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        code_postal: user.code_postal,
        commune: user.commune,
        revenu_fiscal: user.revenu_fiscal,
        parts: user.parts ? user.parts.toNumber() : null,
        abonnement_ter_loire: user.abonnement_ter_loire,
        passwordHash: user.passwordHash,
        passwordSalt: user.passwordSalt,
        onboardingData: onboarding,
        onboardingResult: onboardingResult,
        failed_login_count: user.failed_login_count,
        prevent_login_before: user.prevent_login_before,
        code: user.code,
        code_generation_time: user.code_generation_time,
        prevent_checkcode_before: user.prevent_checkcode_before,
        failed_checkcode_count: user.failed_checkcode_count,
        active_account: user.active_account,
        sent_email_count: user.sent_email_count,
        prevent_sendemail_before: user.prevent_sendemail_before,
        created_at: user.created_at,
        updated_at: user.updated_at,
        parcours_todo: parcours_todo,
        gamification: gamification,
        history: history,
        kyc: kyc,
        prm: user.prm,
        code_departement: user.code_departement,
        unlocked_features: unlocked_features,
        version: user.version,
        migration_enabled: user.migration_enabled,
        version_ponderation: user.version_ponderation,
      });
    }
    return null;
  }
  private buildDBFromUtilisateur(user: Utilisateur): UtilisateurDB {
    return {
      id: user.id ? user.id : uuidv4(),
      nom: user.nom,
      prenom: user.prenom,
      passwordHash: user.passwordHash,
      passwordSalt: user.passwordSalt,
      code_postal: user.code_postal,
      revenu_fiscal: user.revenu_fiscal,
      parts: user.parts ? new Prisma.Decimal(user.parts) : null,
      abonnement_ter_loire: user.abonnement_ter_loire,
      prm: user.prm,
      code_departement: user.code_departement,
      commune: user.commune,
      email: user.email,
      code: user.code,
      code_generation_time: user.code_generation_time,
      active_account: user.active_account,
      failed_checkcode_count: user.failed_checkcode_count,
      prevent_checkcode_before: user.prevent_checkcode_before,
      sent_email_count: user.sent_email_count,
      prevent_sendemail_before: user.prevent_sendemail_before,
      onboardingData: Upgrader.serialiseToLastVersion(
        user.onboardingData,
        SerialisableDomain.Onboarding,
      ),
      onboardingResult: Upgrader.serialiseToLastVersion(
        user.onboardingResult,
        SerialisableDomain.OnboardingResult,
      ),
      todo: Upgrader.serialiseToLastVersion(
        user.parcours_todo,
        SerialisableDomain.ParcoursTodo,
      ),
      gamification: Upgrader.serialiseToLastVersion(
        user.gamification,
        SerialisableDomain.Gamification,
      ),
      unlocked_features: Upgrader.serialiseToLastVersion(
        user.unlocked_features,
        SerialisableDomain.UnlockedFeatures,
      ),
      history: Upgrader.serialiseToLastVersion(
        user.history,
        SerialisableDomain.History,
      ),
      kyc: Upgrader.serialiseToLastVersion(user.kyc, SerialisableDomain.KYC),
      version: user.version,
      failed_login_count: user.failed_login_count,
      prevent_login_before: user.prevent_login_before,
      migration_enabled: user.migration_enabled,
      version_ponderation: user.version_ponderation,
      created_at: undefined,
      updated_at: undefined,
    };
  }
}
