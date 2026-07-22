import type {ReactNode} from 'react';

export default function isNonEmptyReactNode(node: ReactNode): boolean {
  return node != null && typeof node !== 'boolean' && node !== '';
}
