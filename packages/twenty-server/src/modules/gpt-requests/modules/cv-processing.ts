import { extname } from 'path';

import { HNSWLib } from '@langchain/community/vectorstores/hnswlib';
import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  ChatPromptTemplate,
} from '@langchain/core/prompts';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { createOpenAIFnRunnable } from 'langchain/chains/openai_functions';
import { DocxLoader } from 'langchain/document_loaders/fs/docx';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { JsonOutputFunctionsParser } from 'langchain/output_parsers';
import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

import {
  CV_QUESTION_PROMPT_1,
  QNA_TO_CATEGORY_PROMPT,
  SCORING_PROMPT_1,
} from 'src/modules/gpt-requests/constants/prompts';

// @Injectable({})
export class CVProcessing {
  path: string;
  loadingPromise: Promise<void>;
  loader: PDFLoader | DocxLoader;
  doc: any;
  chunks: any;
  vectorStore: HNSWLib;
  fileName: string;
  // private inputPromptProcessing = new CustomPrompt();
  // TODO: change default path to something else!
  constructor(
    path = '/home/rushiil/Downloads/manufacturing-cvs/VIshal Sharma -Curriculum Vitae -2.pdf',
    fileName = '/home/rushiil/Downloads/manufacturing-cvs/VIshal Sharma -Curriculum Vitae -2.pdf',
  ) {
    this.path = path;
    this.fileName = fileName;
    // Call loaderFunc in the constructor
    this.loadingPromise = this.loaderFunc();
  }

  async loaderFunc() {
    if (extname(this.path.toLowerCase()) === '.pdf') {
      this.loader = new PDFLoader(this.path);
      const data = await this.loader.load();

      this.doc = data;
    } else if (
      extname(this.path.toLowerCase()) === '.docx' ||
      extname(this.path.toLowerCase()) === '.doc'
    ) {
      this.loader = new DocxLoader(this.path);
      const data = await this.loader.load();

      this.doc = data;
    } else {
      throw new Error(
        'Unsupported file format. Only PDF and DOCX files are supported.',
      );
    }
  }

  async waitForLoad() {
    await this.loadingPromise;
  }

  async splitDocAfterLoading() {
    // Ensure that data is loaded before accessing it
    await this.waitForLoad().then(async () => {
      // const splitter = new RecursiveCharacterTextSplitter({
      //   chunkSize: 1000,
      //   chunkOverlap: 20,
      // });
      // this.chunks = await splitter.splitDocuments(this.doc);
    });
  }

  async createEmbeddings() {
    await this.splitDocAfterLoading().then(async () => {
      // console.log(this.chunks);
      const embeddings = new OpenAIEmbeddings(); //created embeddings
      const vectorStore = await HNSWLib.fromDocuments(
        //using HNSW vector store
        this.doc,
        embeddings,
      );

      this.vectorStore = vectorStore;
    });
  }

  // INITIAL
  /*getScoresPrimitive(field_options = <any>[]) {
      this.createEmbeddings().then(async () => {
        const questions: string[] = [];
        const combinedParserObject: {
          id: string;
          question: string;
          parserObject: z.ZodObject<z.ZodRawShape, any>;
        }[] = [];
  
        cvParsePrompts.forEach((cvParsePrompt) => {
          if (field_options.includes(cvParsePrompt.id)) {
            questions.push(cvParsePrompt.question);
            combinedParserObject.push({
              id: cvParsePrompt.id,
              question: cvParsePrompt.question,
              parserObject: cvParsePrompt.parserObject,
            });
          }
        });
        //TODO Add from here!
        const masterZodObject = z.object({
          ...combinedParserObject.reduce(
            (acc, val) => ({ ...acc, ...val.shape }),
            {},
          ),
        });
        // const vectorStoreRetriever = this.vectorStore.asRetriever();
        const model = new OpenAI({ temperature: 0, maxTokens: -1 });
        const messages = [
          SystemMessagePromptTemplate.fromTemplate(
            'Answer the given question from the given context \nFormat Instructions: {format_instructions}\n context: {context}',
          ),
          HumanMessagePromptTemplate.fromTemplate('{question}'),
        ];
        const prompt = ChatPromptTemplate.fromMessages(messages);
  
        const parser = StructuredOutputParser.fromZodSchema(masterZodObject);
        const chain = RunnableSequence.from([prompt, model, parser]);
        const response = await chain.invoke({
          question: JSON.stringify(questions),
          format_instructions: parser.getFormatInstructions(),
          context: this.vectorStore?.docstore._docs.get('0').pageContent,
        });
  
        return response;
      });
    }*/

