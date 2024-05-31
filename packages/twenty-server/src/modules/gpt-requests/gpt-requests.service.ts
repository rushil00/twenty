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
  selectedRecordDataToSendType,
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
    selectedRecords: selectedRecordDataToSendType[],
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

  async enrichData(
    options: string[],
    selectedRecords: selectedRecordDataToSendType[],
  ) {
    // let pythonEnrichmentOptions = ["distance","population","education_score","company_score"];
    // let pythonEnrichmentResult={}
    // if (pythonEnrichmentOptions && options){
    //     let pythonOptionsToSend =  pythonEnrichmentOptions && options;
    //     let rawData= {options: pythonOptionsToSend, selectedRecords:selectedRecords};
    //     pythonEnrichmentResult = await this.pythonEnrich(rawData);  // oputputs array of objects containing ids and enriched data
    // }

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

    /*
    if (cvProcessingOptions && options) {
      const cvProcessingOptionsToSend = cvProcessingOptions && options;
      const selectedRecordDataToSend = selectedRecords.map((selectedRecord) => {
        return {
          id: selectedRecord.id,
          attachments: selectedRecord?.attachment || [],
        };
      });
      const res = <any>[];
      const optionsAndArgs = MENU_OPTIONS_EXEC.map((menuOption) => {
        if (cvProcessingOptions.includes(menuOption.id)) {
          return menuOption;
        }
      });
      //we're sending all the questions for a single CV at once, to save on tokens
      const questions = optionsAndArgs.map((option) => {
        return option?.args.question;
      });

      for (const record of selectedRecordDataToSend) {
        const cvProcess = new CVProcessing(record.attachments[0]?.fullPath);
        const tempResponse = await cvProcess.getAnswers(
          questions,
          cvProcessingOptionsToSend,
        );

        res.push(tempResponse);
      }
    } 
    */

    // ===================================================
    // Async version of the above code
    // ====================================================
    /*if (cvProcessingOptions && options) {
      const cvProcessingOptionsToSend = cvProcessingOptions && options;
      const selectedRecordDataToSend = selectedRecords.map(
        (selectedRecord) => ({
          id: selectedRecord.id,
          attachments: selectedRecord?.attachment ?? [],
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

  async customPromptEnrichment(selectedRecords, rawPrompt) {
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

// integrated with another module! DONE
/*export class CustomPrompt {
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

    let answerKeys;
    let questions;

    if (
      structuredPrompts.tool_calls &&
      structuredPrompts.tool_calls.length > 0
    ) {
      answerKeys = structuredPrompts.tool_calls[0].args?.data;
      questions = structuredPrompts.tool_calls[0].args.data.map((responses) => {
        return {
          question: responses.question,
          name: responses.key,
          expectedAnswer: responses.expectedAns,
        };
      });
    } else {
      answerKeys = [];
      questions = [];

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

  async getScoresFromCustomPrompt(data) {
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
  }
}*/

// @Injectable({})
// integrated with another module! DONE
// export class CVProcessing {
//   path: string;
//   loadingPromise: Promise<void>;
//   loader: PDFLoader | DocxLoader;
//   doc: any;
//   chunks: any;
//   vectorStore: HNSWLib;
//   // private inputPromptProcessing = new CustomPrompt();
//   // TODO: change default path to something else!
//   constructor(
//     path = '/home/rushiil/Downloads/manufacturing-cvs/VIshal Sharma -Curriculum Vitae -2.pdf',
//   ) {
//     this.path = path;
//     // Call loaderFunc in the constructor
//     this.loadingPromise = this.loaderFunc();
//   }

//   async loaderFunc() {
//     if (extname(this.path.toLowerCase()) === '.pdf') {
//       this.loader = new PDFLoader(this.path);
//       const data = await this.loader.load();

//       this.doc = data;
//     } else if (extname(this.path.toLowerCase()) === '.docx') {
//       this.loader = new DocxLoader(this.path);
//       const data = await this.loader.load();

//       this.doc = data;
//     } else {
//       throw new Error(
//         'Unsupported file format. Only PDF and DOCX files are supported.',
//       );
//     }
//   }

//   async waitForLoad() {
//     await this.loadingPromise;
//   }

//   async splitDocAfterLoading() {
//     // Ensure that data is loaded before accessing it
//     await this.waitForLoad().then(async () => {
//       // const splitter = new RecursiveCharacterTextSplitter({
//       //   chunkSize: 1000,
//       //   chunkOverlap: 20,
//       // });
//       // this.chunks = await splitter.splitDocuments(this.doc);
//     });
//   }

//   async createEmbeddings() {
//     await this.splitDocAfterLoading().then(async () => {
//       // console.log(this.chunks);
//       const embeddings = new OpenAIEmbeddings(); //created embeddings
//       const vectorStore = await HNSWLib.fromDocuments(
//         //using HNSW vector store
//         this.doc,
//         embeddings,
//       );

//       this.vectorStore = vectorStore;
//     });
//   }

//   // INITIAL
//   /*getScoresPrimitive(field_options = <any>[]) {
//     this.createEmbeddings().then(async () => {
//       const questions: string[] = [];
//       const combinedParserObject: {
//         id: string;
//         question: string;
//         parserObject: z.ZodObject<z.ZodRawShape, any>;
//       }[] = [];

//       cvParsePrompts.forEach((cvParsePrompt) => {
//         if (field_options.includes(cvParsePrompt.id)) {
//           questions.push(cvParsePrompt.question);
//           combinedParserObject.push({
//             id: cvParsePrompt.id,
//             question: cvParsePrompt.question,
//             parserObject: cvParsePrompt.parserObject,
//           });
//         }
//       });
//       //TODO Add from here!
//       const masterZodObject = z.object({
//         ...combinedParserObject.reduce(
//           (acc, val) => ({ ...acc, ...val.shape }),
//           {},
//         ),
//       });
//       // const vectorStoreRetriever = this.vectorStore.asRetriever();
//       const model = new OpenAI({ temperature: 0, maxTokens: -1 });
//       const messages = [
//         SystemMessagePromptTemplate.fromTemplate(
//           'Answer the given question from the given context \nFormat Instructions: {format_instructions}\n context: {context}',
//         ),
//         HumanMessagePromptTemplate.fromTemplate('{question}'),
//       ];
//       const prompt = ChatPromptTemplate.fromMessages(messages);

//       const parser = StructuredOutputParser.fromZodSchema(masterZodObject);
//       const chain = RunnableSequence.from([prompt, model, parser]);
//       const response = await chain.invoke({
//         question: JSON.stringify(questions),
//         format_instructions: parser.getFormatInstructions(),
//         context: this.vectorStore?.docstore._docs.get('0').pageContent,
//       });

//       return response;
//     });
//   }*/

//   // async getScoresFromCustomPrompt(qna: string = '') {
//   //   // const start = performance.now();
//   //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   //   const output = await this.createEmbeddings().then(async () => {
//   //     // =============================================================
//   //     // STEP 1: Create the category string array from the questions
//   //     // ==============================================================
//   //     const qnaModel = new ChatOpenAI({ temperature: 0, maxTokens: -1 });
//   //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   //     const qnaToCategoryPrompt =
//   //       'With the given Questions and Expected answers to be given respectively; Give a json array of objects response according to the schema provided following is/are the questions given. \n';
//   //     const qnaSchema = z.object({
//   //       data: z.array(
//   //         z
//   //           .object({
//   //             key: z.string().describe(''),
//   //             question: z.string(),
//   //             expectedAns: z.string(),
//   //           })
//   //           .describe(qnaToCategoryPompt),
//   //       ),
//   //     });
//   //     // const toolForParse = new DynamicStructuredTool({
//   //     //   name: 'responseTool',
//   //     //   description: 'Returns response to the user',
//   //     //   schema: z.object({
//   //     //     data: z.array(
//   //     //       z
//   //     //         .object({
//   //     //           key: z
//   //     //             .string()
//   //     //             .describe(
//   //     //               'Give a one word propertyName suitable with the question',
//   //     //             ),
//   //     //           question: z.string(),
//   //     //           expectedAns: z.string(),
//   //     //         })
//   //     //         .describe(qnaToCategoryPrompt),
//   //     //     ),
//   //     //   }),
//   //     // });
//   //     type QuestionType = {
//   //       key: string;
//   //       question: string;
//   //       expectedAns: string;
//   //     };
//   //     const toolForParse = new DynamicStructuredTool({
//   //       name: 'responseTool',
//   //       description: 'Returns response to the user',
//   //       schema: qnaSchema,
//   //       func: async ({ data }) => {
//   //         return JSON.stringify(data);
//   //       },
//   //     });

//   //     const modelWithTools = qnaModel.bindTools([toolForParse]);
//   //     const response = await modelWithTools.invoke(qna);

//   //     return response;
//   //   }
//   // }

//   // async getScoresFromCustomPrompt(qna: string = '') {
//   //   const qnaModel = new ChatOpenAI({ temperature: 0, maxTokens: -1 });

//   //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   //   const questionSchema = z.object({
//   //     key: z.string(),
//   //     question: z.string(),
//   //     expectedAns: z.string(),
//   //   });

//   //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   //   type QuestionType = {
//   //     key: string;
//   //     question: string;
//   //     expectedAns: string;
//   //   };

//   //   const toolForParse = new DynamicStructuredTool({
//   //     name: 'responseTool',
//   //     description: 'Returns response to the user',
//   //     schema: z.object({
//   //       key: z.string(),
//   //       question: z.string(),
//   //       expectedAns: z.string(),
//   //     }),
//   //     func: async ({ data }) => {
//   //       return JSON.stringify(data);
//   //     },
//   //   });

//   //   const modelWithTools = qnaModel.bindTools([toolForParse]);
//   //   const response = await modelWithTools.invoke(qna);

//   //   return response;
//   // }

//   async processPromptToStructuredData(prompt = '') {
//     const output = async () => {
//       // ====================================================================
//       // STEP 1: Create the category string array from the questions
//       // ====================================================================
//       const qnaToCategoryPrompt =
//         'With the given Questions and Expected answers to be given respectively; Give a json array of objects response according to the schema provided following is/are the questions given. \n';

//       const qnaModel = new ChatOpenAI({ temperature: 0, maxTokens: -1 });

//       const qnaSchema = z.object({
//         data: z.array(
//           z
//             .object({
//               key: z
//                 .string()
//                 .describe(
//                   'Give a one word propertyName suitable with the question',
//                 ),
//               question: z.string(),
//               expectedAns: z.string(),
//             })
//             .describe(qnaToCategoryPrompt),
//         ),
//       });
//       const toolForParse = new DynamicStructuredTool({
//         name: 'responseTool',
//         description: 'Returns response to the user',
//         schema: qnaSchema,
//         func: async ({ data }) => JSON.stringify(data),
//       });
//       const modelWithTools = qnaModel.bindTools([toolForParse]);
//       const response = await modelWithTools.invoke(prompt);

//       return response;
//     };

//     return await output();
//   }

//   // INITIAL STRUCTURED QUESTIONS FROM CV FUNCTION
//   /*async askStructuredQuestionsFromCV2(responseArg: any) {
//     const output = await this.createEmbeddings().then(async () => {
//       // ====================================================================
//       // STEP 2: Create the category string array from the questions
//       // ====================================================================
//       const cvQNAModel = new ChatOpenAI({ temperature: 0, maxTokens: -1 });
//       const cvQNAPrompt = 'Questions: {questions}';
//       const CVData = this.vectorStore.docstore._docs.get('0')?.pageContent;
//       const cvDataPrompt = '\nCV Data: \n{CVData}';
//       const cvPrompt = [
//         SystemMessagePromptTemplate.fromTemplate(cvQNAPrompt),
//         HumanMessagePromptTemplate.fromTemplate(cvDataPrompt),
//       ];
//       let answerKeys: any;
//       let questions: any;
//       const cvPromptToSend = ChatPromptTemplate.fromMessages(cvPrompt);

//       if (responseArg.tool_calls && responseArg.tool_calls.length > 0) {
//         answerKeys = responseArg.tool_calls[0].args?.data;
//         questions = responseArg.tool_calls[0].args.data.map((responses) => {
//           return {
//             question: responses.question,
//             key: responses.key,
//           };
//         });
//       } else {
//         answerKeys = [];
//         questions = [];

//         return {
//           question: '',
//           name: '',
//           expectedAnswer: '',
//         };
//       }
//       // console.log(answerKeys);
//       const answerSchema = z.object(
//         Object.fromEntries(
//           answerKeys.map((fieldName, index) => [
//             fieldName.key,
//             z.object({
//               question: z.string().describe('asked question'),
//               response: z.string().describe('answer from CV'),
//             }), //.describe(`score to the contexts question wrt CV data`),
//           ]),
//         ),
//       );
//       //   console.log(zodToJsonSchema(answerSchema))
//       const scoreToolFunction = {
//         name: 'scoreTool',
//         description:
//           'Carefully analyse the CV data and answer the given questions in succint statement(s).',
//         parameters: zodToJsonSchema(answerSchema),
//       };
//       const runnable = createOpenAIFnRunnable({
//         functions: [scoreToolFunction],
//         llm: cvQNAModel,
//         prompt: cvPromptToSend,
//         enforceSingleFunctionUsage: true, // Default is true
//         outputParser: new JsonOutputFunctionsParser(),
//       });
//       const responseAns = await runnable.invoke({
//         CVData: CVData,
//         questions: JSON.stringify(questions),
//       });
//       // -------------------------------------------------------------

//       // console.log(responseAns);
//       const scoringData: {
//         key: any;
//         question: any;
//         idealAnswer: any;
//         givenAns: any;
//       }[] = [];

//       for (const res of responseArg.tool_calls[0].args.data) {
//         const tempVariable = {
//           key: res.key,
//           question: responseAns[res.key].question,
//           idealAnswer: res?.expectedAns || '',
//           givenAns: responseAns[res.key].response,
//         };

//         // console.log(tempVariable)
//         scoringData.push(tempVariable);
//       }

//       return { responseAns: responseAns, scoringData: scoringData };
//     });

//     return output;
//   }*/

//   async askStructuredQuestionsFromCV(promptStructured: any) {
//     const output = await this.createEmbeddings().then(async () => {
//       // ====================================================================
//       // STEP 2: Create the category string array from the questions
//       // ====================================================================
//       const cvQNAModel = new ChatOpenAI({ temperature: 0, maxTokens: -1 });
//       const cvQNAPrompt = '\nQuestions: {questions}';
//       const CVData = this.vectorStore.docstore._docs.get('0')?.pageContent;
//       const cvDataPrompt = '\nCV Data: \n{CVData}';
//       const cvPrompt = [
//         SystemMessagePromptTemplate.fromTemplate(cvQNAPrompt),
//         HumanMessagePromptTemplate.fromTemplate(cvDataPrompt),
//       ];
//       const questions = promptStructured.map((question) => {
//         return { question: question.question, key: question.key };
//       });

//       // console.log(promptStructured);
//       const cvPromptToSend = ChatPromptTemplate.fromMessages(cvPrompt);
//       const answerSchema = z.object(
//         Object.fromEntries(
//           promptStructured.map((prompt, index) => [
//             prompt.key,
//             z.object({
//               question: z.string().describe('asked question'),
//               response: z.string().describe('one line answer from CV'),
//             }), //.describe(`score to the contexts question wrt CV data`),
//           ]),
//         ),
//       );
//       //   console.log(zodToJsonSchema(answerSchema))
//       const scoreToolFunction = {
//         name: 'scoreTool',
//         description:
//           'Carefully analyse the CV data and answer the given questions in proper sentences.',
//         parameters: zodToJsonSchema(answerSchema),
//       };
//       const runnable = createOpenAIFnRunnable({
//         functions: [scoreToolFunction],
//         llm: cvQNAModel,
//         prompt: cvPromptToSend,
//         enforceSingleFunctionUsage: true, // Default is true
//         outputParser: new JsonOutputFunctionsParser(),
//       });
//       const responseAns = await runnable.invoke({
//         CVData: CVData,
//         questions: JSON.stringify(questions),
//       });

//       // console.log(responseAns);
//       // -------------------------------------------------------------

//       const scoringData: {
//         key: any;
//         question: any;
//         expectedAnswer: any;
//         candidateAnswer: any;
//       }[] = [];

//       for (const res of promptStructured) {
//         const tempVariable = {
//           key: res.key,
//           question: responseAns[res.key].question,
//           expectedAnswer: res?.expectedAns || '',
//           candidateAnswer: responseAns[res.key].response,
//         };

//         // console.log(tempVariable)
//         scoringData.push(tempVariable);
//       }

//       return { responseAns: responseAns, scoringData: scoringData };
//     });

//     return output;
//   }

//   async getScores(scoringData: any, responseAns: any) {
//     const output = async () => {
//       // ====================================================================
//       // Step 3: Score these obtained responses by comparison.
//       // ====================================================================
//       // Make the scoring logic!
//       const scoringModel = new ChatOpenAI({ temperature: 0, maxTokens: -1 });
//       const scoringDataPrompt = 'Scoring Data: {scoringData}';
//       const scorePrompt = [
//         // SystemMessagePromptTemplate.fromTemplate(cvQNAPrompt),
//         HumanMessagePromptTemplate.fromTemplate(scoringDataPrompt),
//       ];
//       const scoringPromptToSend = ChatPromptTemplate.fromMessages(scorePrompt);

//       const scoringSchema = z.object({
//         response: z.array(
//           z.object({
//             key: z.string(),
//             question: z.string(),
//             candidateAnswer: z.string(),
//             candidateAnswerScore: z
//               .number()
//               .describe("Score of the person's answer"),
//           }),
//         ),
//       });

//       const scoringFunction = {
//         name: 'scoringFunc',
//         description:
//           'Score the givenAns response between 0 to 10 on basis of the idealAns expected, for each property from the scoring data for all the questions. Give each property only once.',
//         parameters: zodToJsonSchema(scoringSchema),
//       };
//       const scoringRunnable = createOpenAIFnRunnable({
//         functions: [scoringFunction],
//         llm: scoringModel,
//         prompt: scoringPromptToSend,
//         enforceSingleFunctionUsage: true, // Default is true
//         outputParser: new JsonOutputFunctionsParser(),
//       });

//       const responseScore:
//         | {
//             response?: { question: string; answer: string; score: number };
//           }
//         | any = await scoringRunnable.invoke({
//         scoringData: JSON.stringify(scoringData),
//       });

//       // console.log(responseScore)
//       // console.log((performance.now()-start)/1000)

//       const outputResponse: {
//         key: any;
//         question: any;
//         candidateAnswer: any;
//         candidateAnswerScore: any;
//       }[] = [];

//       if (Object.keys(responseScore).includes('response')) {
//         for (const res of responseScore.response) {
//           outputResponse.push({
//             key: res.key,
//             question: res.question,
//             candidateAnswer: responseAns[res.key].response,
//             candidateAnswerScore: res.score,
//           });
//         }
//       }

//       // console.log(outputResponse)
//       // return outputResponse;
//       return responseScore;
//     };

//     return await output();
//   }

//   // INITIAL
//   /*async getScoresFromCustomPrompt2(qna = '') {
//     const output = await this.createEmbeddings().then(async () => {
//       // ====================================================================
//       // STEP 1: Create the category string array from the questions
//       // ====================================================================
//       const qnaToCategoryPrompt =
//         'With the given Questions and Expected answers to be given respectively; Give a json array of objects response according to the schema provided following is/are the questions given. \n';

//       const qnaModel = new ChatOpenAI({ temperature: 0, maxTokens: -1 });

//       const qnaSchema = z.object({
//         data: z.array(
//           z
//             .object({
//               key: z
//                 .string()
//                 .describe(
//                   'Give a one word propertyName suitable with the question',
//                 ),
//               question: z.string(),
//               expectedAns: z.string(),
//             })
//             .describe(qnaToCategoryPrompt),
//         ),
//       });
//       const toolForParse = new DynamicStructuredTool({
//         name: 'responseTool',
//         description: 'Returns response to the user',
//         schema: qnaSchema,
//         func: async ({ data }) => JSON.stringify(data),
//       });
//       const modelWithTools = qnaModel.bindTools([toolForParse]);
//       const response = await modelWithTools.invoke(qna);

//       // return response;

//       // ====================================================================
//       // STEP 2: Create the category string array from the questions
//       // ====================================================================
//       const cvQNAModel = new ChatOpenAI({ temperature: 0, maxTokens: -1 });
//       const cvQNAPrompt = 'Questions: {questions}';
//       const CVData = this.vectorStore.docstore._docs.get('0')?.pageContent;
//       const cvDataPrompt = '\nCV Data: \n{CVData}';
//       const cvPrompt = [
//         SystemMessagePromptTemplate.fromTemplate(cvQNAPrompt),
//         HumanMessagePromptTemplate.fromTemplate(cvDataPrompt),
//       ];
//       let answerKeys: any;
//       let questions: any;
//       const cvPromptToSend = ChatPromptTemplate.fromMessages(cvPrompt);

//       if (response.tool_calls && response.tool_calls.length > 0) {
//         answerKeys = response.tool_calls[0].args?.data;
//         questions = response.tool_calls[0].args.data.map((responses) => {
//           return {
//             question: responses.question,
//             key: responses.key,
//           };
//         });
//       } else {
//         answerKeys = [];
//         questions = [];

//         return { badRequest: -1 };
//       }
//       const answerSchema = z.object(
//         Object.fromEntries(
//           answerKeys.map((fieldName, index) => [
//             fieldName.key,
//             z.object({
//               question: z.string().describe('asked question'),
//               response: z.string().describe('answer from CV'),
//             }), //.describe(`score to the contexts question wrt CV data`),
//           ]),
//         ),
//       );
//       //   console.log(zodToJsonSchema(answerSchema))
//       const scoreToolFunction = {
//         name: 'scoreTool',
//         description:
//           'Carefully analyse the CV data and answer the given questions in succint statement(s).',
//         parameters: zodToJsonSchema(answerSchema),
//       };
//       const runnable = createOpenAIFnRunnable({
//         functions: [scoreToolFunction],
//         llm: cvQNAModel,
//         prompt: cvPromptToSend,
//         enforceSingleFunctionUsage: true, // Default is true
//         outputParser: new JsonOutputFunctionsParser(),
//       });
//       const responseAns = await runnable.invoke({
//         CVData: CVData,
//         questions: JSON.stringify(questions),
//       });
//       // -------------------------------------------------------------

//       const scoringData: {
//         key: any;
//         question: any;
//         idealAnswer: any;
//         givenAns: any;
//       }[] = [];

//       for (const res of response.tool_calls[0].args.data) {
//         const tempVariable = {
//           key: res.key,
//           question: responseAns[res.key].question,
//           idealAnswer: res?.expectedAns || '',
//           givenAns: responseAns[res.key].response,
//         };

//         // console.log(tempVariable)
//         scoringData.push(tempVariable);
//       }

//       // return responseAns;
//       // ====================================================================
//       // Step 3: Score these obtained responses by comparison.
//       // ====================================================================
//       // Make the scoring logic!
//       const scoringModel = new ChatOpenAI({ temperature: 0, maxTokens: -1 });
//       const scoringDataPrompt = 'Scoring Data: {scoringData}';
//       const scorePrompt = [
//         // SystemMessagePromptTemplate.fromTemplate(cvQNAPrompt),
//         HumanMessagePromptTemplate.fromTemplate(scoringDataPrompt),
//       ];
//       const scoringPromptToSend = ChatPromptTemplate.fromMessages(scorePrompt);

//       const scoringSchema = z.object({
//         response: z.array(
//           z.object({
//             key: z.string(),
//             question: z.string(),
//             // givenAns: z.string(),
//             score: z.number().describe("Score of the person's answer"),
//           }),
//         ),
//       });

//       const scoringFunction = {
//         name: 'scoringFunc',
//         description:
//           'Score the givenAns response between 0 to 10 on basis of the idealAns expected, for each property from the scoring data for all the questions. Give each property only once.',
//         parameters: zodToJsonSchema(scoringSchema),
//       };
//       const scoringRunnable = createOpenAIFnRunnable({
//         functions: [scoringFunction],
//         llm: scoringModel,
//         prompt: scoringPromptToSend,
//         enforceSingleFunctionUsage: true, // Default is true
//         outputParser: new JsonOutputFunctionsParser(),
//       });

//       const responseScore:
//         | {
//             response?: { question: string; answer: string; score: number };
//           }
//         | any = await scoringRunnable.invoke({
//         scoringData: JSON.stringify(scoringData),
//       });

//       // console.log(responseScore)
//       // console.log((performance.now()-start)/1000)

//       const outputResponse: {
//         key: any;
//         question: any;
//         answer: any;
//         score: any;
//       }[] = [];

//       if (Object.keys(responseScore).includes('response')) {
//         for (const res of responseScore.response) {
//           outputResponse.push({
//             key: res.key,
//             question: res.question,
//             answer: responseAns[res.key].response,
//             score: res.score,
//           });
//         }
//       }

//       // console.log(outputResponse)
//       // return outputResponse;
//       return responseScore;
//     });

//     return output;
//   }*/

//   // INITIAL
//   /*async getScoresFromCustomPrompt(qna = '') {
//     // const response = await this.processPromptToStructuredData(qna);
//     const response =
//       await this.inputPromptProcessing.processRawPromptToStructuredPrompt(qna);
//     const { responseAns, scoringData } =
//       await this.askStructuredQuestionsFromCV(response);
//     const scoredData = await this.getScores(scoringData, responseAns);

//     return {
//       responsePrompts: response,
//       responseFromCV: responseAns,
//       responseScore: scoredData,
//     };
//   }*/

//   // NOT NEEDED PROBABLY
//   /*async getAnswers(
//     questions: (string | undefined)[] = [''],
//     field_names: string[],
//   ) {
//     const res = await this.createEmbeddings().then(async () => {
//       const vectorStoreRetriever = this.vectorStore.asRetriever();
//       const model = new OpenAI({ maxTokens: -1, temperature: 0 });
//       const chain = RetrievalQAChain.fromLLM(model, vectorStoreRetriever);
//       const questionSend = `${questions.map(
//         (question) => question + '\n',
//       )} Give ONLY THE ANSWER, WITHOUT ANY UNNECESSARY sentence formation, in JSON object form. \n field names:\n ${field_names}. If the field names are given then assign the JSON properties the GIVEN field names according to respective questions. If the field names are not provided, infer a one word field name for each property of your JSON response. If there is no answer then return an empty array.`;
//       const res = await chain.invoke({
//         query: questionSend,
//       });

//       return JSON.parse(res.text);
//     });

//     return res;
//   }*/

//   // SAMPLE FUNCTION
//   /*anotherFunction() {
//     // Ensure that data is loaded before accessing it
//     this.waitForLoad().then(() => {
//       // console.log('from another function', this.doc);
//     });
//   }*/

//   async getScoresFromCustomPrompt({ prompts, record }) {
//     // const response = await this.processPromptToStructuredData(prompt);
//     const { responseAns, scoringData } =
//       await this.askStructuredQuestionsFromCV(prompts);

//     // console.log(responseAns);
//     const scoredData = await this.getScores(scoringData, responseAns);
//     const candidateId = record.id;

//     /*await Promise.all(
//       scoredData.response.map((data) => {
//         createRecord({
//           query: CREATE_ONE_PROMPT_ANSWER,
//           data: {
//             candidateId: candidateId,
//             candidateAnswerScore: data.candidateAnswerScore,
//             candidateAnswer: data.candidateAnswer,
//             name: data.key,
//           },
//         });
//       }),
//     );*/

//     return { scoredData, candidateId };
//   }
// }

// DONE!
/*@Injectable({})
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
}*/

/*@Injectable({})
export class CVProcessingJobMQ
  implements MessageQueueJob<CVProcessingJobMQData2>
{
  private readonly logger = new Logger(CVProcessingJobMQ.name);

  constructor() {}

  async handle(arg: CVProcessingJobMQData2): Promise<any> {
    const prompt = arg.data.prompt;
    const recordData = await this.getRequiredRecordData(arg.data.record);
    const path = this.getPath(arg.data.record);
    const cvProcessing = new CVProcessing(path);
    const { scoredData, candidateId } =
      await cvProcessing.getScoresFromCustomPrompt({
        prompts: prompt,
        record: recordData,
      });

    await Promise.all(
      scoredData.response.map((data) => {
        createRecord({
          query: CREATE_ONE_PROMPT_ANSWER,
          data: {
            candidateId: candidateId,
            candidateAnswerScore: data.candidateAnswerScore,
            candidateAnswer: data.candidateAnswer,
            name: data.key,
          },
        });
      }),
    );

    return;
  }

  getRequiredRecordData(record): object {
    return record;
  }

  getPath(record): string {
    return '/home/rushiil/Downloads/manufacturing-cvs/VIshal Sharma -Curriculum Vitae -2.pdf';
  }
}*/
// export { CVProcessing };
