import type {ReactNode} from 'react';

export default function isReactNode(node: ReactNode): boolean {
  return node != null && typeof node !== 'boolean';
}
