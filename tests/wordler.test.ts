import { describe, it } from 'mocha';
import { expect } from 'chai'
import { testSolver } from 'wordler-core/tests/helpers';
import { Solver } from '@solver/index';

describe('Wordler', () => {
  it('runs against the test words', () => {
    const {
      duration,
      average,
      distribution
    } = testSolver(Solver);

    console.log('ms:', duration);
    console.log('average:', average);
    console.log(JSON.stringify(distribution, null, 2));

    expect(average).to.be.at.most(6);
  });
});