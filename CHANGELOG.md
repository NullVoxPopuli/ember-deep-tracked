# Changelog

## Release (2024-09-05)

ember-deep-tracked 2.0.1 (patch)

#### :bug: Bug Fix
* `ember-deep-tracked`, `test-app`
  * [#357](https://github.com/NullVoxPopuli/ember-deep-tracked/pull/357) Fix dynamic usage of Array.prototype.includes ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :house: Internal
* `test-app`
  * [#356](https://github.com/NullVoxPopuli/ember-deep-tracked/pull/356) Use better types ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `ember-deep-tracked`
  * [#355](https://github.com/NullVoxPopuli/ember-deep-tracked/pull/355) Broaden Support (forward) ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* Other
  * [#353](https://github.com/NullVoxPopuli/ember-deep-tracked/pull/353) npx create-release-plan-setup@latest --update ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#352](https://github.com/NullVoxPopuli/ember-deep-tracked/pull/352) Upgrade to pnpm 9 ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

# [2.0.0](https://github.com/NullVoxPopuli/ember-deep-tracked/compare/v1.3.14...v2.0.0) (2022-08-21)


### chore

* change ember support ([0a570f8](https://github.com/NullVoxPopuli/ember-deep-tracked/commit/0a570f80820f8c350ed79ba91f1d80fb8299c3f5))
* **support:** changes to minimum supported peers ([5916eca](https://github.com/NullVoxPopuli/ember-deep-tracked/commit/5916eca51c99c09ac9882cefead0ecb6f787847a))


### BREAKING CHANGES

* minimum supporetd ember-source is now 3.25
* **support:** typescript and ember-auto-import changes
 - ember-auto-import v2+ is now required for consuming apps
 - typescript < 4.5 is no longer supported. Currently supported
   typescript is 4.5, 4.6, 4.7
