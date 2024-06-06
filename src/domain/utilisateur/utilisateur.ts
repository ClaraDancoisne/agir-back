import { CodeManager } from './manager/codeManager';
import { Onboarding } from '../onboarding/onboarding';
import { OnboardingResult } from '../onboarding/onboardingResult';
import { PasswordManager } from './manager/passwordManager';
import { ApplicationError } from '../../../src/infrastructure/applicationError';
import { Gamification } from '../gamification/gamification';
import { ParcoursTodo } from '../todo/parcoursTodo';
import { UnlockedFeatures } from '../gamification/unlockedFeatures';
import { History } from '../history/history';
import { KYCHistory } from '../kyc/kycHistory';
import { Equipements } from '../equipements/equipements';
import { Logement } from '../logement/logement';
import { App } from '../app';
import { TagPonderationSet } from '../scoring/tagPonderationSet';
import { Transport } from '../transport/transport';
import { Tag } from '../scoring/tag';
import { DefiHistory } from '../defis/defiHistory';
import { UserTagEvaluator } from '../scoring/userTagEvaluator';
import { QuestionKYC } from '../kyc/questionQYC';
import { MissionsUtilisateur } from '../mission/missionsUtilisateur';

export class UtilisateurData {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  onboardingData: Onboarding;
  onboardingResult: OnboardingResult;
  revenu_fiscal: number;
  parts: number;
  abonnement_ter_loire: boolean;
  code_departement: string;
  created_at: Date;
  updated_at?: Date;
  passwordHash: string;
  passwordSalt: string;
  failed_login_count: number;
  prevent_login_before: Date;
  code: string;
  code_generation_time: Date;
  active_account: boolean;
  failed_checkcode_count: number;
  prevent_checkcode_before: Date;
  sent_email_count: number;
  prevent_sendemail_before: Date;
  parcours_todo: ParcoursTodo;
  gamification: Gamification;
  missions: MissionsUtilisateur;
  history: History;
  equipements: Equipements;
  unlocked_features: UnlockedFeatures;
  version: number;
  migration_enabled: boolean;
  kyc_history: KYCHistory;
  logement: Logement;
  transport: Transport;
  tag_ponderation_set: TagPonderationSet;
  defi_history: DefiHistory;
  force_connexion: boolean;
  derniere_activite: Date;
}

export class Utilisateur extends UtilisateurData {
  constructor(data?: UtilisateurData) {
    super();
    if (data) {
      Object.assign(this, data);
    }
    if (!this.failed_login_count) this.failed_login_count = 0;
    if (!this.prevent_login_before) this.prevent_login_before = new Date();
    if (!this.sent_email_count) this.sent_email_count = 0;
    if (this.active_account === undefined) this.active_account = false;
    if (!this.failed_checkcode_count) this.failed_checkcode_count = 0;
    if (!this.prevent_checkcode_before)
      this.prevent_checkcode_before = new Date();
    if (!this.prevent_sendemail_before)
      this.prevent_sendemail_before = new Date();
  }

  public static createNewUtilisateur(
    nom: string,
    prenom: string,
    email: string,
    onboarding: Onboarding,
  ): Utilisateur {
    return new Utilisateur({
      nom: nom,
      prenom: prenom,
      email: email,
      onboardingData: onboarding,
      onboardingResult: OnboardingResult.buildFromOnboarding(onboarding),

      id: undefined,
      code_departement: null,
      revenu_fiscal: null,
      parts: null,
      abonnement_ter_loire: false,
      passwordHash: null,
      passwordSalt: null,
      active_account: false,
      code: null,
      code_generation_time: null,
      created_at: undefined,
      migration_enabled: false,
      failed_checkcode_count: 0,
      failed_login_count: 0,
      prevent_login_before: new Date(),
      prevent_checkcode_before: new Date(),
      sent_email_count: 1,
      prevent_sendemail_before: new Date(),
      parcours_todo: new ParcoursTodo(),
      gamification: new Gamification(),
      unlocked_features: new UnlockedFeatures(),
      history: new History(),
      kyc_history: new KYCHistory(),
      defi_history: new DefiHistory(),
      equipements: new Equipements(),
      version: App.currentUserSystemVersion(),
      logement: Logement.buildFromOnboarding(onboarding),
      transport: Transport.buildFromOnboarding(onboarding),
      tag_ponderation_set: {},
      force_connexion: false,
      derniere_activite: new Date(),
      missions: new MissionsUtilisateur(),
    });
  }

  public resetAllHistory?() {
    this.tag_ponderation_set = {};
    this.parcours_todo.reset();
    this.gamification.reset();
    this.unlocked_features.reset();
    this.history.reset();
    this.defi_history.reset();
    this.equipements.reset();
    this.kyc_history.reset();
  }

  public checkState?() {
    if (this.force_connexion) {
      ApplicationError.throwPleaseReconnect();
    }
  }

  public getNombrePartsFiscalesOuEstimee?() {
    if (this.parts !== null) {
      return this.parts;
    }
    let parts_estimee = 0;
    if (this.onboardingData && this.onboardingData.adultes) {
      parts_estimee += this.onboardingData.adultes;
    }
    if (this.onboardingData && this.onboardingData.enfants) {
      const total_enfants =
        this.onboardingData.enfants > 2
          ? this.onboardingData.enfants
          : this.onboardingData.enfants * 0.5;
      parts_estimee += total_enfants;
    }
    return parts_estimee === 0 ? 1 : parts_estimee;
  }

  public setPassword?(password: string) {
    PasswordManager.setUserPassword(this, password);
  }

  public setNew6DigitCode?() {
    CodeManager.setNew6DigitCode(this);
    this.code_generation_time = new Date();
  }

  public static checkEmailFormat(email: string) {
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      ApplicationError.throwBaddEmailFormatError(email);
    }
  }

  public does_get_article_quizz_from_repo?(): boolean {
    return this.version > 0;
  }

  public isAdmin?(): boolean {
    return App.isAdmin(this.id);
  }

  public increaseTagValue?(tag: Tag, value: number) {
    this.setTagValue(tag, this.getTagValue(tag) + value);
  }
  public increaseTagForAnswers?(
    tag: Tag,
    kyc: QuestionKYC,
    map: Record<string, number>,
  ) {
    if (kyc && kyc.hasAnyResponses()) {
      for (const key in map) {
        if (kyc.includesReponseCode(key)) {
          this.increaseTagValue(tag, map[key]);
        }
      }
    }
  }
  public increaseTagValueIfElse?(
    tag: Tag,
    when: boolean,
    value_yes: number,
    value_no: number,
  ) {
    this.setTagValue(
      tag,
      this.getTagValue(tag) + (when ? value_yes : value_no),
    );
  }

  public recomputeRecoTags?() {
    UserTagEvaluator.recomputeRecoTags(this);
  }

  public getTagValue?(tag: Tag) {
    return this.tag_ponderation_set[tag] ? this.tag_ponderation_set[tag] : 0;
  }
  public setTagValue?(tag: Tag, value: number) {
    this.tag_ponderation_set[tag] = value;
  }
}
