import {
  SerialisableDomain,
  Upgrader,
} from '../../../../src/domain/object_store/upgrader';
import { Gamification } from '../../../../src/domain/gamification/gamification';
import { Gamification_v0 } from '../../../../src/domain/object_store/gamification/gamification_v0';

describe('Gamification vN ', () => {
  it('build OK from empty', () => {
    // GIVEN
    const raw = Upgrader.upgradeRaw({}, SerialisableDomain.Gamification);

    // WHEN

    const domain = new Gamification(raw);
    // THEN

    expect(domain.celebrations).toHaveLength(0);
    expect(domain.points).toEqual(0);
  });
  it('serialise <=> deserialise v0 OK', () => {
    // GIVEN
    let domain_start = new Gamification();
    domain_start.ajoutePoints(150);

    // WHEN
    const raw = Gamification_v0.serialise(domain_start);
    const domain_end = new Gamification(raw);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
  it('serialise <=> upgade <=> deserialise v0 OK', () => {
    // GIVEN
    const domain_start = new Gamification();
    domain_start.ajoutePoints(150);

    // WHEN
    const raw = Gamification_v0.serialise(domain_start);
    const upgrade = Upgrader.upgradeRaw(raw, SerialisableDomain.Gamification);
    const domain_end = new Gamification(upgrade);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
});
