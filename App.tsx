import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './views/Dashboard';
import { CandidateList } from './views/CandidateList';
import { CandidateDetail } from './views/CandidateDetail';
import { ReferenceSurvey } from './components/ReferenceSurvey';
import { Candidate, Reference, SurveyResponse } from './types';

// Wrapper component to handle programmatic navigation prop
const CandidateDetailWrapper = (props: any) => {
  const navigate = useNavigate();
  return <CandidateDetail {...props} onNavigateToSurvey={(refId) => navigate(`/survey/${refId}`)} />;
};

// Wrapper for survey to handle data fetching from props
const SurveyWrapper = ({ references, candidates, onSubmit }: { references: Reference[], candidates: Candidate[], onSubmit: any }) => {
    const navigate = useNavigate();
    // In a real app, we'd use useParams, but we need to pass data down
    // We can cheat slightly for the wrapper logic or rely on the route param inside the component
    // Let's refactor ReferenceSurvey slightly to take props, but we need the ID.
    // Instead, let's just use a HOC logic here.
    const path = window.location.hash; // #/survey/123
    const refId = path.split('/survey/')[1];
    
    const ref = references.find(r => r.id === refId);
    if (!ref) return <div className="p-8 text-center text-red-600">Reference link invalid or expired.</div>;
    
    const candidate = candidates.find(c => c.id === ref.candidateId);
    if (!candidate) return <div>Candidate data missing.</div>;

    const handleSubmit = (rid: string, responses: SurveyResponse[]) => {
        onSubmit(rid, responses);
        setTimeout(() => {
           // Redirect back to dashboard after submission for demo purposes? 
           // Or just leave them on the success screen (handled in component)
        }, 2000);
    }

    return <ReferenceSurvey reference={ref} candidateName={candidate.name} role={candidate.role} onSubmit={handleSubmit} />;
}


const App: React.FC = () => {
  // --- State Management (Persisted in LocalStorage for Demo) ---
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem('refcheck_candidates');
    return saved ? JSON.parse(saved) : [];
  });

  const [references, setReferences] = useState<Reference[]>(() => {
    const saved = localStorage.getItem('refcheck_references');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('refcheck_candidates', JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem('refcheck_references', JSON.stringify(references));
  }, [references]);

  // --- Handlers ---
  const addCandidate = (c: Candidate) => {
    setCandidates(prev => [c, ...prev]);
  };

  const updateCandidate = (updated: Candidate) => {
    setCandidates(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const addReference = (r: Reference) => {
    setReferences(prev => [r, ...prev]);
  };

  const submitSurvey = (refId: string, responses: SurveyResponse[]) => {
    setReferences(prev => prev.map(r => 
      r.id === refId 
        ? { ...r, status: 'COMPLETED', responses, completedDate: new Date().toISOString() } 
        : r
    ));
  };

  return (
    <HashRouter>
      <Routes>
        {/* Public Survey Route - Outside Layout */}
        <Route 
          path="/survey/:refId" 
          element={<SurveyWrapper references={references} candidates={candidates} onSubmit={submitSurvey} />} 
        />

        {/* Private App Routes */}
        <Route path="/" element={
          <Layout>
            <Dashboard candidates={candidates} references={references} />
          </Layout>
        } />
        
        <Route path="/candidates" element={
          <Layout>
            <CandidateList 
              candidates={candidates} 
              references={references} 
              onAddCandidate={addCandidate} 
            />
          </Layout>
        } />
        
        <Route path="/candidates/:id" element={
          <Layout>
            <CandidateDetailWrapper 
              candidates={candidates} 
              references={references} 
              onAddReference={addReference}
              onUpdateCandidate={updateCandidate}
            />
          </Layout>
        } />

         <Route path="/settings" element={
          <Layout>
            <div className="p-4">
               <h1 className="text-2xl font-bold mb-4">Settings</h1>
               <p className="text-gray-600">Configuration options (Email templates, Billing, API Keys) would go here.</p>
               <button 
                onClick={() => {
                  if(confirm("Clear all demo data?")) {
                    localStorage.removeItem('refcheck_candidates');
                    localStorage.removeItem('refcheck_references');
                    window.location.reload();
                  }
                }}
                className="mt-8 bg-red-100 text-red-700 px-4 py-2 rounded"
              >
                Reset Demo Data
              </button>
            </div>
          </Layout>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
