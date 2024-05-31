import { Injectable, Inject } from '@nestjs/common';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { CVProcessingJobMQ } from 'src/modules/gpt-requests/consumers/gpt-requests-partial.job';
import {
  CVProcessingJobMQData,
  //   CVProcessingJobMQ,
  CVProcessingJobMQData2,
} from 'src/modules/gpt-requests/gpt-requests.service';

@Injectable({})
export class CVProcessingEnqueue {
  constructor(
    @Inject(MessageQueue.cvProcessesToDbQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async addToMyQueue() {
    await this.messageQueueService.add<CVProcessingJobMQData>(
      CVProcessingJobMQ.name, // This is the job token/name
      {
        data: {
          question:
            '- Could it be a continuous operations or a batch operations? Expected Answer- continuous manufacturing process\n- Could it be having large mechanical static equipment? Expected Answer- has large conveyors, belts\n- Does the processes have hazardous waste substances, like in chemical industry? Expected Answer- has experience with hazardous chemical waste \n- Do they have experience in handling multi site operations? Expected Answer: Likely has multi site operations experience',
        },
      }, // This is a MyAwesomeJobData payload
    );
  }

  async addToMyQueueStructured(record, promptStructured) {
    await this.messageQueueService.add<CVProcessingJobMQData2>(
      CVProcessingJobMQ.name,
      {
        data: {
          record: record,
          prompt: promptStructured,
        },
      },
    );

    return;
  }
}
