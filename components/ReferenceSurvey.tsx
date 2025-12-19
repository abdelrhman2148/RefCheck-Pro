import React, { useState } from 'react';
import { Reference, SurveyResponse } from '../types';
import { DEFAULT_SURVEY_QUESTIONS } from '../constants';
import { Button } from './Button';
import { CheckCircle } from 'lucide-react';

interface ReferenceSurveyProps {
  reference: Reference;
  candidateName: string;
  role: string;
  onSubmit: (refId: string, responses: SurveyResponse[]) => void;
}

export const ReferenceSurvey: React.FC<ReferenceSurveyProps> = ({ reference, candidateName, role, onSubmit }) => {
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedResponses: SurveyResponse[] = DEFAULT_SURVEY_QUESTIONS.map(q => ({
      questionId: q.id,
      questionText: q.text,
      type: q.type as 'rating' | 'text',
      answer: answers[q.id] || (q.type === 'rating' ? 5 : ''),
    }));
    
    onSubmit(reference.id, formattedResponses);
    setSubmitted(true);
  };

  const handleInputChange = (id: string, value: string | number) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600">Your reference for {candidateName} has been submitted securely.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="bg-blue-600 p-6 text-white">
            <h1 className="text-2xl font-bold">Reference Check</h1>
            <p className="mt-2 opacity-90">
              For <strong>{candidateName}</strong> regarding the <strong>{role}</strong> position.
            </p>
          </div>
          
          <div className="p-6 border-b border-gray-100">
            <p className="text-gray-600">
              Hello <strong>{reference.refereeName}</strong>, thank you for taking the time to provide feedback. 
              This survey takes less than 2 minutes.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {DEFAULT_SURVEY_QUESTIONS.map((q, idx) => (
            <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-900 mb-4">
                <span className="text-gray-400 mr-2">{idx + 1}.</span>
                {q.text}
              </label>
              
              {q.type === 'rating' ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500 px-1">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleInputChange(q.id, num)}
                        className={`flex-1 h-10 rounded-lg text-sm font-medium transition-colors ${
                          answers[q.id] === num 
                            ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-1' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <textarea
                  required
                  rows={3}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3 border"
                  placeholder="Type your answer here..."
                  value={answers[q.id] || ''}
                  onChange={(e) => handleInputChange(q.id, e.target.value)}
                />
              )}
            </div>
          ))}

          <div className="flex justify-end">
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Submit Reference
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
