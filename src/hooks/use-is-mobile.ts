import * as React from 'react';
import { MOBILE_BREAKPOINT } from '../constants/base.constants';

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
    );

    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    mediaQuery.addEventListener('change', onChange);

    onChange();

    return () => {
      mediaQuery.removeEventListener('change', onChange);
    };
  }, []);

  return !!isMobile;
}
