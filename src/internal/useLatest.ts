import {useRef} from 'react';

const useLatest = <T>(value: T): {readonly current: T} => {
  const ref = useRef(value);
  // eslint-disable-next-line @eslint-react/refs -- intentional latest-value ref kept in sync during render
  ref.current = value;
  return ref;
};

export default useLatest;
