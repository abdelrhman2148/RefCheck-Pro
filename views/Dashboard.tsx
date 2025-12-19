import React from 'react';
import { Candidate, Reference } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';

interface DashboardProps {
  candidates: Candidate[];
  references: Reference[];
}

export const Dashboard: React.FC<DashboardProps> = ({ candidates, references }) => {
  const activeCandidates = candidates.filter(c => c.status === 'Active').length;
  const completedReferences = references.filter(r => r.status === 'COMPLETED').length;
  const pendingReferences = references.filter(r => r.status === 'PENDING').length;

  // Calculate scores for chart
  const scoresData = candidates
    .filter(c => c.aiScore !== undefined)
    .map(c => ({
      name: c.name.split(' ')[0], // First name for brevity
      score: c.aiScore || 0,
    }))
    .slice(0, 5); // Show top 5 recent

  const stats = [
    { label: 'Active Candidates', value: activeCandidates, icon: <Users className="text-blue-600" />, color: 'bg-blue-50' },
    { label: 'Pending Requests', value: pendingReferences, icon: <Clock className="text-orange-600" />, color: 'bg-orange-50' },
    { label: 'Completed Checks', value: completedReferences, icon: <CheckCircle className="text-green-600" />, color: 'bg-green-50' },
    { label: 'Avg AI Score', value: scoresData.length ? Math.round(scoresData.reduce((a, b) => a + b.score, 0) / scoresData.length) : '-', icon: <FileText className="text-purple-600" />, color: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Scores Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Candidate AI Scores</h2>
          <div className="h-64">
            {scoresData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoresData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {scoresData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.score > 75 ? '#16a34a' : entry.score > 50 ? '#ca8a04' : '#dc2626'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No analyzed candidates yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {references.slice(0, 5).map((ref) => {
              const candidate = candidates.find(c => c.id === ref.candidateId);
              return (
                <div key={ref.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${ref.status === 'COMPLETED' ? 'bg-green-500' : 'bg-orange-500'}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {ref.status === 'COMPLETED' ? 'Received reference' : 'Request sent'}
                      </p>
                      <p className="text-xs text-gray-500">
                        From {ref.refereeName} for {candidate?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(ref.sentDate).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
            {references.length === 0 && (
              <div className="text-center text-gray-400 py-8">No activity recorded.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
