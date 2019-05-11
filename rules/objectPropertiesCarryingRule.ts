import * as TS from 'typescript';
import * as Lint from 'tslint';
import { RuleFailure, Rules } from 'tslint';
import { BaseWalker } from './base-walker/base-walker';
import {
    ObjectLiteralExpressionBase,
    ObjectLiteralElement,
    PropertyDeclaration,
    ArrayBindingPattern
} from 'typescript';

/**
 * Walks the AST and visits each object declaration.
 */
export class Rule extends Rules.AbstractRule {
    static FAILURE_STRING_CONTENT_WIDTH = 'content width of object is more than $0';
    static FAILURE_STRING_OBJECT_CARRYING = 'object properties must be in single line or each on new line';
    static FAILURE_STRING_OBJECT_COMPLEX_VALUES = 'denied using complex values on single line properties';
    static FAILURE_STRING_MAX_SINGLE_LINE_PROPS = 'an object in single line must contain not more than ' +
        '$0 properties';
    static FAILURE_STRING_CARRYING_OBJECT_MIN_PROPS = 'an object with carrying properties must contain more ' +
        'than $0 properties';

    static DEFAULT_MAX_CONTENT_WIDTH = 70;
    static DEFAULT_MAX_SINGLE_LINE_PROPERTIES = 3;
    static DEFAULT_MAX_FUNCTION_INVOKING_LINE_WIDTH = 30;

    // noinspection JSUnusedGlobalSymbols
    static metadata: Lint.IRuleMetadata = {
        ruleName: 'object-properties-carrying',
        description: 'Warns about incorrect object properties carrying',
        optionsDescription: Lint.Utils.dedent`A number of maximum allowed properties`,
        options: { type: 'number' },
        optionExamples: [true, [true, 3, Rule.DEFAULT_MAX_CONTENT_WIDTH]],
        type: 'style',
        // tslint:disable-next-line
        typescriptOnly: true,
        // tslint:disable-next-line
        requiresTypeInfo: true
    };

    apply(sourceFile: TS.SourceFile): RuleFailure[] {
        return this.applyWithWalker(new ObjectDeclarationWalker(sourceFile, this.ruleName, this.ruleArguments));
    }
}

class ObjectDeclarationWalker extends BaseWalker {
    private static COMPLEX_KINDS_OF_VALUE = [
        TS.SyntaxKind.ArrowFunction,
        TS.SyntaxKind.FunctionExpression,
        TS.SyntaxKind.NewExpression,
        TS.SyntaxKind.JsxElement,
        TS.SyntaxKind.ArrayLiteralExpression,
        TS.SyntaxKind.ConditionalExpression,
        TS.SyntaxKind.BinaryExpression,
        TS.SyntaxKind.PropertyAccessExpression
    ];

    private readonly maxNumberOfObjectProperties: number;
    private readonly maxObjectContentWidth: number;

    constructor(sourceFile: TS.SourceFile, ruleName: string, ruleArguments: number[]) {
        super(sourceFile, ruleName, ruleArguments);

        const [maxNumberOfObjectProperties, maxObjectContentWidth] = ruleArguments;
        this.maxNumberOfObjectProperties = maxNumberOfObjectProperties || Rule.DEFAULT_MAX_SINGLE_LINE_PROPERTIES;
        this.maxObjectContentWidth = maxObjectContentWidth || Rule.DEFAULT_MAX_CONTENT_WIDTH;
    }

    // tslint:disable-next-line:cyclomatic-complexity
    protected visitNode(node: TS.Node): void {
        if (node.kind !== TS.SyntaxKind.ObjectLiteralExpression) {
            this.visitChilden(node);
            return;
        }

        const properties = this.getProperties(node);
        properties.forEach(prop => {
            const value = this.getValueFromPropertyAssigment(prop as PropertyDeclaration);
            if (!value) {
                return;
            }

            this.visitNode(value);
        });

        const hasOnlyOneProperty = properties.length === 1;
        const isValidMultiLine = this.isValidMultiline(properties);
        const hasDeniedContentWidth = this.hasDeniedContentWidth(properties);
        const doesPropertiesHaveComplexValue = this.doesPropertiesHaveComplexValue(properties);
        const isValidSingleLine = this.isValidSingleLine(properties);
        const hasMoreThanBorderNumberOfProperties = this.hasDeniedNumberOfProperties(properties);
        const hasOnlyOneMultilineProperty = this.hasOnlyOneMultilineProperty(properties);

        if (isValidSingleLine && hasDeniedContentWidth && !hasOnlyOneMultilineProperty) {
            this.addFailureAtNode(
                node,
                Rule.FAILURE_STRING_CONTENT_WIDTH.replace('$0', String(this.maxObjectContentWidth))
            );
            return;
        }

        if (!isValidMultiLine && !isValidSingleLine) {
            this.addFailureAtNode(node, Rule.FAILURE_STRING_OBJECT_CARRYING);
            return;
        }

        if (!hasOnlyOneProperty && isValidSingleLine && doesPropertiesHaveComplexValue) {
            this.addFailureAtNode(node, Rule.FAILURE_STRING_OBJECT_COMPLEX_VALUES);
            return;
        }

        if (isValidSingleLine && hasMoreThanBorderNumberOfProperties) {
            const maxProps = this.maxNumberOfObjectProperties;
            this.addFailureAtNode(
                node,
                Rule.FAILURE_STRING_MAX_SINGLE_LINE_PROPS.replace('$0', String(maxProps))
            );
            return;
        }

        if (hasDeniedContentWidth || hasOnlyOneMultilineProperty) {
            return;
        }

        if (!isValidSingleLine
            && isValidMultiLine
            && !hasMoreThanBorderNumberOfProperties
            && !doesPropertiesHaveComplexValue) {
            const maxProps = this.maxNumberOfObjectProperties;
            this.addFailureAtNode(
                node,
                Rule.FAILURE_STRING_CARRYING_OBJECT_MIN_PROPS.replace('$0', String(maxProps))
            );
        }
    }

