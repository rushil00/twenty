import { DynamicStructuredTool } from '@langchain/core/tools';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

import { CREATE_ONE_PROMPT_QUESTION } from 'src/modules/gpt-requests/graphql/object-records/constants/record-mutations';
import { createRecord } from 'src/modules/gpt-requests/graphql/object-records/database-operations/create-record';
import { CVProcessingEnqueue } from 'src/modules/gpt-requests/producers/gpt-requests-partial.command';

export class CustomPrompt {
  constructor(private readonly cvProcessingEnqueue: CVProcessingEnqueue) {}

  async processRawPromptToStructuredPrompt(prompt = '') {
    const qnaToCategoryPrompt =
      'With the given Questions and Expected answers to be given respectively; Give a json array of objects response according to the schema provided following is/are the questions given. \n';

    const qnaModel = new ChatOpenAI({ temperature: 0, maxTokens: -1 });

    const qnaSchema = z.object({
      data: z.array(
        z
          .object({
            key: z
              .string()
              .describe(
                'Give a one word propertyName suitable with the question',
              ),
            question: z.string(),
            expectedAns: z.string(),
          })
          .describe(qnaToCategoryPrompt),
      ),
    });
    const toolForParse = new DynamicStructuredTool({
      name: 'responseTool',
      description: 'Returns response to the user',
      schema: qnaSchema,
      func: async ({ data }) => JSON.stringify(data),
    });
    const modelWithTools = qnaModel.bindTools([toolForParse]);
    const response = await modelWithTools.invoke(prompt);

    return response;
  }

  async pushPromptStructuredToDatabase(prompt) {
    // Step 1: Structure the incoming customPrompt of the data for making the required fields
    const structuredPrompts =
      await this.processRawPromptToStructuredPrompt(prompt);

    // let answerKeys;
    let questions;

    if (
      structuredPrompts.tool_calls &&
      structuredPrompts.tool_calls.length > 0
    ) {
      //   answerKeys = structuredPrompts.tool_calls[0].args?.data;
      questions = structuredPrompts.tool_calls[0].args.data.map((responses) => {
        return {
          question: responses.question,
          name: responses.key,
          expectedAnswer: responses.expectedAns,
        };
      });
    } else {
      //   answerKeys = [];
      //   questions = [];

      return {
        question: '',
        name: '',
        expectedAnswer: '',
      };
    }

    await Promise.all(
      questions.map((record) =>
        createRecord({
          query: CREATE_ONE_PROMPT_QUESTION,
          data: record,
        }),
      ),
    );

    return questions;
  }

  /*async getScoresFromCustomPrompt(data) {
    const prompt = data.customPrompt;
    const records = data.records;

    const structuredPrompt = this.pushPromptStructuredToDatabase(prompt);

    // send the strucutred prompt and records to a queue and the queue will asynchronously execute the requests.
    Promise.all(
      records.map((record) =>
        this.cvProcessingEnqueue.addToMyQueueStructured(
          record,
          structuredPrompt,
        ),
      ),
    );
  }*/
}
