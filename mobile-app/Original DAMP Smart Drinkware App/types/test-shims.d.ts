// Lightweight shims for test-only modules and custom Jest matchers
declare module 'reassure' {
  export function configure(...args: any[]): void;
  export function measureRenders(...args: any[]): any;
}

declare module '@axe-core/react-native' {
  export function configureAxe(...args: any[]): void;
  export type RunOptions = any;
  export type Result = any;
  export type AxeResults = any;
}

declare module '@/lib/supabase' {
  export const supabase: any;
}

// Augment Jest matchers with testing utilities used in performance tests
declare namespace jest {
  interface Matchers<R> {
    toBeWithinRange(min: number, max: number): R;
    toBeWithinPerformanceBenchmark(expected: number): R;
    toHaveReasonableMemoryUsage(): R;
    toHaveAcceptableFPS(): R;
    toBeAccessible(): R;
  }
}

// Provide a minimal global augmentation for Buffer in test runtime
declare global {
  var Buffer: any;
}

export {};
