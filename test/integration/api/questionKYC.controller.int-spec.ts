import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import {
  CategorieQuestionKYC,
  TypeReponseQuestionKYC,
} from '../../../src/domain/kyc/questionQYC';
import { QuestionKYCRepository } from '../../../src/infrastructure/repository/questionKYC.repository';
import { TestUtil } from '../../TestUtil';

describe('/utilisateurs/id/questionsKYC (API test)', () => {
  const questionRepo = new QuestionKYCRepository(TestUtil.prisma);
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('GET /utilisateurs/id/questionsKYC - liste 3 questions', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(5);
  });
  it('GET /utilisateurs/id/questionsKYC - liste 3 questions dont une remplie', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('questionsKYC');

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(5);
    expect(response.body[1].reponse).toStrictEqual([
      'Le climat',
      'Mon logement',
    ]);
  });
  it('GET /utilisateurs/id/questionsKYC/1 - renvoie la question sans réponse', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC/2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.id).toEqual('2');
    expect(response.body.type).toEqual(TypeReponseQuestionKYC.choix_multiple);
    expect(response.body.points).toEqual(10);
    expect(response.body.reponses_possibles).toEqual([
      'Le climat',
      'Mon logement',
      'Ce que je mange',
    ]);
    expect(response.body.categorie).toEqual(CategorieQuestionKYC.service);
    expect(response.body.question).toEqual(
      `Quel est votre sujet principal d'intéret ?`,
    );
    expect(response.body.reponse).toEqual(undefined);
  });
  it('GET /utilisateurs/id/questionsKYC/bad - renvoie 404', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC/bad',
    );

    // THEN
    expect(response.status).toBe(404);
  });
  it('GET /utilisateurs/id/questionsKYC/question - renvoie la quesition avec la réponse', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('questionsKYC');

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC/2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.question).toEqual(
      `Quel est votre sujet principal d'intéret ?`,
    );
    expect(response.body.reponse).toEqual(['Le climat', 'Mon logement']);
  });
  it('PUT /utilisateurs/id/questionsKYC/1 - crée la reponse à la question 1, empoche les points', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/1',
    ).send({ reponse: ['YO'] });

    // THEN
    expect(response.status).toBe(200);
    const collection = await questionRepo.getAll('utilisateur-id');
    expect(collection.getQuestion('1').reponse).toStrictEqual(['YO']);

    const userDB = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );
    expect(userDB.gamification.points).toEqual(20);
  });
  it('PUT /utilisateurs/id/questionsKYC/1 - met à jour la reponse à la question 1', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('questionsKYC');

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/2',
    ).send({ reponse: ['YO'] });

    // THEN
    expect(response.status).toBe(200);
    const collection = await questionRepo.getAll('utilisateur-id');
    expect(collection.getQuestion('2').reponse).toStrictEqual(['YO']);

    const userDB = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );
    expect(userDB.gamification.points).toEqual(10);
  });
  it('PUT /utilisateurs/id/questionsKYC/bad - erreur 404 ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/bad',
    ).send({ reponse: ['YO'] });

    // THEN

    expect(response.status).toBe(404);
  });
});