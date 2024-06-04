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
import { CandidatesEdge } from 'src/modules/gpt-requests/types/gpt-requests.service-types';
import { MENU_OPTIONS_EXEC } from 'src/modules/gpt-requests/constants/gpt-enrichment-constants';

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
    selectedRecords: CandidatesEdge[],
  ): Promise<any> {
    const optionsAndArgs = MENU_OPTIONS_EXEC.map((menuOption) => {
      if (options.includes(menuOption.id)) {
        return menuOption;
      }
    });
    const resultantRecords = selectedRecords.map((selectedRecord) => {
      return {
        id: selectedRecord.node.id,
        data: {},
      };
    });
    const selectedRecordDataToSend = selectedRecords.map((selectedRecord) => {
      return {
        id: selectedRecord.node.id,
        name: selectedRecord.node.name,
        // company: selectedRecord.person.node.company.name,
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
  }: any) {
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

  async enrichData(options: string[], selectedRecords: CandidatesEdge[]) {
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
          id: selectedRecord.node.id,
          name: selectedRecord.node.name,
          // company: selectedRecord.person.company.name,
        };
      });

      gptEnrichmentResult = await this.gptEnrich(
        gptOptionsToSend,
        selectedRecords,
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

    return gptEnrichmentResult;
  }

  // TODO: TYPE DEFINITION for SELETED REORDS
  async customPromptEnrichment(
    selectedRecords: CandidatesEdge[],
    rawPrompt: string,
  ) {
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
