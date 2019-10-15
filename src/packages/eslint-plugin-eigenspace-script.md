# README

## Eigenspace eslint plugin for scripts

Eigenspace\`s rules and configuration for web projects

## Project structure

We use same project structure as all plugin uses. Example of project structure can be found [there](https://github.com/DianaSuvorova/eslint-plugin-react-redux)

## Code writing guide

* [Scripts](https://github.com/eigen-space/codestyle/tree/dev/doc/scripts)

## Environmental requirements

* `eslint`: `5.x`

## Rules for ESLint

To use this set of rules you should add them to your config. In .eslintrc.js do following:

```text
module.exports = {
    extends: [
        'plugin:eigenspace-script/all'
    ]
};
```

## Configurations for development environments

### Why do we have that dependencies?

* `eslint-plugin-unicorn` - eslint rule package.

### Why do we have that dev dependencies?

* `@eigenspace/helper-scripts` - common scripts for dev. environment.
* `@types/*` - contains type definitions for specific library.
* `@typescript-eslint/experimental-utils` - using ast types
* `typescript` - is a superset of JavaScript that have static type-checking and ECMAScript features.