  /*async getScoresFromCustomPrompt(qna: string = '') {
    const qnaModel = new ChatOpenAI({ temperature: 0, maxTokens: -1 });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const questionSchema = z.object({
      key: z.string(),
      question: z.string(),
      expectedAns: z.string(),
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type QuestionType = {
      key: string;
      question: string;
      expectedAns: string;
    };

    const toolForParse = new DynamicStructuredTool({
      name: 'responseTool',
      description: 'Returns response to the user',
      schema: z.object({
        key: z.string(),
        question: z.string(),
        expectedAns: z.string(),
      }),
      func: async ({ data }) => {
        return JSON.stringify(data);
      },
    });

    const modelWithTools = qnaModel.bindTools([toolForParse]);
    const response = await modelWithTools.invoke(qna);

    return response;
  }*/

  async processPromptToStructuredData(prompt = '') {
    const output = async () => {
      // ====================================================================
      // STEP 1: Create the category string array from the questions
      // ====================================================================
      const qnaToCategoryPrompt = QNA_TO_CATEGORY_PROMPT;

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
    };

    return await output();
  }

  // INITIAL STRUCTURED QUESTIONS FROM CV FUNCTION
  /*async askStructuredQuestionsFromCV2(responseArg: any) {
      const output = await this.createEmbeddings().then(async () => {
        // ====================================================================
        // STEP 2: Create the category string array from the questions
        // ====================================================================
        const cvQNAModel = new ChatOpenAI({ temperature: 0, maxTokens: -1 });
        const cvQNAPrompt = 'Questions: {questions}';
        const CVData = this.vectorStore.docstore._docs.get('0')?.pageContent;
        const cvDataPrompt = '\nCV Data: \n{CVData}';
        const cvPrompt = [
          SystemMessagePromptTemplate.fromTemplate(cvQNAPrompt),
          HumanMessagePromptTemplate.fromTemplate(cvDataPrompt),
        ];
        let answerKeys: any;
        let questions: any;
        const cvPromptToSend = ChatPromptTemplate.fromMessages(cvPrompt);
  
        if (responseArg.tool_calls && responseArg.tool_calls.length > 0) {
          answerKeys = responseArg.tool_calls[0].args?.data;
          questions = responseArg.tool_calls[0].args.data.map((responses) => {
            return {
              question: responses.question,
              key: responses.key,
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
        // console.log(answerKeys);
        const answerSchema = z.object(
          Object.fromEntries(
            answerKeys.map((fieldName, index) => [
              fieldName.key,
              z.object({
                question: z.string().describe('asked question'),
                response: z.string().describe('answer from CV'),
              }), //.describe(`score to the contexts question wrt CV data`),
            ]),
          ),
        );
        //   console.log(zodToJsonSchema(answerSchema))
        const scoreToolFunction = {
          name: 'scoreTool',
          description:
            'Carefully analyse the CV data and answer the given questions in succint statement(s).',
          parameters: zodToJsonSchema(answerSchema),
        };
        const runnable = createOpenAIFnRunnable({
          functions: [scoreToolFunction],
          llm: cvQNAModel,
          prompt: cvPromptToSend,
          enforceSingleFunctionUsage: true, // Default is true
          outputParser: new JsonOutputFunctionsParser(),
        });
        const responseAns = await runnable.invoke({
          CVData: CVData,
          questions: JSON.stringify(questions),
        });
        // -------------------------------------------------------------
  
        // console.log(responseAns);
        const scoringData: {
          key: any;
          question: any;
          idealAnswer: any;
          givenAns: any;
        }[] = [];
  
        for (const res of responseArg.tool_calls[0].args.data) {
          const tempVariable = {
            key: res.key,
            question: responseAns[res.key].question,
            idealAnswer: res?.expectedAns || '',
            givenAns: responseAns[res.key].response,
          };
  
          // console.log(tempVariable)
          scoringData.push(tempVariable);
        }
  
        return { responseAns: responseAns, scoringData: scoringData };
      });
  
      return output;
    }*/
  // TODO: correct this function
  async askStructuredQuestionsFromCV(promptStructured: any[]) {
    const output = await this.createEmbeddings().then(async () => {
      // ====================================================================
      // STEP 2: Create the category string array from the questions
      // ====================================================================
      const cvQNAModel = new ChatOpenAI({ temperature: 0, maxTokens: -1 });
      const cvQNAPrompt = '\nQuestions: {questions}';
      const CVData = this.vectorStore.docstore._docs.get('0')?.pageContent;
      const cvDataPrompt = '\nCV Data: \n{CVData}';
      const cvPrompt = [
        SystemMessagePromptTemplate.fromTemplate(cvQNAPrompt),
        HumanMessagePromptTemplate.fromTemplate(cvDataPrompt),
      ];
      const questions = promptStructured.map((question) => {
        return { question: question.question, key: question.key };
      });

      // console.log(promptStructured);
      const cvPromptToSend = ChatPromptTemplate.fromMessages(cvPrompt);
      const answerSchema = z.object(
        Object.fromEntries(
          promptStructured.map((prompt) => [
            prompt.name,
            z.object({
              question: z.string().describe('asked question'),
              response: z.string().describe('one line answer from CV'),
            }), //.describe(`score to the contexts question wrt CV data`),
          ]),
        ),
      );
      //   console.log(zodToJsonSchema(answerSchema))
      const scoreToolFunction = {
        name: 'scoreTool',
        description: CV_QUESTION_PROMPT_1,
        parameters: zodToJsonSchema(answerSchema),
      };
      const runnable = createOpenAIFnRunnable({
        functions: [scoreToolFunction],
        llm: cvQNAModel,
        prompt: cvPromptToSend,
        enforceSingleFunctionUsage: true, // Default is true
        outputParser: new JsonOutputFunctionsParser(),
      });
      const responseAns = await runnable.invoke({
        CVData: CVData,
        questions: JSON.stringify(questions),
      });

      // console.log(responseAns);
      // -------------------------------------------------------------
      console.log(responseAns);

      const scoringData: {
        key: any;
        question: any;
        expectedAnswer: any;
        candidateAnswer: any;
      }[] = [];

      console.log("promptStructured.CVProcess",promptStructured);
      for (const res of promptStructured) {
        const tempVariable = {
          key: res.name,
          question: res.question,
          expectedAnswer: res?.expectedAnswer || '',
          candidateAnswer: responseAns[res.name].response,
        };

        // console.log(tempVariable)
        scoringData.push(tempVariable);
      }
      return { responseAns: responseAns, scoringData: scoringData };
    });

    return output;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getScores(scoringData: any) {
    const output = async () => {
      // ====================================================================
      // Step 3: Score these obtained responses by comparison.
      // ====================================================================
      // Make the scoring logic!

      // console.log('ResponseAns', responseAns);
      const scoringModel = new ChatOpenAI({ temperature: 0, maxTokens: -1 });
      const scoringDataPrompt = 'Scoring Data: {scoringData}';
      const scorePrompt = [
        // SystemMessagePromptTemplate.fromTemplate(cvQNAPrompt),
        HumanMessagePromptTemplate.fromTemplate(scoringDataPrompt),
      ];
      const scoringPromptToSend = ChatPromptTemplate.fromMessages(scorePrompt);

      const scoringSchema = z.object({
        response: z.array(
          z.object({
            key: z.string().describe('the unique identifier key of question'),
            question: z.string(),
            candidateAnswer: z.string(),
            candidateAnswerScore: z
              .number()
              .describe("Score of the person's answer"),
          }),
        ),
      });

      const scoringFunction = {
        name: 'scoringFunc',
        description: SCORING_PROMPT_1,
        parameters: zodToJsonSchema(scoringSchema),
      };
      const scoringRunnable = createOpenAIFnRunnable({
        functions: [scoringFunction],
        llm: scoringModel,
        prompt: scoringPromptToSend,
        enforceSingleFunctionUsage: true, // Default is true
        outputParser: new JsonOutputFunctionsParser(),
      });

      // console.log('Scoring Data: ', scoringData);
      const responseScore:
        | {
            response: {
              key: string;
              question: string;
              candidateAnswer: string;
              candidateAnswerScore: number;
            };
          }
        | any = await scoringRunnable.invoke({
        scoringData: JSON.stringify(scoringData),
      });

      // console.log('responseScore', responseScore);
      // console.log((performance.now()-start)/1000)
      // console.log(responseScore);
      const outputResponse: {
        key: any;
        question: any;
        candidateAnswer: any;
        candidateAnswerScore: any;
      }[] = [];

      if (Object.keys(responseScore).includes('response')) {
        for (const res of responseScore.response) {
          // TODO: REFACTOR and remove outputResponse Variable
          outputResponse.push({
            key: res.key,
            question: res.question,
            candidateAnswer: res.candidateAnswer,
            candidateAnswerScore: res.candidateAnswerScore,
          });
        }
      }

      // console.log(outputResponse)
      // return outputResponse;
      return responseScore.response;
    };

    return await output();
  }

  // INITIAL
  /*async getScoresFromCustomPrompt2(qna = '') {
      const output = await this.createEmbeddings().then(async () => {
        // ====================================================================
        // STEP 1: Create the category string array from the questions
        // ====================================================================
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
        const response = await modelWithTools.invoke(qna);
  
        // return response;
  
        // ====================================================================
        // STEP 2: Create the category string array from the questions
        // ====================================================================
        const cvQNAModel = new ChatOpenAI({ temperature: 0, maxTokens: -1 });
        const cvQNAPrompt = 'Questions: {questions}';
        const CVData = this.vectorStore.docstore._docs.get('0')?.pageContent;
        const cvDataPrompt = '\nCV Data: \n{CVData}';
        const cvPrompt = [
          SystemMessagePromptTemplate.fromTemplate(cvQNAPrompt),
          HumanMessagePromptTemplate.fromTemplate(cvDataPrompt),
        ];
        let answerKeys: any;
        let questions: any;
        const cvPromptToSend = ChatPromptTemplate.fromMessages(cvPrompt);
  
        if (response.tool_calls && response.tool_calls.length > 0) {
          answerKeys = response.tool_calls[0].args?.data;
          questions = response.tool_calls[0].args.data.map((responses) => {
            return {
              question: responses.question,
              key: responses.key,
            };
          });
        } else {
          answerKeys = [];
          questions = [];
  
          return { badRequest: -1 };
        }
        const answerSchema = z.object(
          Object.fromEntries(
            answerKeys.map((fieldName, index) => [
              fieldName.key,
              z.object({
                question: z.string().describe('asked question'),
                response: z.string().describe('answer from CV'),
              }), //.describe(`score to the contexts question wrt CV data`),
            ]),
          ),
        );
        //   console.log(zodToJsonSchema(answerSchema))
        const scoreToolFunction = {
          name: 'scoreTool',
          description:
            'Carefully analyse the CV data and answer the given questions in succint statement(s).',
          parameters: zodToJsonSchema(answerSchema),
        };
        const runnable = createOpenAIFnRunnable({
          functions: [scoreToolFunction],
          llm: cvQNAModel,
          prompt: cvPromptToSend,
          enforceSingleFunctionUsage: true, // Default is true
          outputParser: new JsonOutputFunctionsParser(),
        });
        const responseAns = await runnable.invoke({
          CVData: CVData,
          questions: JSON.stringify(questions),
        });
        // -------------------------------------------------------------
  
        const scoringData: {
          key: any;
          question: any;
          idealAnswer: any;
          givenAns: any;
        }[] = [];
  
        for (const res of response.tool_calls[0].args.data) {
          const tempVariable = {
            key: res.key,
            question: responseAns[res.key].question,
            idealAnswer: res?.expectedAns || '',
            givenAns: responseAns[res.key].response,
          };
  
          // console.log(tempVariable)
          scoringData.push(tempVariable);
        }
  
        // return responseAns;
        // ====================================================================
        // Step 3: Score these obtained responses by comparison.
        // ====================================================================
        // Make the scoring logic!
        const scoringModel = new ChatOpenAI({ temperature: 0, maxTokens: -1 });
        const scoringDataPrompt = 'Scoring Data: {scoringData}';
        const scorePrompt = [
          // SystemMessagePromptTemplate.fromTemplate(cvQNAPrompt),
          HumanMessagePromptTemplate.fromTemplate(scoringDataPrompt),
        ];
        const scoringPromptToSend = ChatPromptTemplate.fromMessages(scorePrompt);
  
        const scoringSchema = z.object({
          response: z.array(
            z.object({
              key: z.string(),
              question: z.string(),
              // givenAns: z.string(),
              score: z.number().describe("Score of the person's answer"),
            }),
          ),
        });
  
        const scoringFunction = {
          name: 'scoringFunc',
          description:
            'Score the givenAns response between 0 to 10 on basis of the idealAns expected, for each property from the scoring data for all the questions. Give each property only once.',
          parameters: zodToJsonSchema(scoringSchema),
        };
        const scoringRunnable = createOpenAIFnRunnable({
          functions: [scoringFunction],
          llm: scoringModel,
          prompt: scoringPromptToSend,
          enforceSingleFunctionUsage: true, // Default is true
          outputParser: new JsonOutputFunctionsParser(),
        });
  
        const responseScore:
          | {
              response?: { question: string; answer: string; score: number };
            }
          | any = await scoringRunnable.invoke({
          scoringData: JSON.stringify(scoringData),
        });
  
        // console.log(responseScore)
        // console.log((performance.now()-start)/1000)
  
        const outputResponse: {
          key: any;
          question: any;
          answer: any;
          score: any;
        }[] = [];
  
        if (Object.keys(responseScore).includes('response')) {
          for (const res of responseScore.response) {
            outputResponse.push({
              key: res.key,
              question: res.question,
              answer: responseAns[res.key].response,
              score: res.score,
            });
          }
        }
  
        // console.log(outputResponse)
        // return outputResponse;
        return responseScore;
      });
  
      return output;
    }*/

  // INITIAL
  /*async getScoresFromCustomPrompt(qna = '') {
      // const response = await this.processPromptToStructuredData(qna);
      const response =
        await this.inputPromptProcessing.processRawPromptToStructuredPrompt(qna);
      const { responseAns, scoringData } =
        await this.askStructuredQuestionsFromCV(response);
      const scoredData = await this.getScores(scoringData, responseAns);
  
      return {
        responsePrompts: response,
        responseFromCV: responseAns,
        responseScore: scoredData,
      };
    }*/

  // NOT NEEDED PROBABLY
  /*async getAnswers(
      questions: (string | undefined)[] = [''],
      field_names: string[],
    ) {
      const res = await this.createEmbeddings().then(async () => {
        const vectorStoreRetriever = this.vectorStore.asRetriever();
        const model = new OpenAI({ maxTokens: -1, temperature: 0 });
        const chain = RetrievalQAChain.fromLLM(model, vectorStoreRetriever);
        const questionSend = `${questions.map(
          (question) => question + '\n',
        )} Give ONLY THE ANSWER, WITHOUT ANY UNNECESSARY sentence formation, in JSON object form. \n field names:\n ${field_names}. If the field names are given then assign the JSON properties the GIVEN field names according to respective questions. If the field names are not provided, infer a one word field name for each property of your JSON response. If there is no answer then return an empty array.`;
        const res = await chain.invoke({
          query: questionSend,
        });
  
        return JSON.parse(res.text);
      });
  
      return res;
    }*/

  // SAMPLE FUNCTION
  /*anotherFunction() {
      // Ensure that data is loaded before accessing it
      this.waitForLoad().then(() => {
        // console.log('from another function', this.doc);
      });
    }*/

  async getScoresFromCustomPrompt({ prompts, record }) {
    // const response: any = await this.processPromptToStructuredData(prompts);
    const { scoringData , responseAns } = await this.askStructuredQuestionsFromCV(prompts);
    // console.log(scoringData);
    // console.log(responseAns);
    const scoredData = await this.getScores(scoringData);
    console.log(scoredData);
    const candidateId = record.id;

    /*await Promise.all(
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
      );*/

    return { scoredData, candidateId , responseAns };
  }
}
