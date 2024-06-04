import { Module } from '@nestjs/common';

import { CVProcessing } from 'src/modules/gpt-requests/modules/cv-processing';
import { CVProcessingEnqueue } from 'src/modules/gpt-requests/producers/gpt-requests-partial.command';
import { CustomPrompt } from 'src/modules/gpt-requests/modules/custom-prompt';
import { CVProcessingJobMQ } from 'src/modules/gpt-requests/consumers/gpt-requests-partial.job';
import { ResumeToRecordCreationService } from 'src/modules/gpt-requests/services/resume-processing.service';

import { GPTAPIController } from './gpt-requests.controller';

import {
  // CVProcessingJobMQ,
  // CVProcessingEnqueue,
  GPTAPIService,
  // CustomPrompt,
} from './services/gpt-requests.service';

@Module({
  imports: [],
  exports: [
    // CVProcessing,
    GPTAPIService,
    CVProcessingJobMQ,
    CVProcessingEnqueue,
    ResumeToRecordCreationService,
  ],
  providers: [
    GPTAPIService,
    CVProcessing,
    CVProcessingJobMQ,
    CVProcessingEnqueue,
    CustomPrompt,
    ResumeToRecordCreationService,
  ],
  controllers: [GPTAPIController],
})
export class GPTAPIModule {}
