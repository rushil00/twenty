/* eslint-disable simple-import-sort/imports */
/* eslint-disable @nx/workspace-matching-state-variable */
import { SelectionListState } from '@/selection-menu-new/states/selectionListState';
import { LightButton } from '@/ui/input/button/components/LightButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import styled from '@emotion/styled';
import {
  IconDownload,
  IconTrash,
} from '@ui/display/icon/components/TablerIcons';
import { useRecoilState } from 'recoil';

type AttachmentDropdownProps = {
  onDownload: () => void;
  onDelete: () => void;
  scopeKey: string;
};

export const StyledControlContainer = styled.div<{ disabled?: boolean }>`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  box-sizing: border-box;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ disabled, theme }) =>
    disabled ? theme.font.color.tertiary : theme.font.color.primary};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ theme }) => theme.spacing(8)};
  justify-content: space-between;
  padding: 8px ${({ theme }) => theme.spacing(2)};
  margin-top: 16px;
  width: 300px;
  justify-content: center;
`;

type optionType = { name: string; methods: object };
type SelectionDropDownProps = {
  dropDownId: string;
  ButtonText?: string;
  options?: optionType[];
};

export const SelectionDropDown = ({
  dropDownId,
  ButtonText,
  options,
}: SelectionDropDownProps) => {
  dropDownId = `selection-dropdown-${dropDownId}`;
  const { closeDropdown } = useDropdown(dropDownId);
  const selectControl = (
    <StyledControlContainer>{ButtonText}</StyledControlContainer>
  );

  // console.log(dropDownId)

  const deleteComp = (
    <DropdownMenu width="160px">
      <DropdownMenuItemsContainer>
        <MenuItem
          text="Download"
          LeftIcon={IconDownload}
          onClick={() => console.log('DownloadOnclick')}
        />
        <MenuItem
          text="Delete"
          accent="danger"
          LeftIcon={IconTrash}
          onClick={() => console.log('DeleteOnclick')}
        />
      </DropdownMenuItemsContainer>
    </DropdownMenu>
  );
  const StyledComboInputContainer = styled.div`
    display: flex;
    flex-direction: row;
    > * + * {
      margin-left: ${({ theme }) => theme.spacing(4)};
    }
  `;

  const [selectedOptions, setSelectedOptions] =
    useRecoilState(SelectionListState);

  // Function to handle checkbox change
  const handleCheckboxChange = (option: string) => {
    const selectedIndex = selectedOptions.indexOf(option);
    if (selectedIndex === -1) {
      // If option is not already selected, add it to selectedOptions
      setSelectedOptions([...selectedOptions, option]);
    } else {
      // If option is already selected, remove it from selectedOptions
      const updatedOptions = [...selectedOptions];
      updatedOptions.splice(selectedIndex, 1);
      setSelectedOptions(updatedOptions);
    }
  };
  // console.log(selectedOptions)

  const dropDownOptions = (
    <DropdownMenu width="160px">
      <DropdownMenuItemsContainer key={dropDownId}>
        {options?.map((option, index) => (
          <StyledComboInputContainer
            key={dropDownId + '-' + option.name.replace(/ /g, '-')}
          >
            <input
              type="checkbox"
              value={option.name}
              checked={selectedOptions.includes(option.name)}
              onChange={() => handleCheckboxChange(option.name)}
            />
            <LightButton key={index} title={option.name} />
          </StyledComboInputContainer>
        ))}
      </DropdownMenuItemsContainer>
    </DropdownMenu>
  );

  return (
    <>
      <Dropdown
        dropdownId={dropDownId}
        dropdownPlacement="bottom-start"
        clickableComponent={selectControl}
        dropdownComponents={dropDownOptions}
        dropdownHotkeyScope={{
          scope: dropDownId,
        }}
      />
    </>
  );
};
