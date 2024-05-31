/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @nx/workspace-max-consts-per-file */
import { SetterOrUpdater } from 'recoil';

import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export type optionType = {
  name: string;
  args: object;
  id: string;
};

type funcArgs = {
  selectedRecords: ObjectRecord[];
  updateOneRecord: (arg0: {
    idToUpdate: string;
    updateOneRecordInput: any;
  }) => void;
  setIsRightDrawerOpen: SetterOrUpdater<boolean>;
};

export const MENU_OPTIONS = [
  {
    name: 'Name',
    options: [
      {
        name: 'Gender',
        id: 'gender',
        methods: {},
      },
      {
        name: 'Ethnicity',
        id: 'ethnicity',
        methods: {},
      },
      {
        name: 'Nationality',
        id: 'nationality',
        methods: {},
      },
    ],
  },
  {
    name: 'Education',
    options: [
      {
        name: 'Education Score',
        id: 'education_score',
        methods: {},
      },
      {
        name: 'Education Type',
        methods: {},
      },
      {
        name: 'UG Specialization',
        id: 'ug_specializations',
        methods: {},
      },
      {
        name: 'PG Specialization',
        id: 'pg_specializations',
        methods: {},
      },
    ],
  },
  {
    name: 'Job Titles',
    options: [
      {
        name: 'Seniority',
        id: 'seniority',
        methods: {},
      },
      {
        name: 'Function',
        id: 'function',
        methods: {},
      },
      {
        name: 'Sub-Function',
        id: 'sub_function',
        methods: {},
      },
    ],
  },
  {
    name: 'Profile',
    options: [
      {
        name: 'Number of Job Changes',
        methods: {},
      },
      {
        name: 'Number of Promotions',
        methods: {},
      },
      {
        name: 'Propensity of Switch',
        methods: {},
      },
      {
        name: 'Propensity to Relocate',
        methods: {},
      },
      {
        name: 'Estimated Salary',
        methods: {},
      },
    ],
  },
  {
    name: 'Locations',
    options: [
      {
        name: 'Distance',
        methods: {},
      },
      {
        name: 'Population',
        methods: {},
      },
    ],
  },
  {
    name: 'Company Info',
    options: [
      {
        name: 'Company Promoter Info',
        methods: {},
      },
      {
        name: 'Company Scores',
        methods: {},
      },
      {
        name: 'Company Size',
        methods: {},
      },
      {
        name: 'isLayingOff',
        methods: {},
      },
      {
        name: 'Link to OrgChart',
        methods: {},
      },
      {
        name: 'Industry Type',
        methods: {},
      },
      {
        name: 'Company Type',
        methods: {},
      },
    ],
  },
];

const sampleGenderBackendAPI = (name: ObjectRecord) => {
  setTimeout(() => {
    // Main functionality of the function
    console.log('1 second');
  }, 10000);
  return 'male';
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
