/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable array-callback-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @nx/workspace-sort-css-properties-alphabetically */
/* eslint-disable no-empty */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
/* eslint-disable @nx/workspace-matching-state-variable */
import { useRef, useState } from 'react';
import styled from '@emotion/styled';
import axios, { AxiosResponse } from 'axios';
import { useRecoilState, useRecoilValue } from 'recoil';

// import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
// import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { useCreateOneFieldMetadataItem } from '@/object-metadata/hooks/useCreateOneFieldMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
// import { useObjectMetadataItemForSettings } from '@/object-metadata/hooks/useObjectMetadataItemForSettings';
// import { getDisabledFieldMetadataItems } from '@/object-metadata/utils/getDisabledFieldMetadataItems';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { findManyCandidates } from '@/selection-menu-new/hooks/useFindManyCandidates';
import { Button } from '@/ui/input/button/components/Button';
import { isProgressDrawerOpenState } from '@/ui/layout/progress-drawer/states/isRightDrawerOpenState';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { FieldMetadataType } from '~/generated-metadata/graphql';

// import { GPTAPIService } from '~/langchain-integration/langchain_initial';
// import { isRightDrawerOpenState } from '@/ui/layout/right-drawer/states/isRightDrawerOpenState';
import { MENU_OPTIONS, MENU_OPTIONS_EXEC } from '../constants/menuOptions';
import { useSelectionMenu } from '../hooks/useSelectionMenu';
import { isSelectionMenuOpenedState } from '../states/isSelectionMenuOpenedState';
import { SelectionListState } from '../states/selectionListState';

import { SelectionDropDown } from './dropdownSelection/DropDown';

type SelectionMenuProps = {
  selectedRecordIds: string[];
  objectNameSingular?: string;
};

/*type SelectedEnrichments = {
  names: string[];
};*/

export const StyledDialog = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.superHeavy};
  font-family: ${({ theme }) => theme.font.family};
  left: 50%;
  max-width: 640px;
  overflow: hidden;
  padding: 0;
  position: fixed;
  top: 30%;
  transform: ${() =>
    useIsMobile() ? 'translateX(-49.5%)' : 'translateX(-50%)'};
  width: ${() => (useIsMobile() ? 'calc(100% - 40px)' : '100%')};
  z-index: 1000;
`;

export const StyledInput = styled.input`
  background: ${({ theme }) => theme.background.secondary};
  border: 2;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 2;
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  margin: 0;
  outline: none;
  padding: ${({ theme }) => theme.spacing(5)};
  width: ${({ theme }) => `calc(100% - ${theme.spacing(40)})`};
  justify-content: center;
  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
  }
`;

const StyledCancelText = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-right: 12px;
  margin-top: 6px;
  position: absolute;
  right: 0;
  top: 0;
`;

export const StyledList = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  height: 560px;
  max-height: 560px;
  overscroll-behavior: contain;
  transition: 100ms ease;
  transition-property: height;
`;

export const StyledInnerList = styled.div`
  padding-left: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

export const StyledEmpty = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  height: 64px;
  justify-content: center;
  white-space: pre-wrap;
`;

const StyledGroup = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(1)};
  padding-top: ${({ theme }) => theme.spacing(2)};
  text-transform: uppercase;
  user-select: none;
`;

// styled button TODO (make different component)
const StyledButton = styled(Button)`
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing(4)};
  height: 48px;
  font-size: 16px;
`;

const StyledControlContainer = styled.div<{ disabled?: boolean }>`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent};
  /* border: 1px solid ${({ theme }) => theme.border.color.light}; */
  box-sizing: border-box;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ disabled, theme }) =>
    disabled ? theme.font.color.tertiary : theme.font.color.primary};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ theme }) => theme.spacing(8)};
  justify-content: space-between;
  padding: 20px ${({ theme }) => theme.spacing(2)};
  margin-top: 16px;
  width: 20%;
  justify-content: center;
`;

const StyledComboInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
  }
