import { z } from 'zod';

export type enrichmentArgTypes = {
  selectedRecords: selectedRecordDataToSendType[];
  options: string[] | undefined;
  question: string | undefined;
  fieldName: string;
};

export type selectedRecordDataToSendType = {
  id: string;
  name: {
    firstName: string;
    lastName: string;
  };
  company?: string;
  attachment?: any;
};

export const MENU_OPTIONS_EXEC = [
  {
    name: 'Gender',
    // methods: (selectedRecords : ObjectRecord[], updateOneRecord: (arg0: { idToUpdate: string; updateOneRecordInput: any; }) => void, setIsRightDrawerOpen: (arg0: boolean) => void) => {
    id: 'gender',
    args: {
      question: 'Give me the most probable gender of these people.',
      options: ['Male', 'Female'],
    },
  },
  {
    name: 'Ethnicity',
    id: 'ethnicity',
    args: {
      question: 'Give me the most probable ethnicity of these people',
      options: [],
    },
  },
  {
    name: 'Nationality',
    id: 'nationality',
    args: {
      question: 'Give me the most probable nationality of these people',
      options: [],
    },
  },
  {
    name: 'Education Score',
    id: 'education_score',
    args: {},
  },
  {
    name: 'Education Type',
    id: 'education_type',
    args: {},
  },
  {
    name: 'UG Specialization',
    id: 'ug_specializations',
    args: {},
  },
  {
    name: 'PG Specialization',
    id: 'pg_specialization',
    args: {},
  },
  {
    name: 'Seniority',
    id: 'seniority',
    args: {},
  },
  {
    name: 'Function',
    id: 'function',
    args: {},
  },
  {
    name: 'Sub-Function',
    id: 'sub_function',
    args: {},
  },
  {
    name: 'Number of Job Changes',
    id: 'number_of_job_changes',
    args: {},
  },
  {
    name: 'Number of Promotions',
    id: 'number_of_promotions',
    args: {},
  },
  {
    name: 'Propensity of Switch',
    id: 'propensity_of_switch',
    args: {},
  },
  {
    name: 'Propensity to Relocate',
    id: 'propensity_to_relocate',
    args: {},
  },
  {
    name: 'Estimated Salary',
    id: 'estimated_salary',
    args: {},
  },
  {
    name: 'Distance',
    id: 'distance',
    args: {},
  },
  {
    name: 'Population',
    id: 'population',
    args: {},
  },
  {
    name: 'Company Promoter Info',
    id: 'companyPromoter',
    args: {
      question:
        "Give me company promoter whether it's a publicly listed company or owned by a proprietor.",
      options: ['public', 'proprietor owned'],
    },
  },
  {
    name: 'Company Scores',
    id: 'company_scores',
    args: {},
  },
  {
    name: 'Company Size',
    id: 'company_size',
    args: {},
  },
  {
    name: 'isLayingOff',
    id: 'is_laying_off',
    args: {},
  },
  {
    name: 'Link to OrgChart',
    id: 'link_to_orgChart',
    args: {},
  },
  {
    name: 'Industry Type',
    id: 'industry',
    args: {},
  },
  {
    name: 'Company Type',
    id: 'company_type',
    args: {},
  },
];

// export const cvParsePrompts = [
//   {
//     id: 'people-cv-education',
//     question:
//       "\nA person can have multiple educational qualifications.\neducational qualifications should only include: \n- name field of the qualification,\n- type of qualification (Master's or Bachelor's degree),\n- name of the institution from which it was obtained",
//     parserObject: z.object({
//       qualifications: z.array(
//         z.object({
//           nameEd: z.string(),
//           type: z.string(),
//           institution: z.string(),
//         }),
//       ),
//     }),
//   },
//   {
//     id: 'people-cv-company',
//     question:
//       '\nGive me the following company details in which this person is working or has latest work experience in:\n- name of company in nameExp,\n- department of work,\n- latest job function, \n- latest job title,\n- latest designation held',
//     parserObject: z.object({
//       nameExp: z.string(),
//       department: z.string(),
//       function: z
//         .string()
//         .describe(
//           'Describe the function performed by the person in the latest jobs.',
//         ),
//       lastJob: z.string(),
//       designation: z.string(),
//     }),
//   },
// ];

// eslint-disable-next-line @typescript-eslint/naming-convention
export const cvParsePrompts = [
  {
    id: 'people-cv-education',
    question:
      "\nA person can have multiple educational qualifications.\neducational qualifications should only include: \n- name field of the qualification,\n- type of qualification (Master's or Bachelor's degree),\n- name of the institution from which it was obtained",
    parserObject: z.object({
      qualifications: z.array(
        z.object({
          nameEd: z.string(),
          type: z.string(),
          institution: z.string(),
        }),
      ),
    }),
  },
  {
    id: 'people-cv-company',
    question:
      '\nGive me the following company details in which this person is working or has latest work experience in:\n- name of company in nameExp,\n- department of work,\n- latest job function, \n- latest job title,\n- latest designation held',
    parserObject: z.object({
      nameExp: z.string(),
      department: z.string(),
      function: z
        .string()
        .describe(
          'Describe the function performed by the person in the latest jobs.',
        ),
      lastJob: z.string(),
      designation: z.string(),
    }),
  },
];
