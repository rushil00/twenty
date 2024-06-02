/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable } from '@nestjs/common';

import { OpenAI } from '@langchain/openai';
import { LLMChain } from 'langchain/chains';
import { PromptTemplate } from '@langchain/core/prompts';
import axios from 'axios';
// import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { CVProcessingEnqueue } from 'src/modules/gpt-requests/producers/gpt-requests-partial.command';
import { CustomPrompt } from 'src/modules/gpt-requests/modules/custom-prompt';

import {
  MENU_OPTIONS_EXEC,
  enrichmentArgTypes,
  // selectedRecordDataToSendType,
} from './constants/gpt-enrichment-constants';

export type CVProcessingJobMQData = {
  data: {
    question: string;
    path?: string;
  };
};
export type CVProcessingJobMQData2 = {
  data: {
    prompt: any;
    record: any;
  };
};
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

@Injectable({})
export class GPTAPIService {
  constructor(
    @Inject(MessageQueue.cvProcessesToDbQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async pythonEnrich(rawData: object): Promise<any> {
    const response = await axios.post('http://localhost:5050/enrich', rawData);

    return response.data;
  }

  async gptEnrich(
    options: string[] = [],
    selectedRecords: any[],
  ): Promise<any> {
    const optionsAndArgs = MENU_OPTIONS_EXEC.map((menuOption) => {
      if (options.includes(menuOption.id)) {
        return menuOption;
      }
    });
    const resultantRecords = selectedRecords.map((selectedRecord) => {
      return {
        id: selectedRecord.id,
        data: {},
      };
    });
    const selectedRecordDataToSend = selectedRecords.map((selectedRecord) => {
      return {
        id: selectedRecord.id,
        name: selectedRecord.name,
        company: selectedRecord.company,
      };
    });

    // console.log(optionsAndArgs)
    for (const option of optionsAndArgs) {
      if (option) {
        const question = option.args.question;
        const idName = option.id;
        const optionsToPass = option.args.options;
        const response = await this.gptEnrichment({
          selectedRecords: selectedRecordDataToSend,
          options: optionsToPass,
          question: question,
          fieldName: idName,
        });

        for (let i = 0; i < resultantRecords.length; i++) {
          Object.assign(resultantRecords[i].data, {
            [idName]: response[i][idName],
          });
          // resultantRecords[i].data[`${idName}`] = response[i][idName];
        }
      } else {
        // throw error("There is a problem with Menu Options and the selection API!")
      }
    }

    return resultantRecords;
  }

  async gptEnrichment({
    selectedRecords = [],
    options = [],
    question,
    fieldName,
  }: enrichmentArgTypes) {
    const model = new OpenAI({
      temperature: 0,
      apiKey: OPENAI_API_KEY,
      maxTokens: -1,
    });

    const template =
      'For the given data you will make suitable enrichments; the data will be of a JSON Array form. You will output an array of same objects with only id and the suitable enriched properties for the object as required by the question. You shall populate the array with the suitable option iff options are provided. In case Options are not provided understand context from the question.\nData: {dataArray} \n Question: {question} \nOptions: {optionsString} \nKeep the name of the newly created property ONLY as {field_name}. GIVE THE OUTPUTS FOR ALL THE IDS and miss NOTHING.';

    const prompt = new PromptTemplate({
      template,
      inputVariables: ['question', 'optionsString', 'dataArray', 'field_name'],
    });
    const chain = new LLMChain({ llm: model, prompt });
    const result = await chain.call({
      question: question,
      optionsString: JSON.stringify(options),
      dataArray: JSON.stringify(selectedRecords),
      field_name: fieldName,
    });
    const resultString = result.text.replace(/\n\nOutput: /g, '');
    // console.log(resultString)
    const resultArray = JSON.parse(resultString);

    return resultArray;
  }

  async enrichData(options: string[], selectedRecords: any[]) {
    const gptEnrichmentOptions = [
      'gender',
      'nationality',
      'ethnicity',
      'education_type',
      'company_type',
      'industry',
      'companyPromoter',
    ];
    let gptEnrichmentResult = [];

    if (gptEnrichmentOptions && options) {
      const gptOptionsToSend = gptEnrichmentOptions && options;
      const selectedRecordDataToSend = selectedRecords.map((selectedRecord) => {
        return {
          id: selectedRecord.id,
          name: selectedRecord.name,
          company: selectedRecord.company,
        };
      });

      gptEnrichmentResult = await this.gptEnrich(
        gptOptionsToSend,
        selectedRecordDataToSend,
      );
    }

    const cvProcessingOptions = [
      'pg_spcialization',
      'ug_spcialization',
      'seniority',
      'function',
      'sub_function',
      'number_of_promotions',
      'company_score',
      'education_score',
    ];
    // ===================================================
    // Async version of the above code
    // ====================================================
    /*if (cvProcessingOptions && options) {
      const cvProcessingOptionsToSend = cvProcessingOptions && options;
      const selectedRecordDataToSend = selectedRecords.map(
        (selectedRecord) => ({
          id: selectedRecord.id,
          attachments: selectedRecord?.attachment ?? [], //TODO: get a getAttachment function here if possible
        }),
      );

      const optionsAndArgs = MENU_OPTIONS_EXEC.filter((menuOption) =>
        cvProcessingOptions.includes(menuOption.id),
      );

      const questions = optionsAndArgs.map((option) => option?.args.question);

      const promises = selectedRecordDataToSend.map(async (record) => {
        const cvProcess = new CVProcessing(record.attachments[0]?.fullPath);
        // await this.messageQueueService.add<CVProcessingJobMQData>(
        //   CVProcessingJobMQ.name, // This is the job token/name
        //   {
        //     data: {
        //       question: questions,
        //       path: record.attachments[0]?.fullPath,
        //     },
        //   }, // This is a MyAwesomeJobData payload
        // );

        return cvProcess.getAnswers(questions, cvProcessingOptionsToSend);
      });

      const responses = await Promise.all(promises);
      const res: any[] = responses;
    }*/

    return gptEnrichmentResult;
  }

  // TODO: TYPE DEFINITION for SELETED REORDS
  async customPromptEnrichment(selectedRecords, rawPrompt: string) {
    const customPrompt = new CustomPrompt(
      new CVProcessingEnqueue(this.messageQueueService),
    );
    const structuredPrompt =
      await customPrompt.pushPromptStructuredToDatabase(rawPrompt);

    Promise.all(
      selectedRecords.map((record) => {
        const cvProcessingEnqueue = new CVProcessingEnqueue(
          this.messageQueueService,
        );

        cvProcessingEnqueue.addToMyQueueStructured(record, structuredPrompt);
      }),
    );
  }
}
