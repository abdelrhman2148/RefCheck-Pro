export const APP_NAME = "RefCheck Pro";

export const DEFAULT_SURVEY_QUESTIONS = [
  {
    id: 'q1',
    text: 'How would you rate the candidate’s overall performance?',
    type: 'rating',
    min: 1,
    max: 10
  },
  {
    id: 'q2',
    text: 'How would you rate their reliability and punctuality?',
    type: 'rating',
    min: 1,
    max: 10
  },
  {
    id: 'q3',
    text: 'Please describe the candidate’s primary strengths.',
    type: 'text'
  },
  {
    id: 'q4',
    text: 'What is one area where the candidate could improve?',
    type: 'text'
  },
  {
    id: 'q5',
    text: 'Would you rehire this person given the chance?',
    type: 'text'
  }
];
