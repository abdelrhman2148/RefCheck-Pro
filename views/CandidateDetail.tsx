import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Candidate, Reference } from '../types';
import { Button } from '../components/Button';
import { generateCandidateAnalysis } from '../services/geminiService';
import { Mail, RefreshCcw, FileText, Share2, Printer, AlertCircle } from 'lucide-react';

interface CandidateDetailProps {
  candidates: Candidate[];
  references: Reference[];
  onAddReference: (r: Reference) => void;
  onUpdateCandidate: (c: Candidate) => void;
  onNavigateToSurvey: (refId: string) => void; // For demo purposes
}

export const CandidateDetail: React.FC<CandidateDetailProps> = ({ 
  candidates, 
  references, 
  onAddReference, 
  onUpdateCandidate,
  onNavigateToSurvey
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const candidate = candidates.find(c => c.id === id);
  const myReferences = references.filter(r => r.candidateId === id);
  const [isRefModalOpen, setIsRefModalOpen] = useState(false);
  const [newRef, setNewRef] = useState({ name: '', email: '', relationship: 'Former Manager' });
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!candidate) return <div>Candidate not found</div>;

  const completedRefs = myReferences.filter(r => r.status === 'COMPLETED');
  const canAnalyze = completedRefs.length > 0;

  const handleAddRef = (e: React.FormEvent) => {
    e.preventDefault();
    onAddReference({
      id: crypto.randomUUID(),
      candidateId: candidate.id,
      refereeName: newRef.name,
      refereeEmail: newRef.email,
      relationship: newRef.relationship,
      status: 'PENDING',
      sentDate: new Date().toISOString(),
      responses: []
    });
    setIsRefModalOpen(false);
    setNewRef({ name: '', email: '', relationship: 'Former Manager' });
  };

  const handleAnalysis = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const result = await generateCandidateAnalysis(candidate.name, candidate.role, completedRefs);
      
      onUpdateCandidate({
        ...candidate,
        aiSummary: JSON.stringify(result),
        aiScore: result.score
      });
    } catch (err: any) {
        let msg = "Failed to generate analysis. Please try again.";
        if (err.message?.includes('API Key')) msg = "API Key missing. Please check configuration.";
        setError(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  const analysisData = candidate.aiSummary ? JSON.parse(candidate.aiSummary) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <button onClick={() => navigate('/candidates')} className="text-sm text-gray-500 hover:text-gray-900 mb-1 no-print">
            &larr; Back to Candidates
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{candidate.name}</h1>
          <p className="text-gray-500">{candidate.role} • {candidate.email}</p>
        </div>
        <div className="flex space-x-3 no-print">
          <Button variant="secondary" icon={<Printer size={16} />} onClick={() => window.print()}>
            Print Report
          </Button>
          <Button onClick={() => setIsRefModalOpen(true)} icon={<Mail size={16} />}>
            Request Reference
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Analysis & Overview */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Analysis Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                   <span className="mr-2">✨</span> AI Hiring Insights
                </h2>
                <p className="text-sm text-gray-500">Powered by Gemini 3 Flash</p>
              </div>
              <Button 
                size="sm" 
                variant={canAnalyze ? "primary" : "secondary"}
                disabled={!canAnalyze} 
                onClick={handleAnalysis}
                isLoading={analyzing}
                icon={<RefreshCcw size={14} />}
              >
                {analysisData ? 'Regenerate' : 'Analyze'}
              </Button>
            </div>

            <div className="p-6">
              {!canAnalyze ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Wait for at least one completed reference to generate insights.</p>
                </div>
              ) : !analysisData ? (
                 <div className="text-center py-8 text-gray-500">
                  <p>Click "Analyze" to generate a summary report.</p>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="flex items-center gap-4 mb-6">
                     <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div 
                          className={`h-full ${analysisData.score > 70 ? 'bg-green-500' : 'bg-yellow-500'}`} 
                          style={{ width: `${analysisData.score}%` }}
                        />
                     </div>
                     <span className="font-bold text-2xl">{analysisData.score}/100</span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Executive Summary</h3>
                    <p className="text-gray-700 leading-relaxed">{analysisData.summary}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-green-700 mb-2">Key Strengths</h3>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        {analysisData.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                     <div>
                      <h3 className="font-semibold text-red-700 mb-2">Potential Concerns</h3>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        {analysisData.weaknesses.map((s: string, i: number) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  </div>
                  
                  {analysisData.discrepancies && analysisData.discrepancies !== "None" && (
                     <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                       <h3 className="font-semibold text-yellow-800 mb-1">Noted Discrepancies</h3>
                       <p className="text-sm text-yellow-800">{analysisData.discrepancies}</p>
                     </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Detailed Responses (Print Only mostly, but visible) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-4">Detailed Responses</h2>
             {completedRefs.length === 0 ? (
               <p className="text-gray-500">No responses yet.</p>
             ) : (
               <div className="space-y-8">
                 {completedRefs.map((ref) => (
                   <div key={ref.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                     <div className="flex justify-between mb-4">
                       <div>
                         <h3 className="font-semibold text-gray-900">{ref.refereeName}</h3>
                         <p className="text-sm text-gray-500">{ref.relationship} • {ref.refereeEmail}</p>
                       </div>
                       <span className="text-xs text-gray-400">{new Date(ref.sentDate).toLocaleDateString()}</span>
                     </div>
                     <div className="space-y-3">
                       {ref.responses.map((resp, i) => (
                         <div key={i} className="bg-gray-50 p-3 rounded-lg">
                           <p className="text-xs font-medium text-gray-500 uppercase mb-1">{resp.questionText}</p>
                           <p className="text-gray-900">
                             {resp.type === 'rating' ? (
                               <span className="font-mono font-bold text-blue-600">{resp.answer}/10</span>
                             ) : (
                               resp.answer
                             )}
                           </p>
                         </div>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>

        {/* Right Column: Reference Management */}
        <div className="space-y-6">
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Reference Status</h2>
              <div className="space-y-4">
                {myReferences.map(ref => (
                  <div key={ref.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors group">
                    <div className="overflow-hidden">
                      <p className="font-medium text-gray-900 truncate">{ref.refereeName}</p>
                      <p className="text-xs text-gray-500 truncate">{ref.relationship}</p>
                      <div className="flex items-center mt-1">
                        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${ref.status === 'COMPLETED' ? 'bg-green-500' : 'bg-orange-500'}`} />
                        <span className="text-xs font-medium text-gray-600">{ref.status}</span>
                      </div>
                    </div>
                    {ref.status === 'PENDING' && (
                       <button 
                        onClick={() => onNavigateToSurvey(ref.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded no-print"
                        title="Demo: Open Survey Link"
                       >
                         Demo Link
                       </button>
                    )}
                  </div>
                ))}
                {myReferences.length === 0 && (
                  <p className="text-sm text-gray-500 text-center italic">No references requested yet.</p>
                )}
              </div>
           </div>
        </div>
      </div>

       {/* Add Reference Modal */}
       {isRefModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Request Reference</h2>
            <form onSubmit={handleAddRef} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referee Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newRef.name}
                  onChange={e => setNewRef({...newRef, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referee Email</label>
                <input 
                  required
                  type="email" 
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newRef.email}
                  onChange={e => setNewRef({...newRef, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newRef.relationship}
                  onChange={e => setNewRef({...newRef, relationship: e.target.value})}
                >
                  <option>Former Manager</option>
                  <option>Colleague / Peer</option>
                  <option>Direct Report</option>
                  <option>Client</option>
                  <option>Mentor</option>
                </select>
              </div>
              
              <div className="bg-blue-50 p-3 rounded text-xs text-blue-800 mb-2">
                Note: In this demo, this will create a link you can click to simulate the referee experience. No actual email is sent.
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => setIsRefModalOpen(false)}>Cancel</Button>
                <Button type="submit">Send Request</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
