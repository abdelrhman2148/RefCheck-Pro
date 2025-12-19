import React, { useState } from 'react';
import { Candidate, Reference } from '../types';
import { Button } from '../components/Button';
import { Plus, Search, ChevronRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CandidateListProps {
  candidates: Candidate[];
  references: Reference[];
  onAddCandidate: (c: Candidate) => void;
}

export const CandidateList: React.FC<CandidateListProps> = ({ candidates, references, onAddCandidate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ name: '', role: '', email: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCandidate({
      id: crypto.randomUUID(),
      name: newCandidate.name,
      role: newCandidate.role,
      email: newCandidate.email,
      status: 'Active',
      createdAt: new Date().toISOString(),
    });
    setIsModalOpen(false);
    setNewCandidate({ name: '', role: '', email: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
        <Button onClick={() => setIsModalOpen(true)} icon={<Plus size={16} />}>
          Add Candidate
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search candidates..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        <ul className="divide-y divide-gray-200">
          {candidates.map((candidate) => {
             const candidateRefs = references.filter(r => r.candidateId === candidate.id);
             const completedCount = candidateRefs.filter(r => r.status === 'COMPLETED').length;

            return (
              <li key={candidate.id} className="hover:bg-gray-50 transition-colors">
                <Link to={`/candidates/${candidate.id}`} className="block p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {candidate.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{candidate.name}</p>
                        <p className="text-sm text-gray-500">{candidate.role}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-8">
                       <div className="hidden sm:block text-right">
                        <p className="text-xs text-gray-500 uppercase font-medium">References</p>
                        <p className="text-sm font-medium text-gray-900">{completedCount} / {candidateRefs.length} Completed</p>
                      </div>

                      {candidate.aiScore && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500 uppercase font-medium">AI Score</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            candidate.aiScore > 75 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {candidate.aiScore}/100
                          </span>
                        </div>
                      )}
                      
                      <ChevronRight className="text-gray-400" size={20} />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
          {candidates.length === 0 && (
             <div className="p-8 text-center text-gray-500">
               No candidates found. Click "Add Candidate" to get started.
             </div>
          )}
        </ul>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Candidate</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newCandidate.name}
                  onChange={e => setNewCandidate({...newCandidate, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
                <input 
                  required
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newCandidate.role}
                  onChange={e => setNewCandidate({...newCandidate, role: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  required
                  type="email" 
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newCandidate.email}
                  onChange={e => setNewCandidate({...newCandidate, email: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Add Candidate</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
