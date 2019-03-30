/* tslint:disable:file-name-casing comment-type */
import { lint } from '../test/linter';
import { Rule } from './noMultilineTernaryRule';

const rule = 'no-multiline-ternary';

describe('noMultilineTernaryRule', () => {

    it('should return error if ternary expression wrote in more than one line', () => {
        const source = `
            return true
              ? 1
              : 2;
        `;
        const failure = lint(rule, source).failures[0].getFailure();
        expect(failure).toBe(Rule.FAILURE_STRING);
    });

    it('should not return error ternary expression wrote in one line', () => {
        const source = `
            const a = true ? 1 : 2;
        `;
        const result = lint(rule, source);
        expect(result.errorCount).toBe(0);
    });
});