import { Decorator, Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { ComponentDecorator } from 'twenty-ui';

import { SettingsAccountsEmailsBlocklistInput } from '@/settings/accounts/components/SettingsAccountsEmailsBlocklistInput';

const updateBlockedEmailListJestFn = fn();

const ClearMocksDecorator: Decorator = (Story, context) => {
  if (context.parameters.clearMocks === true) {
    updateBlockedEmailListJestFn.mockClear();
  }
  return <Story />;
};

const meta: Meta<typeof SettingsAccountsEmailsBlocklistInput> = {
  title:
    'Modules/Settings/Accounts/Blocklist/SettingsAccountsEmailsBlocklistInput',
  component: SettingsAccountsEmailsBlocklistInput,
  decorators: [ComponentDecorator, ClearMocksDecorator],
  args: {
    updateBlockedEmailList: updateBlockedEmailListJestFn,
    blockedEmailOrDomainList: [],
  },
  argTypes: {
    updateBlockedEmailList: { control: false },
  },
  parameters: {
    clearMocks: true,
  },
};

export default meta;
type Story = StoryObj<typeof SettingsAccountsEmailsBlocklistInput>;

export const Default: Story = {};

export const AddToBlocklist: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(updateBlockedEmailListJestFn).toHaveBeenCalledTimes(0);

    const addToBlocklistInput = canvas.getByRole('textbox');

    await userEvent.type(addToBlocklistInput, 'test@twenty.com');

    const addToBlocklistButton = canvas.getByRole('button', {
      name: /add to blocklist/i,
    });

    await userEvent.click(addToBlocklistButton);

    expect(updateBlockedEmailListJestFn).toHaveBeenCalledTimes(1);
    expect(updateBlockedEmailListJestFn).toHaveBeenCalledWith(
      'test@twenty.com',
    );
  },
};
