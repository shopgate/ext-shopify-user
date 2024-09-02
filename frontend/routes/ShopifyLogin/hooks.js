import { useEffect } from 'react';
import { useTheme } from '@shopgate/engage/core';

/**
 * Hide the iOS theme TabBar when the component mounts, and show it again, when it unmounts.
 */
export const useTabBarToggle = () => {
  const { TabBar } = useTheme();

  useEffect(() => {
    if (!TabBar) {
      return null;
    }

    TabBar.hide();

    return () => {
      TabBar.show();
    };
  }, [TabBar]);
};

