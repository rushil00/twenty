import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { H2Title, IconCalendarEvent, IconMailCog } from 'twenty-ui';

import { SettingsNavigationCard } from '@/settings/components/SettingsNavigationCard';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { Section } from '@/ui/layout/section/components/Section';

const StyledCardsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(6)};
`;

export const SettingsAccountsSettingsSection = () => {
  const navigate = useNavigate();

  return (
    <Section>
      <H2Title
        title="Settings"
        description="Configure your emails and calendar settings."
      />
      <StyledCardsContainer>
        <SettingsNavigationCard
          Icon={IconMailCog}
          title="Emails"
          onClick={() =>
            navigate(getSettingsPagePath(SettingsPath.AccountsEmails))
          }
        >
          Set email visibility, manage your blocklist and more.
        </SettingsNavigationCard>
        <SettingsNavigationCard
          Icon={IconCalendarEvent}
          title="Calendar"
          onClick={() =>
            navigate(getSettingsPagePath(SettingsPath.AccountsCalendars))
          }
        >
          Configure and customize your calendar preferences.
        </SettingsNavigationCard>
      </StyledCardsContainer>
    </Section>
  );
};
