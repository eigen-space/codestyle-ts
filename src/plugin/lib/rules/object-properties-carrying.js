const { CommonUtils } = require('../utils/common/common.utils');
const { FormattingUtils } = require('../utils/formatting/formatting.utils');

const MAX_CONTENT_WIDTH = 70;
const MAX_PROPERTIES_IN_SINGLE_LINE = 3;
const MAX_ARRAY_PROPERTIES_IN_SINGLE_LINE = 1;
const MAX_CHILD_OBJECT_PROPERTIES_IN_SINGLE_LINE = 0;
const MAX_CHILD_CALL_EXPRESSION_LENGTH = 20;
const MAX_COUNT_CALL_EXPRESSION_IN_SINGLE_LINE = 1;

const ERROR_TYPE = {
    CONTENT_WIDTH: 'content-width',
    COUNT_PROPERTIES: 'count-properties',
    COUNT_CALL_EXPRESSIONS: 'count-call-expressions',
    FUNCTION_LENGTH: 'function-length',
    COUNT_NESTED_OBJECT_PROPERTIES: 'count-nested-object-properties',
    COUNT_NESTED_ARRAY_ELEMENTS: 'count-nested-array-properties'
};

const SINGLE_LINE_ERROR_MESSAGES = {
    [ERROR_TYPE.CONTENT_WIDTH]: `content width of object is more than ${MAX_CONTENT_WIDTH}.`,
    [ERROR_TYPE.COUNT_PROPERTIES]: `an object in single line must contain not more than\
     ${MAX_PROPERTIES_IN_SINGLE_LINE} properties.`,
    [ERROR_TYPE.COUNT_CALL_EXPRESSIONS]: `an object in single line must contain not more than\
     ${MAX_COUNT_CALL_EXPRESSION_IN_SINGLE_LINE} call expressions.`,
    [ERROR_TYPE.FUNCTION_LENGTH]: `an object in single line can contain a function no longer than\
     ${MAX_CHILD_CALL_EXPRESSION_LENGTH} characters.`,
    [ERROR_TYPE.COUNT_NESTED_OBJECT_PROPERTIES]: `an object in single line can contain an object with the number of\
     properties not more than ${MAX_CHILD_OBJECT_PROPERTIES_IN_SINGLE_LINE}.`,
    [ERROR_TYPE.COUNT_NESTED_ARRAY_ELEMENTS]: `an object in single line can contain an array with the number of\
     properties not more than ${MAX_ARRAY_PROPERTIES_IN_SINGLE_LINE}.`
};

const MULTI_LINE_ERROR_MESSAGE = 'the object can be written in one line.';

module.exports = {
    meta: {
        type: 'layout',

        docs: {
            description: 'object literal property carrying rules',
            category: 'Stylistic Issues'
        }
    },
    create(context) {

        return {
            ObjectExpression(node) {
                if (!isDesiredObject(context)) {
                    return;
                }

                const isSingleLine = CommonUtils.isSingleLine(node);

                let messages = checkLiteralAsSingleLine(context, node);

                if (!isSingleLine) {
                    messages = !messages.length ? [MULTI_LINE_ERROR_MESSAGE] : [];
                }

                report(context, node, messages);
            }
        };
    }
};

// Not a part of call expression
function isDesiredObject(context) {
    const ignoredParentTypes = ['CallExpression'];
    const approvedParentTypes = ['AssignmentExpression', 'VariableDeclarator'];

    const approvedParentIndex = getClosestByTypes(context, approvedParentTypes);
    const ignoredParentIndex = getClosestByTypes(context, ignoredParentTypes);

    return approvedParentIndex < ignoredParentIndex;
}

function getClosestByTypes(context, types) {
    const NOT_FOUND_INDEX = -1;
    return types.map(type => CommonUtils.findIndexParentByType(context, type))
        .filter(index => NOT_FOUND_INDEX < index)
        .reduce((previous, current) => current < previous ? current : previous, Number.MAX_SAFE_INTEGER);
}

function checkLiteralAsSingleLine(context, node) {
    const messages = [];

    messages.push(...checkCommonRules(context, node));

    const nestedNodes = node.properties.map(prop => prop.value)
        .filter(nestedNode => Boolean(nestedNode));

    messages.push(checkArrayExpressionInObject(nestedNodes));
    messages.push(...checkFunctionsInObject(nestedNodes));
    messages.push(checkObjectInObject(nestedNodes));

    return messages.filter(message => Boolean(message));
}

function checkCommonRules(context, node) {
    const messages = [];

    if (MAX_CONTENT_WIDTH < FormattingUtils.nodeToSingleLineText(context, node).length) {
        messages.push(SINGLE_LINE_ERROR_MESSAGES[ERROR_TYPE.CONTENT_WIDTH]);
    }

    if (MAX_PROPERTIES_IN_SINGLE_LINE < node.properties.length) {
        messages.push(SINGLE_LINE_ERROR_MESSAGES[ERROR_TYPE.COUNT_PROPERTIES]);
    }

    return messages;
}

function checkArrayExpressionInObject(nodes) {
    const arrayExpressions = nodes.filter(nestedNode => nestedNode.type === 'ArrayExpression');
    if (arrayExpressions.some(array => MAX_ARRAY_PROPERTIES_IN_SINGLE_LINE < array.elements.length)) {
        return SINGLE_LINE_ERROR_MESSAGES[ERROR_TYPE.COUNT_NESTED_ARRAY_ELEMENTS];
    }
}

function checkFunctionsInObject(nodes) {
    const functionExpressions = ['ArrowFunctionExpression', 'CallExpression'];
    const callExpressions = nodes.filter(nestedNode => functionExpressions.includes(nestedNode.type));

    const messages = [];
    if (MAX_COUNT_CALL_EXPRESSION_IN_SINGLE_LINE < callExpressions.length) {
        messages.push(SINGLE_LINE_ERROR_MESSAGES[ERROR_TYPE.COUNT_CALL_EXPRESSIONS]);
    }

    const functionLengths = callExpressions.map(expressionNode => CommonUtils.getContentLength(expressionNode));
    if (functionLengths.some(length => MAX_CHILD_CALL_EXPRESSION_LENGTH < length)) {
        messages.push(SINGLE_LINE_ERROR_MESSAGES[ERROR_TYPE.FUNCTION_LENGTH]);
    }

    return messages;
}

function checkObjectInObject(nodes) {
    const objectExpressions = nodes.filter(nestedNode => nestedNode.type === 'ObjectExpression');
    if (objectExpressions.some(objectNode => Boolean(objectNode.properties.length))) {
        return SINGLE_LINE_ERROR_MESSAGES[ERROR_TYPE.COUNT_NESTED_OBJECT_PROPERTIES];
    }
}

function report(context, node, messages = []) {
    messages.forEach(message => context.report({ message, node }));
}