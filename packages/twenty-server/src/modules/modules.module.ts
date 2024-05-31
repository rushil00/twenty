import { Module } from '@nestjs/common';

import { CalendarModule } from 'src/modules/calendar/calendar.module';
import { CVProcessingJobMQ } from 'src/modules/gpt-requests/consumers/gpt-requests-partial.job';
import { GPTAPIModule } from 'src/modules/gpt-requests/gpt-requests.module';
import { MessagingModule } from 'src/modules/messaging/messaging.module';

@Module({
  imports: [MessagingModule, CalendarModule, GPTAPIModule],
  providers: [GPTAPIModule, CVProcessingJobMQ],
  exports: [GPTAPIModule, CVProcessingJobMQ],
})
export class ModulesModule {}
