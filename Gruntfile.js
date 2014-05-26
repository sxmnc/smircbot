module.exports = function (grunt) {

  var files = [
    'core/*.js',
    'plugins/*.js',
    'Gruntfile.js',
    'launch.js',
  ];

  grunt.initConfig({
    jshint: {
      src: files,
      options: {
        node: true,
        bitwise: true,
        eqeqeq: true,
        forin: true,
        latedef: true,
        newcap: true,
        noarg: true,
        nonbsp: true,
        nonew: true,
        undef: true,
        unused: 'vars',
        trailing: true,
        evil: true,
      },
    },
    jscs: {
      src: files,
      options: {
        additionalRules: ['node_modules/jscs-trailing-comma/rules/*.js'],
        requireCurlyBraces: [
          'if', 'else', 'for', 'while', 'do',
          'try', 'catch', 'case', 'default',
        ],
        requireSpaceAfterKeywords: [
          'if', 'else', 'for', 'while', 'do',
          'switch', 'return', 'try', 'catch',
        ],
        requireSpaceBeforeBlockStatements: true,
        requireParenthesesAroundIIFE: true,
        requireSpacesInConditionalExpression: {
          afterTest: true,
          beforeConsequent: true,
          afterConsequent: true,
          beforeAlternate: true,
        },
        requireSpacesInAnonymousFunctionExpression: {
          beforeOpeningRoundBrace: true,
        },
        disallowSpacesInNamedFunctionExpression: {
          beforeOpeningRoundBrace: true,
        },
        disallowSpacesInFunctionDeclaration: {
          beforeOpeningRoundBrace: true,
        },
        requireBlocksOnNewline: 1,
        disallowSpacesInsideObjectBrackets: true,
        disallowSpacesInsideArrayBrackets: true,
        disallowSpacesInsideParentheses: true,
        disallowQuotedKeysInObjects: true,
        disallowDanglingUnderscores: true,
        disallowSpaceAfterObjectKeys: true,
        requireCommaBeforeLineBreak: true,
        disallowSpaceAfterPrefixUnaryOperators: [
          '++', '--', '+', '-', '~', '!',
        ],
        disallowSpaceBeforePostfixUnaryOperators: ['++', '--'],
        requireSpaceBeforeBinaryOperators: [
          '?', '=', '+', '-', '/', '*', '==',
          '===', '!=', '!==', '>', '>=', '<', '<=',
        ],
        requireSpaceAfterBinaryOperators: [
          '?', '=', '+', '-', '/', '*', '==',
          '===', '!=', '!==', '>', '>=', '<', '<=',
        ],
        requireCamelCaseOrUpperCaseIdentifiers: true,
        disallowKeywords: ['with'],
        validateLineBreaks: 'LF',
        validateQuoteMarks: {mark: "'", escape: true},
        validateIndentation: 2,
        disallowMixedSpacesAndTabs: true,
        disallowTrailingWhitespace: true,
        disallowKeywordsOnNewLine: ['else'],
        requireLineFeedAtFileEnd: true,
        maximumLineLength: 80,
        requireCapitalizedConstructors: true,
        requireDotNotation: true,
        disallowYodaConditions: true,
        requireTrailingCommaInExpandedLiterals: {
          inArrays: true,
          inObjects: true,
        },
        disallowTrailingCommaInCollapsedLiterals: {
          inArrays: true,
          inObjects: true,
        },
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jscs-checker');

  grunt.registerTask('default', ['jshint', 'jscs']);
};
