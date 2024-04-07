module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
  },
  parser: "vue-eslint-parser",
  parserOptions: {
    ecmaVersion: "latest",
    parser: "@typescript-eslint/parser",
    sourceType: "module",
  },
  plugins: [
    "vue",
    "@typescript-eslint"
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/vue3-recommended",
  ],
  rules: {
    // override/add rules settings here, such as:
    "max-len": ["error", {code: 300}],
    "semi": ["warn", "always"],
    // 不能使用undefined
    "no-undefined": "error",
    // 变量初始化时不能直接给它赋值为undefined
    "no-undef-init": "error",
    "vue/no-unused-vars": "warn",
    // 不允许连续空格
    "no-multi-spaces": "error",
    // 空2格 switch case
    "indent": [ "error", 2, { "SwitchCase": 1 } ],
    // 对象大括号空格 {   a:b   } => { a:b }
    "object-curly-spacing": [ "error", "always" ],
    // 括号去除空格 foo(   'bar'   ) =>  foo('bar');
    "space-in-parens": [ "error", "never" ],
    // 对象分号前后只有一个空格{ "foo"  :    42 } => { "foo": 42 };
    "key-spacing": [ "error", { mode: "strict" } ],
    // 逗号前后的空格  [1,     2,  3  ,4] => [1, 2, 4, 4]
    "comma-spacing": [ "error", { "before": false, "after": true } ],
    // 括号内使用空格 [ 1,2   ] => [ 1,2 ]
    "array-bracket-spacing": [ "error", "always" ],
    // if else 风格
    "brace-style": [ "error", "1tbs" ],
    // 函数调用空格 fn  () => fn()
    "func-call-spacing": [ "error", "never" ],
    // 函数左括号空格 function name         () {} => function name(){}
    "space-before-function-paren": [ "error", "never" ],
    // 语句块的空格 function name() {} => function name(){}
    "space-before-blocks": [ "error", "never" ],
    // 关键字前后空格 if  () => if()
    "keyword-spacing": [ "error", {
      "overrides": {
        "if": { "after": false, before: false },
        "else": { "after": false, before: false },
      }
    } ],
    // 对象取值不能有空格 obj  .  foo => obj.foo
    "no-whitespace-before-property": "error",
    // 最大连续空行数
    "no-multiple-empty-lines": [ "error", { "max": 2, "maxEOF": 1, "maxBOF": 0 } ],
    // 代码块中去除前后空行
    "padded-blocks": [ "error", "never" ],
    // ;前后空格 var foo   ;   var bar; => var foo;var bar;
    "semi-spacing": [ "error", { "before": false, "after": false } ],
    // 操作符是否空格 a=0 => a = 0
    "space-infix-ops": "error",
    // 操作符空格 + -
    "space-unary-ops": "error",
    // 箭头函数空格 ()=>{}  => () => {}
    "arrow-spacing": [ "error", { "before": true, "after": true } ],
    // 扩展运算符 {... f} => {...f}
    "rest-spread-spacing": "error",
    // 字符串拼接使用模版字符串 'hello' + world => `hello${world}`
    "prefer-template": "off",
    // 模版字符串中去除空格 `${ fo  }` =>${fo}
    "template-curly-spacing": [ "error", "never" ],
    // 链式调用换行
    "newline-per-chained-call": [ "error", { "ignoreChainWithDepth": 1 } ],
    // 禁止重复模块导入
    "no-duplicate-imports": "error",
    // 注释开头添加空格
    "spaced-comment": [ "error", "always" ],
    // 使用双引号，字符串中包含了一个其它引号 允许"a string containing 'single' quotes"
    quotes: [ "warn", "double", { "avoidEscape": true } ],
    "no-else-return": "error",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    // 禁用组件名称必须多个单词的要求
    "vue/multi-word-component-names": "off", 
    // vue单行语句中每行最多允许100个属性，多行属性中每行一个属性
    "vue/max-attributes-per-line": ["error", {
      "singleline": {
        "max": 100
      },      
      "multiline": {
        "max": 1
      }
    }],
    // 一行中最多允许4个链式调用
    "newline-per-chained-call": ["error", { "ignoreChainWithDepth": 4 }],
  }
}
