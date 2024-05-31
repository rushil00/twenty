import { atom } from 'recoil';

export const SelectionListState = atom<string[]>({
  default: [],
  key: 'selectionListState',
});
