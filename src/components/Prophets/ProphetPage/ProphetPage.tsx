import { ProphetTeaserDesktop } from '../ProphetTeaserDesktop';
import { ProphetTeaserMobile } from '../ProphetTeaserMobile';

import React, { useCallback, useState, useEffect } from 'react';

interface ProphetPageProps {
  isMobile: boolean;
}

const ProphetTeaser = ({ isMobile }: ProphetPageProps) => {
  const [initialLoad, setInitialLoad] = useState(true);
  const [smallScreen, setSmallScreen] = useState(false);

  const windowResizeHandler = useCallback((e) => {
    setSmallScreen(e.matches);
  }, []);

  useEffect(() => {
    if (initialLoad) {
      setSmallScreen(window.innerWidth < 1200);
      setInitialLoad(false);
    }
    window.matchMedia('(max-width: 1240px)').addListener(windowResizeHandler);
  }, [initialLoad, windowResizeHandler]);

  return <>{smallScreen || isMobile ? <ProphetTeaserMobile /> : <ProphetTeaserDesktop />}</>;
};

export default React.memo(ProphetTeaser);
