import { IconComponent } from '@ui/display/icon/types/IconComponent';

export enum SelectionType {
  Navigate = 'Navigate',
  Create = 'Create',
}

export type Command = {
  id: string;
  to: string;
  label: string;
  type: SelectionType.Navigate | SelectionType.Create;
  Icon?: IconComponent;
  firstHotKey?: string;
  secondHotKey?: string;
  onCommandClick?: () => void;
};
