import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/db/prisma.service';
const request = require('supertest');

export class TestUtil {
  constructor() {}
  public static app: INestApplication;
  public static prisma = new PrismaService();
  public static utilisateur = 'utilisateur';
  public static suivi = 'suivi';

  static getServer() {
    return request(this.app.getHttpServer());
  }

  static async appinit() {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = moduleFixture.createNestApplication();
    await this.app.init();
    return this.app;
  }
  static async appclose() {
    await this.app.close();
    await this.prisma.$disconnect();
  }

  static async deleteAll() {
    await this.prisma.suivi.deleteMany();
    await this.prisma.interaction.deleteMany();
    await this.prisma.badge.deleteMany();
    await this.prisma.quizzQuestion.deleteMany();
    await this.prisma.quizz.deleteMany();
    await this.prisma.empreinte.deleteMany();
    await this.prisma.utilisateur.deleteMany();
  }

  static getDate(date: string) {
    return new Date(Date.parse(date));
  }
  static async create(type: string, override?) {
    await this.prisma[type].create({
      data: this[type.concat('Data')](override),
    });
  }
  private static suiviData(override?) {
    return {
      id: 'suivi-id',
      type: 'alimentation',
      attributs: ['a', 'b', 'c'],
      valeurs: ['1', '2', '3'],
      utilisateurId: 'utilisateur-id',
      ...override,
    };
  }
  private static utilisateurData(override?) {
    return {
      id: 'utilisateur-id',
      name: 'name',
      ...override,
    };
  }
  private static badgeData(override?) {
    return {
      id: 'badge-id',
      type: 'type',
      titre: 'titre',
      utilisateurId: 'utilisateur-id',
      ...override,
    };
  }
  private static quizzData(override?) {
    return {
      id: 'quizz-id',
      titre: 'titre',
      ...override,
    };
  }
  private static quizzQuestionData(override?) {
    return {
      id: 'quizzQuestion-id',
      libelle: 'libelle',
      solution: '10',
      propositions: ['1', '5', '10'],
      quizzId: 'quizz-id',
      texte_riche_explication: 'bla bla bla',
      ...override,
    };
  }
  private static interactionData(override?) {
    return {
      id: 'interaction-id',
      content_id: 'quizz-id',
      type: 'type',
      titre: 'titre',
      soustitre: 'soustitre',
      categorie: 'Consommation',
      tags: ['quizz', 'nourriture', 'conso'],
      duree: '⏱️ < 1 minute',
      frequence: '🔄 1x/jour',
      image_url: 'imageurl',
      url: 'url',
      seen: 0,
      seen_at: null,
      clicked: false,
      clicked_at: null,
      done: false,
      done_at: null,
      succeeded: false,
      succeeded_at: null,
      difficulty: 1,
      points: 5,
      reco_score: 100,
      utilisateurId: 'utilisateur-id',
      ...override,
    };
  }
}
