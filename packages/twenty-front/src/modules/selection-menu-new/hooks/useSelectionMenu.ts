/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';

import { isSelectionMenuOpenedState } from '../states/isSelectionMenuOpenedState';

export const useSelectionMenu = () => {
  const navigate = useNavigate();
  const setIsSelectionMenuOpened = useSetRecoilState(
    isSelectionMenuOpenedState,
  );
  const { resetSelectedItem } = useSelectableList('command-menu-list');
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();
  // console.log('selection useCommandMenu')
  const openSelectionMenu = useCallback(() => {
    setIsSelectionMenuOpened(true);
    setHotkeyScopeAndMemorizePreviousScope(AppHotkeyScope.CommandMenuOpen);
  }, [setHotkeyScopeAndMemorizePreviousScope, setIsSelectionMenuOpened]);

  const closeSelectionMenu = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const isCommandMenuOpened = snapshot
          .getLoadable(isSelectionMenuOpenedState)
          .getValue();

        if (isCommandMenuOpened) {
          setIsSelectionMenuOpened(false);
          resetSelectedItem();
          goBackToPreviousHotkeyScope();
        }
      },
    [goBackToPreviousHotkeyScope, resetSelectedItem, setIsSelectionMenuOpened],
  );

  const toggleSelectionMenu = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const isCommandMenuOpened = snapshot
          .getLoadable(isSelectionMenuOpenedState)
          .getValue();

        set(commandMenuSearchState, '');

        if (isSelectionMenuOpenedState) {
          closeSelectionMenu();
        } else {
          openSelectionMenu();
        }
      },
    [closeSelectionMenu, openSelectionMenu],
  );

  // const onItemClick = useCallback(
  //   (onClick?: () => void, to?: string) => {
  //     toggleSelectionMenu();

  //     if (isDefined(onClick)) {
  //       onClick();
  //       return;
  //     }
  //     if (isNonEmptyString(to)) {
  //       navigate(to);
  //       return;
  //     }
  //   },
  //   [navigate, toggleSelectionMenu],
  // );

  return {
    openSelectionMenu,
    closeSelectionMenu,
    // toggleSelectionMenu,
    // onItemClick,
  };
};
