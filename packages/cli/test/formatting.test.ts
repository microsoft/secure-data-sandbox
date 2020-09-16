import { assert, expect } from 'chai';
import 'mocha';

import { leftJustify, rightJustify, formatChoices } from '../src/formatting';

describe('formatting', () => {
  describe('leftJustify', () => {
    it('returns the input for long strings', () => {
      const text = 'thisisaverylongstring';
      const result = leftJustify(text, 5);
      assert.equal(result, text);
    });

    it('pads the right side of the text', () => {
      const text = 'input';
      const result = leftJustify(text, 20);

      const expected = 'input               ';
      assert.equal(result, expected);
      assert.equal(result.length, 20);
    });
  });

  describe('rightJustify', () => {
    it('returns the input for long strings', () => {
      const text = 'thisisaverylongstring';
      const result = rightJustify(text, 5);
      assert.equal(result, text);
    });

    it('pads the left side of the text', () => {
      const text = 'input';
      const result = rightJustify(text, 20);

      const expected = '               input';
      assert.equal(result, expected);
      assert.equal(result.length, 20);
    });
  });

  describe('formatChoices', () => {
    it('throws an error on no choices', () => {
      const choices: string[] = [];
      expect(formatChoices(choices)).to.throw(new TypeError('internal error'));
    });

    it('handles a single choice', () => {
      const choices = ['highlander'];
      const result = formatChoices(choices);
      assert.equal(result, 'highlander');
    });

    it('handles many choices', () => {
      const choices = ['one', 'two', 'three'];
      const result = formatChoices(choices);
      assert.equal(result, 'one, two, or three');
    });
  });
});
