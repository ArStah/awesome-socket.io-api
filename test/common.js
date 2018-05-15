/* eslint-disable import/prefer-default-export */
import chai from 'chai';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);
chai.should();

export const swallow = function (thrower) {
  try {
    thrower();
  } catch (e) {
    // Intentionally swallow
  }
};
