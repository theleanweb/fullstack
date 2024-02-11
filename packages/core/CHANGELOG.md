# @leanweb/fullstack

## 0.2.0

### Minor Changes

- e77e0fe: Include child components html assets in build mode

### Patch Changes

- e77e0fe: Fix dev preprocessor breaking svelte component style processing

## 0.1.5

### Patch Changes

- e08a83b: Fix serving of CSS assets during dev mode
- 7f34787: Attach asset file reference to non-ssr components during dev

## 0.1.4

### Patch Changes

- 6d5e505: Handle mustache attributes on assets

## 0.1.3

### Patch Changes

- 238600f: Fix build

## 0.1.3

### Patch Changes

- 861f6ab: Make the asset reference parser in dev mode use the svelte parser to avoid closing components as self closing tags and mismatch between svelte syntax and standard HTML syntax
- 861f6ab: Export standalone HTML module

## 0.1.2

### Patch Changes

- 48b0e5c: Use vite asset build directory instead of our custom build directory

## 0.1.1

### Patch Changes

- 91e1d71: Fix missing ssr module type import

## 0.1.0

### Minor Changes

- 78c22ec: Add preview server

### Patch Changes

- f533507: Properly encode and decode HTML JSON data
- de557fc: Fix missing types file for ssr declaration file
- c5b13e1: Handle user app error during dev mode

## 0.0.2

### Patch Changes

- 18518df: Fix Typescript unable to resolve Svelte SSR module imports
- 718ed57: polyfill web apis on unsupported nodejs versions

## 0.0.1

### Patch Changes

- e835a03: fix: throw when given a valid ssr component
