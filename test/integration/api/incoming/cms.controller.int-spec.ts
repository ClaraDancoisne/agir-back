import { CMSModel } from '../../../../src/infrastructure/api/types/cms/CMSModels';
import { InteractionType } from '../../../../src/domain/interaction/interactionType';
import { CMSEvent } from '../../../../src/infrastructure/api/types/cms/CMSEvent';
import { TestUtil } from '../../../TestUtil';

describe('/api/incoming/cms (API test)', () => {
  const CMS_DATA = TestUtil.CMSWebhookAPIData();
  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    TestUtil.token = process.env.CMS_WEBHOOK_API_KEY;
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('POST /api/incoming/cms - 401 si header manquant', async () => {
    // GIVEN
    // WHEN
    const response = await TestUtil.getServer()
      .post('/api/incoming/cms')
      .send(CMS_DATA);

    // THEN
    expect(response.status).toBe(401);
  });
  it('POST /api/incoming/cms - 403 si mauvaise clé API', async () => {
    // GIVEN
    TestUtil.token = 'bad';
    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(CMS_DATA);

    // THEN
    expect(response.status).toBe(403);
  });
  it('POST /api/incoming/cms - create a new article, no user in db, no error', async () => {
    // GIVEN

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(CMS_DATA);

    // THEN
    const interDefDB = await TestUtil.prisma.interactionDefinition.findMany({});
    const interDBCount = await TestUtil.prisma.interaction.count();

    expect(response.status).toBe(201);
    expect(interDBCount).toEqual(0);
    expect(interDefDB).toHaveLength(1);
    expect(interDefDB[0].type).toEqual('article');
    expect(interDefDB[0].titre).toEqual('titre');
    expect(interDefDB[0].soustitre).toEqual('soustitre 222');
    expect(interDefDB[0].thematique_gamification).toEqual('alimentation');
    expect(interDefDB[0].thematique_gamification_titre).toEqual('Alimentation');
    expect(interDefDB[0].thematiques).toStrictEqual(['alimentation', 'climat']);
    expect(interDefDB[0].duree).toEqual('pas trop long');
    expect(interDefDB[0].frequence).toEqual('souvent');
    expect(interDefDB[0].image_url).toEqual('https://');
    expect(interDefDB[0].difficulty).toEqual(3);
    expect(interDefDB[0].points).toEqual(20);
    expect(interDefDB[0].codes_postaux).toStrictEqual(['91120', '75002']);
    expect(interDefDB[0].content_id).toEqual('123');
  });
  it('POST /api/incoming/cms - create a new article, 1 user in db with not article, no error', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(CMS_DATA);

    // THEN
    const interDB = await TestUtil.prisma.interaction.findMany({});
    expect(response.status).toBe(201);
    expect(interDB).toHaveLength(1);
    expect(interDB[0].utilisateurId).toEqual('utilisateur-id');
  });
  it('POST /api/incoming/cms - create 1 thematique', async () => {
    // GIVEN
    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send({
      ...CMS_DATA,
      model: CMSModel.thematique,
      event: CMSEvent['entry.publish'],
      entry: { id: 1, titre: 'yo' },
    });

    // THEN
    expect(response.status).toBe(201);
    const thematiqueDB = await TestUtil.prisma.thematique.findMany({});
    expect(thematiqueDB).toHaveLength(1);
    expect(thematiqueDB[0].id_cms).toEqual(1);
    expect(thematiqueDB[0].titre).toEqual('yo');
  });
  it('POST /api/incoming/cms - does nothing when model = aide', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send({
      ...CMS_DATA,
      model: 'aide',
    });

    // THEN
    const interDB = await TestUtil.prisma.interaction.findMany({});
    expect(response.status).toBe(201);
    expect(interDB).toHaveLength(0);
  });
  it('POST /api/incoming/cms - updates existing article, 1 user in db ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interactionDefinition', {
      content_id: '123',
      type: InteractionType.article,
    });
    await TestUtil.create('interaction', {
      content_id: '123',
      type: InteractionType.article,
    });

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(CMS_DATA);
    // THEN
    const interDB = await TestUtil.prisma.interaction.findMany({});
    const interDefDB = await TestUtil.prisma.interactionDefinition.findMany({});
    expect(response.status).toBe(201);
    expect(interDB).toHaveLength(1);
    expect(interDefDB).toHaveLength(1);
    expect(interDefDB[0].soustitre).toEqual('soustitre 222');
    expect(interDB[0].soustitre).toEqual('soustitre 222');
  });
  it('POST /api/incoming/cms - updates existing 2 article for 2 users ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { id: 'u1', email: 'e1' });
    await TestUtil.create('utilisateur', { id: 'u2', email: 'e2' });
    await TestUtil.create('interactionDefinition', {
      content_id: '123',
      type: InteractionType.article,
    });
    await TestUtil.create('interaction', {
      id: 'i1',
      content_id: '123',
      type: InteractionType.article,
      utilisateurId: 'u1',
    });
    await TestUtil.create('interaction', {
      id: 'i2',
      content_id: '123',
      type: InteractionType.article,
      utilisateurId: 'u2',
    });

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(CMS_DATA);

    // THEN
    const interDB = await TestUtil.prisma.interaction.findMany({});
    const interDefDB = await TestUtil.prisma.interactionDefinition.findMany({});
    expect(response.status).toBe(201);
    expect(interDB).toHaveLength(2);
    expect(interDefDB).toHaveLength(1);
    expect(interDefDB[0].soustitre).toEqual('soustitre 222');
    expect(interDB[0].soustitre).toEqual('soustitre 222');
    expect(interDB[1].soustitre).toEqual('soustitre 222');
  });
  it('POST /api/incoming/cms - does nothing when no publishedAt value', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    const data = { ...CMS_DATA };
    data.entry = { ...data.entry };
    data.entry.publishedAt = null;
    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(data);

    // THEN
    const interDB = await TestUtil.prisma.interaction.findMany({});
    expect(response.status).toBe(201);
    expect(interDB).toHaveLength(0);
  });
  it('POST /api/incoming/cms - optional points lead to 0 points', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    const data = { ...CMS_DATA };
    data.entry = { ...data.entry };
    data.entry.points = null;
    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(data);

    // THEN
    const interDB = await TestUtil.prisma.interaction.findMany({});
    expect(response.status).toBe(201);
    expect(interDB).toHaveLength(1);
    expect(interDB[0].points).toEqual(0);
  });
  it('POST /api/incoming/cms - unpublish event removes interaction definition', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interactionDefinition', {
      content_id: '123',
    });

    const data = { ...CMS_DATA };
    data.event = CMSEvent['entry.unpublish'];
    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(data);

    // THEN
    const interDefDB = await TestUtil.prisma.interactionDefinition.findMany({});
    expect(response.status).toBe(201);
    expect(interDefDB).toHaveLength(0);
  });
  it('POST /api/incoming/cms - unpublish event removes interaction when not done', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { id: 'u1', email: 'e1' });
    await TestUtil.create('utilisateur', { id: 'u2', email: 'e2' });
    await TestUtil.create('interactionDefinition', {
      content_id: '123',
    });
    await TestUtil.create('interaction', {
      id: 'i1',
      content_id: '123',
      type: InteractionType.article,
      utilisateurId: 'u1',
      done: true,
    });
    await TestUtil.create('interaction', {
      id: 'i2',
      content_id: '123',
      type: InteractionType.article,
      utilisateurId: 'u2',
      done: false,
    });

    const data = { ...CMS_DATA };
    data.event = CMSEvent['entry.delete'];
    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(data);

    // THEN
    const interDB = await TestUtil.prisma.interaction.findMany({});
    expect(response.status).toBe(201);
    expect(interDB).toHaveLength(1);
    expect(interDB[0].id).toEqual('i1');
  });
});