    private getProperties(node: TS.Node): PropertyDeclaration[] {
        const validTypes = [
            TS.SyntaxKind.PropertyAssignment,
            TS.SyntaxKind.ShorthandPropertyAssignment,
            TS.SyntaxKind.SpreadAssignment
        ];

        return node.getChildAt(1)
            .getChildren()
            .filter(property => validTypes.includes(property.kind)) as PropertyDeclaration[];
    }

    private hasOnlyOneMultilineProperty(properties: TS.Node[]): boolean {
        if (properties.length !== 1) {
            return false;
        }

        const property = properties[0];
        return this.getNumberOfLine(property, 'start') !== this.getNumberOfLine(property, 'end');
    }

    private doesPropertiesHaveComplexValue(properties: PropertyDeclaration[]): boolean {
        if (this.hasMoreThanOneOrLongCallExpression(properties)) {
            return true;
        }

        return properties.some(property => this.hasPropertyComplexValue(property));
    }

    private hasMoreThanOneOrLongCallExpression(properties: PropertyDeclaration[]): boolean {
        const propAssigmentValues = properties.map(property => this.getValueFromPropertyAssigment(property));
        const foundCallExpressions = propAssigmentValues.filter(
            item => item && item.kind === TS.SyntaxKind.CallExpression
        );

        if (1 < foundCallExpressions.length) {
            return true;
        }

        return foundCallExpressions.some(
            item => Boolean(item && Rule.DEFAULT_MAX_FUNCTION_INVOKING_LINE_WIDTH < item.getText().length)
        );
    }

    // noinspection JSMethodCanBeStatic
    private hasPropertyComplexValue(property: PropertyDeclaration): boolean {
        const value = this.getValueFromPropertyAssigment(property);
        if (!value) {
            return false;
        }

        if (value.kind === TS.SyntaxKind.ObjectLiteralExpression) {
            return Boolean((value as ObjectLiteralExpressionBase<ObjectLiteralElement>).properties.length);
        }

        if (value.kind === TS.SyntaxKind.ArrayLiteralExpression) {
            return Boolean(1 < (value as ArrayBindingPattern).elements.length);
        }

        return ObjectDeclarationWalker.COMPLEX_KINDS_OF_VALUE.includes(value.kind);
    }

    // noinspection JSMethodCanBeStatic
    private getValueFromPropertyAssigment(property: PropertyDeclaration): TS.Node | undefined {
        return property.initializer;
    }

    private hasDeniedNumberOfProperties(properties: TS.Node[]): boolean {
        return this.maxNumberOfObjectProperties < properties.length;
    }

    private isValidMultiline(properties: TS.Node[]): boolean {
        if (properties.length === 1) {
            return true;
        }

        if (properties.length === 2) {
            return this.getNumberOfLine(properties[0], 'end') !== this.getNumberOfLine(properties[1], 'start');
        }

        const range = properties.slice(0, properties.length - 1);
        return range.every((current, i) => {
            if (i === 0) {
                return true;
            }

            const isNotPrevAndCurrentOnOneLine = (
                this.getNumberOfLine(properties[i - 1], 'end') !== this.getNumberOfLine(current, 'start')
            );
            const isNotCurrentAndNextOneLine = (
                this.getNumberOfLine(current, 'end') !== this.getNumberOfLine(properties[i + 1], 'start')
            );

            return isNotPrevAndCurrentOnOneLine && isNotCurrentAndNextOneLine;
        });
    }

    private isValidSingleLine(properties: TS.Node[]): boolean {
        if (properties.length === 1) {
            return true;
        }

        if (properties.length === 2) {
            return this.getNumberOfLine(properties[0], 'end') === this.getNumberOfLine(properties[1], 'start');
        }

        const range = properties.slice(0, properties.length - 1);

        return range.every((current, i) => {
            if (i === 0) {
                return true;
            }

            const isPrevAndCurrentOnOneLine = (
                this.getNumberOfLine(properties[i - 1], 'end') === this.getNumberOfLine(current, 'start')
            );
            const isCurrentAndNextOneLine = (
                this.getNumberOfLine(current, 'end') === this.getNumberOfLine(properties[i + 1], 'start')
            );

            return isPrevAndCurrentOnOneLine && isCurrentAndNextOneLine;
        });
    }

    // noinspection JSMethodCanBeStatic
    private getNumberOfLine(node: TS.Node, type: 'start' | 'end'): number {
        const position = type === 'start' ? node.getStart() : node.getEnd();
        return node.getSourceFile()
            .getLineAndCharacterOfPosition(position)
            .line;
    }

    private hasDeniedContentWidth(properties: TS.Node[]): boolean {
        const content = properties.map(prop => prop.getText())
            .join(', ')
            .replace('\n', '');

        return this.maxObjectContentWidth < content.length;
    }
}
