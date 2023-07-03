# @mozartspa/gqless-react

## 2.0.16

### Patch Changes

- 3f08372: publish fork
- 184a074: fix update loop https://github.com/PabloSzx/gqless/pull/223
- Updated dependencies [3f08372]
  - @mozartspa/gqless@2.0.15

## 2.0.15

### Patch Changes

- 4a3d5ef: fix useQuery's prepare update
- af6a437: - Rename `gqlessConfig` to `GQlessConfig` (so it's consistent with the new logo)
  - Rename `gqlessError` to `GQlessError`
  - Remove `endpoint` option from the configuration, and instead always defaults to introspection one
    - It's confusing why theres two of them, and the user can change it later by modifying the file anyway
- 4a3d5ef: fix args state usePaginatedQuery
- 4a3d5ef: detach react default retry in useMutation
- Updated dependencies [4a3d5ef]
- Updated dependencies [af6a437]
  - gqless@2.0.13

## 2.0.14

### Patch Changes

- f14df08: fix `forceUpdate` race condition
- Updated dependencies [c45ca0d]
  - gqless@2.0.12

## 2.0.13

### Patch Changes

- c25bb2e: [usePaginatedQuery] pause cache changes while merge

## 2.0.12

### Patch Changes

- c54375d: add "usePaginatedQuery" hook
- Updated dependencies [85a389c]
- Updated dependencies [cca9d02]
- Updated dependencies [0904297]
  - gqless@2.0.11

## 2.0.11

### Patch Changes

- c486bec: fix useTransactionQuery suspense & fetchPolicy
- Updated dependencies [65c4d32]
  - gqless@2.0.10

## 2.0.10

### Patch Changes

- Updated dependencies [6a9269f]
  - gqless@2.0.9

## 2.0.9

### Patch Changes

- d78f2ab: fix useTransactionQuery
- Updated dependencies [c74442e]
- Updated dependencies [d78f2ab]
- Updated dependencies [0ffaa9d]
  - gqless@2.0.8

## 2.0.8

### Patch Changes

- 40d2101: allow specify proxies in useMetaState
- 63fd3ea: support for non-serializable variables
- Updated dependencies [ff66195]
- Updated dependencies [63fd3ea]
- Updated dependencies [40d2101]
  - gqless@2.0.7

## 2.0.7

### Patch Changes

- 173e11d: add subscriptions to events
- Updated dependencies [173e11d]
- Updated dependencies [c613410]
  - gqless@2.0.6

## 2.0.6

### Patch Changes

- Updated dependencies [6fef085]
  - gqless@2.0.5

## 2.0.5

### Patch Changes

- 2bf4ce2: add useQuery "prepare" helper
- Updated dependencies [2bf4ce2]
  - gqless@2.0.4

## 2.0.4

### Patch Changes

- 27f9ece: set "graphql" as optional peerDependency
- Updated dependencies [27f9ece]
  - gqless@2.0.3

## 2.0.3

### Patch Changes

- Updated dependencies [c06ef80]
  - gqless@2.0.2

## 2.0.2

### Patch Changes

- 5f29d52: change useQuery's "gqlessState" to "$state"

## 2.0.1

### Patch Changes

- a57cab4: official beta v2 publish
- Updated dependencies [a57cab4]
  - gqless@2.0.1
