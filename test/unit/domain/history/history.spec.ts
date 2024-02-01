import { TestUtil } from '../../../../test/TestUtil';
import { Article } from '../../../../src/domain/article';
import { History } from '../../../../src/domain/history/history';

describe('History', () => {
  it('WHEN un vie historique ok', () => {
    // WHEN
    const history = History.newHistory();

    // THEN
    expect(history.nombreArticles()).toEqual(0);
  });
  it('cree un historique ok', () => {
    // GIVEN
    const history = new History({
      article_interactions: [
        {
          content_id: '1',
          like_level: 2,
          points_en_poche: true,
          read_date: new Date(123),
        },
      ],
    });

    // WHEN
    const article = history.getArticleHistoryById('1');

    // THEN
    expect(article.content_id).toEqual('1');
    expect(article.like_level).toEqual(2);
    expect(article.points_en_poche).toEqual(true);
    expect(article.read_date.getTime()).toEqual(123);
  });
  it('lire un nouveau article insert un nouveau aricle', () => {
    // GIVEN
    const history = new History({});

    // WHEN
    history.articleLu('1');

    // THEN
    expect(history.nombreArticles()).toEqual(1);
  });
  it('faire un nouveau quizz insert un nouveau quizz', () => {
    // GIVEN
    const history = new History({});

    // WHEN
    history.quizzAttempt('1', 12);

    // THEN
    expect(history.nombreQuizz()).toEqual(1);
    expect(history.getQuizzHistoryById('1').attempts).toHaveLength(1);
    expect(history.getQuizzHistoryById('1').attempts[0].score).toEqual(12);
    expect(
      history.getQuizzHistoryById('1').attempts[0].date.getTime(),
    ).toBeGreaterThan(Date.now() - 100);
  });
  it('on peut lire 2 fois le meme article', () => {
    // GIVEN
    const history = new History({});

    // WHEN
    history.articleLu('1');
    history.articleLu('1');

    // THEN
    expect(history.nombreArticles()).toEqual(1);
  });
  it('on peut tenter 2 fois le meme quizz', () => {
    // GIVEN
    const history = new History({});

    // WHEN
    history.quizzAttempt('1', 10);
    history.quizzAttempt('1', 20);

    // THEN
    expect(history.nombreQuizz()).toEqual(1);
    expect(history.getQuizzHistoryById('1').attempts).toHaveLength(2);
  });
  it('lire un aricle valorise la date de lecture', () => {
    // GIVEN
    const history = new History({});

    // WHEN
    history.articleLu('1');

    // THEN
    const article = history.getArticleHistoryById('1');
    expect(article.read_date.getTime()).toBeGreaterThan(Date.now() - 100);
  });
  it('dire qu on a empoché les points d un article', () => {
    // GIVEN
    const history = new History({});
    history.articleLu('1');

    // THEN
    expect(history.getArticleHistoryById('1').points_en_poche).toStrictEqual(
      false,
    );

    // WHEN
    history.metPointsArticleEnPoche('1');

    // THEN
    const article = history.getArticleHistoryById('1');
    expect(article.points_en_poche).toStrictEqual(true);
    expect(history.sontPointsArticleEnPoche('1')).toStrictEqual(true);
  });
  it('dire qu on a empoché les points d un quizz', () => {
    // GIVEN
    const history = new History({});
    history.quizzAttempt('1', 100);

    // THEN
    expect(history.getQuizzHistoryById('1').points_en_poche).toStrictEqual(
      false,
    );

    // WHEN
    history.metPointsQuizzEnPoche('1');

    // THEN
    const quizz = history.getQuizzHistoryById('1');
    expect(quizz.points_en_poche).toStrictEqual(true);
    expect(history.sontPointsQuizzEnPoche('1')).toStrictEqual(true);
  });
  it('liste articles lus', () => {
    // GIVEN
    const history = new History({
      article_interactions: [
        { content_id: '1', read_date: new Date() },
        { content_id: '2', read_date: null },
        { content_id: '3', read_date: new Date() },
        { content_id: '4' },
      ],
    });

    // WHEN
    const result = history.listeIdsArticlesLus();

    // THEN
    expect(result).toHaveLength(2);
    expect(result).toContain('1');
    expect(result).toContain('3');
  });
  it('liste articles lus', () => {
    // GIVEN
    const history = new History({
      article_interactions: [
        { content_id: '1', read_date: new Date() },
        { content_id: '2', read_date: null },
        { content_id: '3', read_date: new Date() },
        { content_id: '4' },
      ],
    });

    // WHEN
    const result = history.listeIdsArticlesLus();

    // THEN
    expect(result).toHaveLength(2);
    expect(result).toContain('1');
    expect(result).toContain('3');
  });
  it('liste quizz avec 100%', () => {
    // GIVEN
    const history = new History({
      quizz_interactions: [
        { content_id: '1', attempts: [{ date: new Date(), score: 40 }] },
        { content_id: '2', attempts: [{ date: new Date(), score: 100 }] },
        {
          content_id: '3',
          attempts: [
            { date: new Date(), score: 10 },
            { date: new Date(), score: 100 },
          ],
        },
      ],
    });

    // WHEN
    const result = history.listeIdsQuizz100Pour100();

    // THEN
    expect(result).toHaveLength(2);
    expect(result).toContain('2');
    expect(result).toContain('3');
  });
  it('liste quizz avec des attempts', () => {
    // GIVEN
    const history = new History({
      quizz_interactions: [
        { content_id: '1', attempts: [{ date: new Date(), score: 40 }] },
        { content_id: '2', attempts: [{ date: new Date(), score: 100 }] },
        { content_id: '3', attempts: [] },
      ],
    });

    // WHEN
    const result = history.listeIdsQuizzAttempted();

    // THEN
    expect(result).toHaveLength(2);
    expect(result).toContain('1');
    expect(result).toContain('2');
  });
  it('liste articles lus par date desc', () => {
    // GIVEN
    const history = new History({
      article_interactions: [
        { content_id: '1', read_date: new Date(1) },
        { content_id: '2', read_date: null },
        { content_id: '3', read_date: new Date(2) },
        { content_id: '4' },
        { content_id: '5', read_date: new Date(0) },
      ],
    });

    const liste_articles: Article[] = [];
    liste_articles.push(TestUtil.articleData({ content_id: '1' }));
    liste_articles.push(TestUtil.articleData({ content_id: '3' }));
    liste_articles.push(TestUtil.articleData({ content_id: '5' }));

    // WHEN
    const result = history.orderReadArticlesByReadDate(liste_articles);

    // THEN
    expect(result).toHaveLength(3);
    expect(result[0].content_id).toEqual('3');
    expect(result[1].content_id).toEqual('1');
    expect(result[2].content_id).toEqual('5');
  });
});
