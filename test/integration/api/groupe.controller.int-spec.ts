import { TestUtil } from '../../TestUtil';

describe('Groupe (API test)', () => {
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

  it('retourne group id 1', async () => {
    // GIVEN
    await TestUtil.create('groupe', { id: '1', description: 'description 1' });
    await TestUtil.create('groupe', { id: '2', description: 'description 2' });

    // WHEN
    const response = await TestUtil.GET('/groupes/1');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.description).toEqual('description 1');
  });

  it('Un utilisateur créer un groupe', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { id: 'utilisateur-id', email: '1' });
    const group = { name: 'Test' };

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/utilisateur-id/groupe')
      .send(group)
      .set('Authorization', `Bearer ${TestUtil.token}`);

    expect(response.body.name).toEqual('Test');
  });

  it('Un utilisateur met à jour un groupe', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { id: 'utilisateur-id', email: '1' });

    const group = { name: 'Test' };
    const response = await TestUtil.getServer()
      .post('/utilisateurs/utilisateur-id/groupe')
      .send(group)
      .set('Authorization', `Bearer ${TestUtil.token}`);
    // WHEN
    const updatedGroup = { name: 'Test2' };
    const responseMaj = await TestUtil.getServer()
      .put('/utilisateurs/utilisateur-id/groupes/' + response.body.id)
      .send(updatedGroup)
      .set('Authorization', `Bearer ${TestUtil.token}`);

    // THEN
    expect(responseMaj.status).toBe(200);
    expect(responseMaj.body.name).toEqual('Test2');
  });

  it('Un utilisateur supprime un groupe', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { id: 'utilisateur-id', email: '1' });
    const group = { name: 'TestDelete' };
    const response = await TestUtil.getServer()
      .post('/utilisateurs/utilisateur-id/groupe')
      .send(group)
      .set('Authorization', `Bearer ${TestUtil.token}`);
    // WHEN

    const responseTest = await TestUtil.GET('/groupes/' + response.body.id);
    console.log(responseTest.body);
    const responseSupp = await TestUtil.DELETE(
      '/utilisateurs/utilisateur-id/groupes/' + responseTest.body.id,
    );
    // THEN
    expect(responseSupp.body).toEqual({});
    const responseTest2 = await TestUtil.GET('/groupes/' + response.body.id);
    expect(responseTest2.status).toBe(404);
  });

  it('Un utilisateur rejoint un groupe', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { id: 'utilisateur-id', email: '1' });
    await TestUtil.create('groupe', { id: 'groupe-id', name: 'Test' });
    // WHEN
    const responseJoin = await TestUtil.getServer()
      .put('/groupes/groupe-id/join/utilisateur-id')
      .set('Authorization', `Bearer ${TestUtil.token}`);

    // THEN
    expect(responseJoin.status).toBe(200);
    expect(responseJoin.body.utilisateurId).toBe('utilisateur-id');
    expect(responseJoin.body.groupeId).toBe('groupe-id');
  });

  it('Un utilisateur quitte un groupe', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { id: 'utilisateur-id', email: '1' });
    await TestUtil.create('groupe', { id: 'groupe-id', name: 'Test' });
    const responseJoin = await TestUtil.getServer()
      .put('/groupes/groupe-id/join/utilisateur-id')
      .set('Authorization', `Bearer ${TestUtil.token}`);
    console.log(responseJoin.body);
    // WHEN
    const responseQuit = await TestUtil.getServer()
      .put('/groupes/groupe-id/quit/utilisateur-id')
      .set('Authorization', `Bearer ${TestUtil.token}`);

    // THEN
    expect(responseQuit.status).toBe(200);
    expect(responseQuit.body.groupeId).toBe('groupe-id');
  });
});