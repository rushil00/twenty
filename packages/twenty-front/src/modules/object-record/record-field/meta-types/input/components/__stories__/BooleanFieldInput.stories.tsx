import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { useSetRecoilState } from 'recoil';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { FieldMetadataType } from '~/generated/graphql';

import { FieldContextProvider } from '../../../__stories__/FieldContextProvider';
import {
  BooleanFieldInput,
  BooleanFieldInputProps,
} from '../BooleanFieldInput';

const BooleanFieldValueSetterEffect = ({
  value,
  entityId,
}: {
  value: boolean;
  entityId: string;
}) => {
  const setField = useSetRecoilState(recordStoreFamilyState(entityId));

  useEffect(() => {
    setField({ id: entityId, Boolean: value, __typename: 'Person' });
  }, [entityId, setField, value]);

  return <></>;
};

type BooleanFieldInputWithContextProps = BooleanFieldInputProps & {
  value: boolean;
  entityId?: string;
};

const BooleanFieldInputWithContext = ({
  value,
  entityId,
  onSubmit,
}: BooleanFieldInputWithContextProps) => {
  return (
    <FieldContextProvider
      fieldDefinition={{
        defaultValue: false,
        fieldMetadataId: 'boolean',
        label: 'Boolean',
        iconName: 'Icon123',
        type: FieldMetadataType.Boolean,
        metadata: {
          fieldName: 'Boolean',
          objectMetadataNameSingular: 'person',
        },
      }}
      entityId={entityId}
    >
      <BooleanFieldValueSetterEffect value={value} entityId={entityId ?? ''} />
      <BooleanFieldInput onSubmit={onSubmit} testId="boolean-field-input" />
    </FieldContextProvider>
  );
};

const meta: Meta = {
  title: 'UI/Data/Field/Input/BooleanFieldInput',
  component: BooleanFieldInputWithContext,
  args: {
    value: true,
    entityId: 'id-1',
  },
};

export default meta;

type Story = StoryObj<typeof BooleanFieldInputWithContext>;

const submitJestFn = fn();

export const Default: Story = {};

export const Toggle: Story = {
  args: {
    onSubmit: submitJestFn,
  },
  argTypes: {
    onSubmit: {
      control: false,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByTestId('boolean-field-input');

    const trueText = await within(input).findByText('True');

    await expect(trueText).toBeInTheDocument();

    await expect(submitJestFn).toHaveBeenCalledTimes(0);

    await userEvent.click(input);

    await expect(input).toHaveTextContent('False');

    await expect(submitJestFn).toHaveBeenCalledTimes(1);

    await userEvent.click(input);

    await expect(input).toHaveTextContent('True');

    await expect(submitJestFn).toHaveBeenCalledTimes(2);
  },
};
