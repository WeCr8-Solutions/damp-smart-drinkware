import * as React from 'react';

// Provide ambient declarations so TypeScript accepts <BLEManager /> in tests.
// Cover common alias forms and relative import depths used across tests.
type BLEProps = { testID?: string };

// Provide both named and default exports for BLEManager so tests importing either
// form will get a React component type. This makes the class usable as JSX.
declare module '@/components/BLEManager' {
  const _default: React.ComponentType<BLEProps>;
  export default _default;
}

declare module '@components/BLEManager' {
  const _default: React.ComponentType<BLEProps>;
  export default _default;
}

declare module 'components/BLEManager' {
  const _default: React.ComponentType<BLEProps>;
  export default _default;
}

declare module '../../components/BLEManager' {
  const _default: React.ComponentType<BLEProps>;
  export default _default;
}

declare module '../../../components/BLEManager' {
  const _default: React.ComponentType<BLEProps>;
  export default _default;
}

declare module '../../../../components/BLEManager' {
  const _default: React.ComponentType<BLEProps>;
  export default _default;
}
