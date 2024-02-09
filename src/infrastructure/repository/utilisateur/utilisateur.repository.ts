import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Utilisateur as UtilisateurDB, Prisma } from '@prisma/client';
import { Utilisateur } from '../../../domain/utilisateur/utilisateur';
import { UserQuizzProfile } from '../../../domain/quizz/userQuizzProfile';
import { Profile } from '../../../domain/utilisateur/profile';
import {
  Impact,
  Onboarding,
  Thematique,
} from '../../../domain/utilisateur/onboarding/onboarding';
import { OnboardingResult } from '../../../domain/utilisateur/onboarding/onboardingResult';
import { ApplicationError } from '../../../../src/infrastructure/applicationError';
import { Gamification } from '../../../domain/gamification/gamification';
import { ParcoursTodo } from '../../../../src/domain/todo/parcoursTodo';
import { UnlockedFeatures } from '../../../../src/domain/gamification/unlockedFeatures';
import { History } from '../../../../src/domain/history/history';
import { Serialised_UnlockedFeatures } from '../../../../src/infrastructure/object_store/catalogue/serialisable_UnlockedFeatures';

@Injectable()
export class UtilisateurRepository {
  constructor(private prisma: PrismaService) {}

  async delete(utilisateurId: string) {
    await this.prisma.utilisateur.delete({ where: { id: utilisateurId } });
  }

  async findUtilisateurById(id: string): Promise<Utilisateur | null> {
    const user = await this.prisma.utilisateur.findUnique({
      where: {
        id,
      },
    });
    return this.buildUtilisateurFromDB(user);
  }
  async findUtilisateurByEmail(email: string): Promise<Utilisateur | null> {
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
    let dataToUpdate = {
      ...utilisateur,
      onboardingData: utilisateur.onboardingData as any,
      onboardingResult: utilisateur.onboardingResult as any,
      todo: utilisateur.parcours_todo as any,
      quizzLevels: utilisateur.quizzProfile.getData() as any,
      gamification: utilisateur.gamification as any,
      unlocked_features: utilisateur.unlocked_features as any,
      history: utilisateur.history as any,
    };
    delete dataToUpdate.quizzProfile;
    delete dataToUpdate.parcours_todo;
    return this.prisma.utilisateur.update({
      where: { id: utilisateur.id },
      data: { ...dataToUpdate },
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

  async createUtilisateur(
    utilisateur: Utilisateur,
  ): Promise<Utilisateur | null> {
    try {
      const user = await this.prisma.utilisateur.create({
        data: {
          id: uuidv4(),
          nom: utilisateur.nom,
          prenom: utilisateur.prenom,
          passwordHash: utilisateur.passwordHash,
          passwordSalt: utilisateur.passwordSalt,
          code_postal: utilisateur.code_postal,
          revenu_fiscal: utilisateur.revenu_fiscal,
          parts: utilisateur.parts,
          abonnement_ter_loire: utilisateur.abonnement_ter_loire,
          prm: utilisateur.prm,
          code_departement: utilisateur.code_departement,
          commune: utilisateur.commune,
          email: utilisateur.email,
          code: utilisateur.code,
          code_generation_time: utilisateur.code_generation_time,
          active_account: utilisateur.active_account,
          failed_checkcode_count: utilisateur.failed_checkcode_count,
          prevent_checkcode_before: utilisateur.prevent_checkcode_before,
          sent_email_count: utilisateur.sent_email_count,
          prevent_sendemail_before: utilisateur.prevent_sendemail_before,
          onboardingData: { ...utilisateur.onboardingData },
          onboardingResult: { ...utilisateur.onboardingResult },
          quizzLevels: utilisateur.quizzProfile.getData(),
          todo: utilisateur.parcours_todo as any,
          gamification: utilisateur.gamification as any,
          unlocked_features: utilisateur.unlocked_features as any,
          history: utilisateur.history as any,
          version: utilisateur.version,
        },
      });
      return this.buildUtilisateurFromDB(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          ApplicationError.throwEmailAlreadyExistError(utilisateur.email);
        }
      }
    }
  }

  async updateQuizzProfile(
    utilisateurId: string,
    quizzProfile: UserQuizzProfile,
  ) {
    await this.prisma.utilisateur.update({
      where: {
        id: utilisateurId,
      },
      data: {
        quizzLevels: quizzProfile.getData(),
      },
    });
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
    targetThematique: Thematique,
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
    targetThematiques: Thematique[],
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

  private async buildUtilisateurFromDB(
    user: UtilisateurDB,
  ): Promise<Utilisateur> {
    if (user) {
      const onboardingData = new Onboarding(user.onboardingData as any);
      const onboardingResult = new OnboardingResult();
      onboardingResult.setOnboardingResultData(user.onboardingResult as any);

      const unlocked_features = await Serialised_UnlockedFeatures.deSerialise(
        user.unlocked_features as any,
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
        onboardingData: onboardingData,
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
        quizzProfile: new UserQuizzProfile(user.quizzLevels as any),
        created_at: user.created_at,
        updated_at: user.updated_at,
        parcours_todo: new ParcoursTodo(user.todo as any),
        gamification: new Gamification(user.gamification as any),
        history: new History(user.history as any),
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
}
