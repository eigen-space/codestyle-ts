import * as ts from 'typescript';
import * as Lint from 'tslint';
import { isConditionalExpression } from 'tsutils';

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = 'Ternary operators must be written in one line';

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        const walker = new NoMultilineTernaryWalker(sourceFile, this.getOptions());
        return this.applyWithWalker(walker);
    }
}

class NoMultilineTernaryWalker extends Lint.RuleWalker {

    protected visitNode(node: ts.ConditionalExpression): void {
        if (this.isValidNode(node)) {
            const startLine = this.getStartPosition(node).line;
            const endLine = this.getEndPosition(node).line;

            if (startLine !== endLine) {
                this.addFailureAtNode(node, Rule.FAILURE_STRING);
            }
        }

        super.visitNode(node);
    }

    private getStartPosition(node: ts.ConditionalExpression): ts.LineAndCharacter {
        return node.getSourceFile().getLineAndCharacterOfPosition(node.getStart());
    }

    private getEndPosition(node: ts.ConditionalExpression): ts.LineAndCharacter {
        return node.getSourceFile().getLineAndCharacterOfPosition(node.getEnd());
    }

    private isValidNode(node: ts.Node): boolean {
        return isConditionalExpression(node);
    }
}