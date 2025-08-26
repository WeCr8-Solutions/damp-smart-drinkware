// Top-level types entry to force-load project-specific overrides.
// This ensures our permissive override for `react-native-ble-plx` is used
// before any other ambient declaration that might come from node_modules.
/// <reference path="./react-native-ble-plx-override.d.ts" />

// Re-export other local shims so TypeScript picks them up from typeRoots
/// <reference path="./react-native-shim.d.ts" />
/// <reference path="./test-shims.d.ts" />
/// <reference path="./buffer-overrides.d.ts" />

export {};
