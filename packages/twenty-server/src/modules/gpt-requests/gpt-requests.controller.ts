// get and post
import { Controller, Get, Post, Req } from '@nestjs/common';

import { findAllQuery } from 'src/modules/gpt-requests/graphql/object-records/database-operations/create-record';
import { FIND_MANY_PROMPT_ANSWERS_2 } from 'src/modules/gpt-requests/graphql/object-records/constants/record-queries';
import { CVProcessing } from 'src/modules/gpt-requests/modules/cv-processing';
import { CVProcessingEnqueue } from 'src/modules/gpt-requests/producers/gpt-requests-partial.command';
import { CustomPrompt } from 'src/modules/gpt-requests/modules/custom-prompt';
import { ResumeToRecordCreationService } from 'src/modules/gpt-requests/services/resume-processing.service';
import { updateCustomPromptCumulativeScore } from 'src/modules/gpt-requests/utils/update-custom-prompt-cumulative-score.util';

import { GPTAPIService } from './services/gpt-requests.service';

@Controller('gpt-api')
export class GPTAPIController {
  constructor(
    private gptAPIService: GPTAPIService,
    private readonly cvProcessingEnqueue: CVProcessingEnqueue,
    private readonly customPromptService: CustomPrompt,
    private readonly resumeProcessingService: ResumeToRecordCreationService,
    // @Inject(MessageQueue.cvProcessesToDbQueue)
    // private readonly messageQueueService: MessageQueueService,
  ) {}

  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }

  @Post('enrichment')
  get(@Req() req): object {
    return this.gptAPIService.enrichData(req.body.options, req.body.rawData);
  }

  @Post('process-cv')
  async getCVProcess(@Req() req): Promise<any> {
    const cvProcessingService = new CVProcessing(
      '/home/rushiil/Downloads/manufacturing-cvs/CHANDRA BHAN SINGH - Arxen Inc.docx',
    );

    // return;
    return await cvProcessingService.getScoresFromCustomPrompt({
      prompts: req.body.data.customPrompt,
      record: req.body.data.record,
    });
  }

  @Post('process-cv-mq')
  async getCVProcessMQ(@Req() request): Promise<void> {
    await this.gptAPIService.customPromptEnrichment(
      request.body.data.records,
      request.body.data.customPrompt,
    );
  }

  @Post('question-records')
  async createQuestionRecords(@Req() req) {
    return await this.customPromptService.pushPromptStructuredToDatabase(
      req.body.data.customPrompt,
    );
    // this.cvProcessingEnqueue.addToMyQueueStructured(req.body.data.records )
  }

  @Post('find-all-query')
  async findAllQuery() {
    return await findAllQuery({
      query: FIND_MANY_PROMPT_ANSWERS_2,
      variables: {},
    });
  }

  @Post('resume-structured')
  async executeResumeStructuring() {
    return await this.resumeProcessingService.mainExecutionNormal(
      '/home/rushiil/Downloads/manufacturing-cvs',
    );
  }

  @Post('update-custom-score')
  async executreCustomScoreCumulative() {
    return await updateCustomPromptCumulativeScore(
      'ada8e9c2-f92e-41ae-94dd-c9afbe60226c',
    );
  }
}