`;

export const SelectionMenu = ({
  selectedRecordIds,
  objectNameSingular = 'candidate',
}: SelectionMenuProps) => {
  const selectedIdsFilter = { id: { in: selectedRecordIds } };
  const { records: selectedRecords } = useFindManyRecords({
    objectNameSingular,
    filter: selectedIdsFilter,
    skip: !selectedRecordIds.length,
  });
  const { updateOneRecord } = useUpdateOneRecord({ objectNameSingular });
  const [customPromptInput, setCustomPromptInput] = useState('');

  const [isRightDrawerOpen, setIsRightDrawerOpen] = useRecoilState(
    isProgressDrawerOpenState,
  );

  const { closeSelectionMenu } = useSelectionMenu();
  const commandMenuRef = useRef<HTMLDivElement>(null);
  const isCommandMenuOpened = useRecoilValue(isSelectionMenuOpenedState);
  const [selectedOptions, setSelectedOptions] =
    useRecoilState(SelectionListState);

  useListenClickOutside({
    refs: [commandMenuRef],
    callback: () => {
      closeSelectionMenu();
      setSelectedOptions([]);
    },
  });

  const updateRecordEnriched = async (
    enrichedData: { id: string; data: object }[],
  ) => {
    const currentFieldsMetadata = Object.keys(selectedRecords[0]);
    const enrichmentFields = Object.keys(enrichedData[0].data);
    for (const key of enrichmentFields) {
      if (currentFieldsMetadata.includes(key)) {
      } else {
        const { createOneFieldMetadataItem } = useCreateOneFieldMetadataItem();
        createOneFieldMetadataItem({
          label: key,
          name: key,
          objectMetadataId: '',
          type: FieldMetadataType.Text,
        });
      }
    }
    for (const record of enrichedData) {
      updateOneRecord({
        idToUpdate: record.id,
        updateOneRecordInput: record.data,
      });
    }
  };

  const handleSelectionExecution = async () => {
    setIsRightDrawerOpen(true);
    const selectedOptionIds: string[] | undefined = [];
    MENU_OPTIONS_EXEC.map((option) => {
      if (selectedOptions.includes(option.name)) {
        selectedOptionIds.push(option.id);
      }
    });
    const endpointURL = `${REACT_APP_SERVER_BASE_URL}/gpt-api/enrichment`;
    const selectedRecordsDataToBeSent = selectedRecords.map(
      (selectedRecord) => {
        return {
          id: selectedRecord.id,
          name: {
            firstName: selectedRecord.name.firstName,
            lastName: selectedRecord.name.lastName,
          },
          company: selectedRecord.company.name,
          attachments: selectedRecord.attachments.edges.map(
            (attachment: { node: any }) => attachment?.node,
          ),
        };
      },
    );
    const requestBody = {
      rawData: selectedRecordsDataToBeSent,
      options: selectedOptionIds,
    };
    const response: AxiosResponse<any, any> = await axios.post(
      endpointURL,
      requestBody,
    );
    if (response) {
      await updateRecordEnriched(response.data);
    }
  };

  const handleCustomPromptInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setCustomPromptInput(event.target.value);
  };

  const handleCustomPromptExecution = async () => {
    const endpointURL = `${REACT_APP_SERVER_BASE_URL}/gpt-api/process-cv-mq`;
    const customPrompt = customPromptInput;
    const selectedRecords_ = await findManyCandidates(
      selectedRecords.map((record) => record.id),
    );
    const requestBody = {
      data: {
        customPrompt: customPrompt,
        records: await selectedRecords_,
      },
    };
    await axios.post(endpointURL, requestBody, {
      headers: {
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC0xYzI1LTRkMDItYmYyNS02YWVjY2Y3ZWE0MTkiLCJpYXQiOjE3MTY2NDEwNzIsImV4cCI6NDg3MDI0MTA3MSwianRpIjoiNjc4YTMyZTItOTkyZi00Y2MwLWI3NzEtMTAxMTMzYjk1OWU0In0.pN-tV6K06c0-owjI8byTsLnQhLHTbHooRLXgjDv7Wz4',
      },
    });
    // console.log(requestBody);
  };

  return (
    <>
      {isCommandMenuOpened && (
        <StyledDialog ref={commandMenuRef}>
          {/* <StyledInput
            autoFocus
            value={commandMenuSearch}
            placeholder="Search"
            onChange={handleSearchChange}
          /> */}
          <StyledCancelText>Esc to cancel</StyledCancelText>
          <StyledList>
            <ScrollWrapper>
              <StyledInnerList>
                <StyledGroup>
                  ABCD
                  {MENU_OPTIONS.map((selectMenu) => (
                    <StyledComboInputContainer key={selectMenu.name}>
                      <StyledControlContainer>
                        {selectMenu.name}
                      </StyledControlContainer>
                      <SelectionDropDown
                        dropDownId={selectMenu.name.replace(/ /g, '-')}
                        ButtonText={'Select'}
                        options={selectMenu.options}
                      />
                    </StyledComboInputContainer>
                  ))}
                  <StyledInput
                    placeholder="Input your custom prompt here!"
                    onChange={handleCustomPromptInputChange}
                  ></StyledInput>
                  <StyledButton
                    title="Execute"
                    // onClick={handleSelecctionExecution}
                    onClick={handleCustomPromptExecution}
                  />
                  {/* <StyledButton
                    title="Log the value"
                    // onClick={handleSelecctionExecution}
                    onClick={() => {
                      console.log(customPromptInput);
                    }}
                  /> */}
                  {/* <StyledComboInputContainer>
                    <StyledButton title='Estimate Gender' onClick={async () => {
                                                                    await updateGender(selectedRecords);
                                                                  }}/>
                  </StyledComboInputContainer> */}
                </StyledGroup>
                <StyledGroup>New Groups</StyledGroup>
              </StyledInnerList>
            </ScrollWrapper>
          </StyledList>
        </StyledDialog>
      )}
    </>
  );
};

// function updateOneRecord(arg0: { idToUpdate: string; updateOneRecordInput: { gender?: string; jobTitle?: string}; }) {
//   throw new Error('Function not implemented.');
// }
