import React from 'react';

declare module 'expo' {
  export function registerRootComponent<P = {}>(component: React.ComponentType<P>): void;
}
