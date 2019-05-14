import { ILinterOptions, IOptions, Linter, LintResult } from 'tslint';

// tslint:disable-next-line:no-any
export function lint(ruleName: string, source: string, options?: any): LintResult {
    const configuration = {
        extends: [],
        rules: new Map<string, Partial<IOptions>>(),
        jsRules: new Map<string, Partial<IOptions>>(),
        rulesDirectory: []
    };

    options = options || [];

    const ops: Partial<IOptions> = { ruleName, ruleArguments: options, disabledIntervals: [] };
    configuration.rules.set(ruleName, ops);

    const linterOptions: ILinterOptions = {
        formatter: 'json',
        rulesDirectory: './dist/rules',
        formattersDirectory: undefined,
        fix: false
    };
    const linter = new Linter(linterOptions, undefined);
    linter.lint('file.ts', source, configuration);

    return linter.getResult();
}