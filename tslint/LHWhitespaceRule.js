"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable */
const utils = __importStar(require("tsutils"));
const typescript_1 = __importDefault(require("typescript"));
const Lint = __importStar(require("tslint"));
const OPTION_BRANCH = 'check-branch';
const OPTION_DECL = 'check-decl';
const OPTION_OPERATOR = 'check-operator';
const OPTION_MODULE = 'check-module';
const OPTION_SEPARATOR = 'check-separator';
const OPTION_REST_SPREAD = 'check-rest-spread';
const OPTION_TYPE = 'check-type';
const OPTION_TYPECAST = 'check-typecast';
const OPTION_TYPE_OPERATOR = 'check-type-operator';
const OPTION_PREBLOCK = 'check-preblock';
const OPTION_POSTBRACE = 'check-postbrace';
const OPTION_JSX_ATTRIBUTE = 'check-jsx-attribute';
class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile) {
        return this.applyWithFunction(sourceFile, walk, parseOptions(this.ruleArguments));
    }
}
Rule.metadata = {
    ruleName: 'lh-whitespace',
    description: 'Enforces whitespace style conventions.',
    rationale: 'Helps maintain a readable, consistent style in your codebase.',
    optionsDescription: Lint.Utils.dedent `
            Several arguments may be optionally provided:
            * \`"check-branch"\` checks branching statements (\`if\`/\`else\`/\`for\`/\`while\`) are followed by whitespace.
            * \`"check-decl"\`checks that variable declarations have whitespace around the equals token.
            * \`"check-operator"\` checks for whitespace around operator tokens.
            * \`"check-module"\` checks for whitespace in import & export statements.
            * \`"check-separator"\` checks for whitespace after separator tokens (\`,\`/\`;\`).
            * \`"check-rest-spread"\` checks that there is no whitespace after rest/spread operator (\`...\`).
            * \`"check-type"\` checks for whitespace before a variable type specification.
            * \`"check-typecast"\` checks for whitespace between a typecast and its target.
            * \`"check-type-operator"\` checks for whitespace between type operators \`|\` and \`&\`.
            * \`"check-preblock"\` checks for whitespace before the opening brace of a block.
            * \`"check-postbrace"\` checks for whitespace after an opening brace.
            * \`"${OPTION_JSX_ATTRIBUTE}"\` checks for whitespace in jsx attributes (currently for \`postbrace\` only)`,
    options: {
        type: 'array',
        items: {
            type: 'string',
            enum: [
                'check-branch',
                'check-decl',
                'check-operator',
                'check-module',
                'check-separator',
                'check-rest-spread',
                'check-type',
                'check-typecast',
                'check-type-operator',
                'check-preblock',
                'check-postbrace',
                OPTION_JSX_ATTRIBUTE
            ]
        },
        minLength: 0,
        maxLength: 11
    },
    optionExamples: [[true, 'check-branch', 'check-operator', 'check-typecast']],
    type: 'formatting',
    typescriptOnly: false,
    hasFix: true
};
Rule.FAILURE_STRING_MISSING = 'missing whitespace';
Rule.FAILURE_STRING_INVALID = 'invalid whitespace';
exports.Rule = Rule;
function parseOptions(ruleArguments) {
    return {
        branch: has(OPTION_BRANCH),
        decl: has(OPTION_DECL),
        operator: has(OPTION_OPERATOR),
        module: has(OPTION_MODULE),
        separator: has(OPTION_SEPARATOR),
        restSpread: has(OPTION_REST_SPREAD),
        type: has(OPTION_TYPE),
        typecast: has(OPTION_TYPECAST),
        typeOperator: has(OPTION_TYPE_OPERATOR),
        preblock: has(OPTION_PREBLOCK),
        postbrace: has(OPTION_POSTBRACE),
        jsxAttribute: has(OPTION_JSX_ATTRIBUTE)
    };
    function has(option) {
        return ruleArguments.indexOf(option) !== -1;
    }
}
function walk(ctx) {
    const { sourceFile, options } = ctx;
    typescript_1.default.forEachChild(sourceFile, function cb(node) {
        switch (node.kind) {
            case typescript_1.default.SyntaxKind.ArrowFunction:
                checkEqualsGreaterThanTokenInNode(node);
                break;
            // check for spaces between the operator symbol (except in the case of comma statements)
            case typescript_1.default.SyntaxKind.BinaryExpression: {
                const { left, operatorToken, right } = node;
                if (options.operator && operatorToken.kind !== typescript_1.default.SyntaxKind.CommaToken) {
                    checkForTrailingWhitespace(left.getEnd());
                    checkForTrailingWhitespace(right.getFullStart());
                }
                break;
            }
            case typescript_1.default.SyntaxKind.Block:
                if (options.preblock) {
                    checkForTrailingWhitespace(node.getFullStart());
                }
                break;
            // check for spaces between ternary operator symbols
            case typescript_1.default.SyntaxKind.ConditionalExpression:
                if (options.operator) {
                    const { condition, whenTrue } = node;
                    checkForTrailingWhitespace(condition.getEnd());
                    checkForTrailingWhitespace(whenTrue.getFullStart());
                    checkForTrailingWhitespace(whenTrue.getEnd());
                }
                break;
            case typescript_1.default.SyntaxKind.ConstructorType:
                checkEqualsGreaterThanTokenInNode(node);
                break;
            case typescript_1.default.SyntaxKind.ExportAssignment:
                if (options.module) {
                    const exportKeyword = node.getChildAt(0);
                    const position = exportKeyword.getEnd();
                    checkForTrailingWhitespace(position);
                }
                break;
            case typescript_1.default.SyntaxKind.ExportDeclaration:
                const { exportClause } = node;
                if (options.module && exportClause !== undefined) {
                    exportClause.elements.forEach((element, idx, arr) => {
                        if (idx === arr.length - 1) {
                            const token = exportClause.getLastToken();
                            checkForTrailingWhitespace(token.getFullStart());
                        }
                        if (idx === 0) {
                            const startPos = element.getStart() - 1;
                            checkForTrailingWhitespace(startPos, startPos + 1);
                        }
                    });
                }
                break;
            case typescript_1.default.SyntaxKind.FunctionType:
                checkEqualsGreaterThanTokenInNode(node);
                break;
            case typescript_1.default.SyntaxKind.ImportDeclaration: {
                const { importClause } = node;
                if (options.module && importClause !== undefined) {
                    // an import clause can have _both_ named bindings and a name (the latter for the default import)
                    // but the named bindings always come last, so we only need to check that for whitespace
                    let position;
                    const { namedBindings } = importClause;
                    if (namedBindings !== undefined) {
                        if (namedBindings.kind !== typescript_1.default.SyntaxKind.NamespaceImport) {
                            namedBindings.elements.forEach((element, idx, arr) => {
                                const internalName = element.name;
                                if (internalName !== undefined) {
                                    if (idx === arr.length - 1) {
                                        const token = namedBindings.getLastToken();
                                        checkForTrailingWhitespace(token.getFullStart());
                                    }
                                    if (idx === 0) {
                                        const startPos = element.getStart() - 1;
                                        checkForTrailingWhitespace(startPos, startPos + 1);
                                    }
                                }
                            });
                        }
                        position = namedBindings.getEnd();
                    }
                    else if (importClause.name !== undefined) {
                        position = importClause.name.getEnd();
                    }
                    if (position !== undefined) {
                        checkForTrailingWhitespace(position);
                    }
                }
                break;
            }
            case typescript_1.default.SyntaxKind.ImportEqualsDeclaration:
                if (options.module) {
                    const position = node.name.getEnd();
                    checkForTrailingWhitespace(position);
                }
                break;
            case typescript_1.default.SyntaxKind.TypeAssertionExpression:
                if (options.typecast) {
                    const position = node.expression.getFullStart();
                    checkForTrailingWhitespace(position);
                }
                break;
            case typescript_1.default.SyntaxKind.VariableDeclaration:
            case typescript_1.default.SyntaxKind.PropertyDeclaration:
                const { name, type, initializer } = node;
                if (options.decl && initializer !== undefined) {
                    checkForTrailingWhitespace((type !== undefined ? type : name).getEnd());
                }
                break;
            case typescript_1.default.SyntaxKind.BindingElement:
            case typescript_1.default.SyntaxKind.Parameter:
                const { dotDotDotToken } = node;
                if (options.restSpread && dotDotDotToken !== undefined) {
                    checkForExcessiveWhitespace(dotDotDotToken.end);
                }
                break;
            case typescript_1.default.SyntaxKind.SpreadAssignment:
            case typescript_1.default.SyntaxKind.SpreadElement:
                if (options.restSpread) {
                    const position = node.expression.getFullStart();
                    checkForExcessiveWhitespace(position);
                }
                break;
            case typescript_1.default.SyntaxKind.UnionType:
            case typescript_1.default.SyntaxKind.IntersectionType:
                if (options.typeOperator) {
                    const { types } = node;
                    types.forEach((typeNode, index) => {
                        if (index > 0) {
                            checkForTrailingWhitespace(typeNode.getFullStart());
                        }
                        if (index < types.length - 1) {
                            checkForTrailingWhitespace(typeNode.getEnd());
                        }
                    });
                }
        }
        typescript_1.default.forEachChild(node, cb);
    });
    let prevTokenShouldBeFollowedByWhitespace = false;
    utils.forEachTokenWithTrivia(sourceFile, (_text, tokenKind, range, parent) => {
        if (tokenKind === typescript_1.default.SyntaxKind.WhitespaceTrivia ||
            tokenKind === typescript_1.default.SyntaxKind.NewLineTrivia ||
            tokenKind === typescript_1.default.SyntaxKind.EndOfFileToken) {
            prevTokenShouldBeFollowedByWhitespace = false;
            return;
        }
        else if (prevTokenShouldBeFollowedByWhitespace) {
            addMissingWhitespaceErrorAt(range.pos);
            prevTokenShouldBeFollowedByWhitespace = false;
        }
        // check for trailing space after the given tokens
        switch (tokenKind) {
            case typescript_1.default.SyntaxKind.CatchKeyword:
            case typescript_1.default.SyntaxKind.ForKeyword:
            case typescript_1.default.SyntaxKind.IfKeyword:
            case typescript_1.default.SyntaxKind.SwitchKeyword:
            case typescript_1.default.SyntaxKind.WhileKeyword:
            case typescript_1.default.SyntaxKind.WithKeyword:
                if (options.branch) {
                    prevTokenShouldBeFollowedByWhitespace = true;
                }
                break;
            case typescript_1.default.SyntaxKind.CommaToken:
                if (options.separator) {
                    prevTokenShouldBeFollowedByWhitespace = true;
                }
                break;
            case typescript_1.default.SyntaxKind.SemicolonToken:
                if (!options.separator) {
                    break;
                }
                const nextPosition = range.pos + 1;
                const semicolonInTrivialFor = parent.kind === typescript_1.default.SyntaxKind.ForStatement &&
                    nextPosition !== sourceFile.end &&
                    (sourceFile.text[nextPosition] === ';' || sourceFile.text[nextPosition] === ')');
                if (!semicolonInTrivialFor) {
                    prevTokenShouldBeFollowedByWhitespace = true;
                }
                break;
            case typescript_1.default.SyntaxKind.EqualsToken:
                if (options.decl && parent.kind !== typescript_1.default.SyntaxKind.JsxAttribute) {
                    prevTokenShouldBeFollowedByWhitespace = true;
                }
                break;
            case typescript_1.default.SyntaxKind.ColonToken:
                if (options.type) {
                    prevTokenShouldBeFollowedByWhitespace = true;
                }
                break;
            case typescript_1.default.SyntaxKind.OpenBraceToken:
                const nextPos = range.pos + 1;
                if (options.postbrace &&
                    options.jsxAttribute || (parent.kind !== typescript_1.default.SyntaxKind.JsxExpression &&
                    parent.kind !== typescript_1.default.SyntaxKind.JsxAttribute &&
                    parent.kind !== typescript_1.default.SyntaxKind.JsxAttributes &&
                    parent.kind !== typescript_1.default.SyntaxKind.JsxSpreadAttribute) &&
                    (sourceFile.text[nextPos] !== ' ' &&
                        sourceFile.text[nextPos] !== '}' &&
                        sourceFile.text[nextPos] !== '\r' &&
                        sourceFile.text[nextPos] !== '\t' &&
                        sourceFile.text[nextPos] !== '\n')) {
                    addMissingWhitespaceErrorAt(nextPos);
                }
                break;
            case typescript_1.default.SyntaxKind.ImportKeyword:
                if (utils.isCallExpression(parent) && parent.expression.kind === typescript_1.default.SyntaxKind.ImportKeyword) {
                    return; // Don't check ImportCall
                }
                if (utils.isImportTypeNode(parent)) {
                    return; // Don't check TypeQuery
                }
            // falls through
            case typescript_1.default.SyntaxKind.ExportKeyword:
            case typescript_1.default.SyntaxKind.FromKeyword:
                if (options.typecast) {
                    prevTokenShouldBeFollowedByWhitespace = true;
                }
        }
    });
    function checkEqualsGreaterThanTokenInNode(node) {
        if (!options.operator) {
            return;
        }
        const equalsGreaterThanToken = utils.getChildOfKind(node, typescript_1.default.SyntaxKind.EqualsGreaterThanToken, sourceFile);
        // condition so we don't crash if the arrow is somehow missing
        if (equalsGreaterThanToken === undefined) {
            return;
        }
        checkForTrailingWhitespace(equalsGreaterThanToken.getFullStart());
        checkForTrailingWhitespace(equalsGreaterThanToken.getEnd());
    }
    function checkForTrailingWhitespace(position, whiteSpacePos = position) {
        if (position !== sourceFile.end && !Lint.isWhiteSpace(sourceFile.text.charCodeAt(position))) {
            addMissingWhitespaceErrorAt(whiteSpacePos);
        }
    }
    function addMissingWhitespaceErrorAt(position) {
        // TODO: this rule occasionally adds duplicate failures.
        if (ctx.failures.some(f => f.getStartPosition().getPosition() === position)) {
            return;
        }
        const fix = Lint.Replacement.appendText(position, ' ');
        ctx.addFailureAt(position, 1, Rule.FAILURE_STRING_MISSING, fix);
    }
    function checkForExcessiveWhitespace(position) {
        if (position !== sourceFile.end && Lint.isWhiteSpace(sourceFile.text.charCodeAt(position))) {
            addInvalidWhitespaceErrorAt(position);
        }
    }
    function addInvalidWhitespaceErrorAt(position) {
        const fix = Lint.Replacement.deleteText(position, 1);
        ctx.addFailureAt(position, 1, Rule.FAILURE_STRING_INVALID, fix);
    }
}
//# sourceMappingURL=LHWhitespaceRule.js.map