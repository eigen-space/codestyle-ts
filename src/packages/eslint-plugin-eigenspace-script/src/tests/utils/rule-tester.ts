import { TSESLint } from '@typescript-eslint/experimental-utils';

const parser = '@typescript-eslint/parser';

export type RuleTesterConfig = Omit<TSESLint.RuleTesterConfig, 'parser'> & {
    parser: typeof parser;
};

export class RuleTester extends TSESLint.RuleTester {
    // As of eslint 6 you have to provide an absolute path to the parser
    // But that's not as clean to type, this saves us trying to manually enforce that contributors require.resolve everything
    constructor(options: RuleTesterConfig) {
        super({
            ...options,
            parser: require.resolve(options.parser)
        });
    }

    // As of eslint 6 you have to provide an absolute path to the parser
    // If you don't do that at the test level, the test will fail somewhat cryptically...
    // This is a lot more explicit
    run<TMessageIds extends string, TOptions extends Readonly<unknown[]>>(
        name: string,
        rule: TSESLint.RuleModule<TMessageIds, TOptions>,
        tests: TSESLint.RunTests<TMessageIds, TOptions>
    ): void {

        const errorMessage = `Do not set the parser at the test level unless you want to use a parser other than\
         ${parser}`;

        tests.valid.forEach(test => {
            if (typeof test !== 'string' && test.parser === parser) {
                throw new Error(errorMessage);
            }
        });

        tests.invalid.forEach(test => {
            if (test.parser === parser) {
                throw new Error(errorMessage);
            }
        });

        super.run(name, rule, tests);
    }
}
