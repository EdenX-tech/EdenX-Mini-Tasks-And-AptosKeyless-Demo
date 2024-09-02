module.exports = {
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    extends: [
        'plugin:vue/recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    rules: {
        // 自定义规则
    },
};