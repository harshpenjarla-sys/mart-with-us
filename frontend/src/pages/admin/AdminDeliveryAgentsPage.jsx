import React, { useState, useEffect } from 'react';
import {
  Bike,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Star,
  RefreshCw,
  Search,
  Eye,
  ShieldCheck,
  X
} from 'lucide-react';
import { adminAPI } from '../../services/api';

export default function AdminDeliveryAgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAgents();
      if (res.success) setAgents(res.agents || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleStatusChange = async (agentId, status) => {
    try {
      await adminAPI.updateAgentStatus(agentId, { status });
      fetchAgents();
      if (selectedAgent && selectedAgent._id === agentId) {
        setSelectedAgent(prev => ({ ...prev, verificationStatus: status }));
      }
    } catch (e) {
      alert('Error updating agent status: ' + e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Delivery Fleet Partners</h1>
          <p className="text-xs text-slate-500">Verify registrations, manage active riders, review vehicle documentation</p>
        </div>

        <button
          onClick={fetchAgents}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Fleet</span>
        </button>
      </div>

      {/* Agents Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Partner Name</th>
                <th className="p-4">Phone / Area</th>
                <th className="p-4">Vehicle & Number</th>
                <th className="p-4">Status</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Completed</th>
                <th className="p-4">Earnings</th>
                <th className="p-4">Verification</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {agents.map((a) => (
                <tr key={a._id} className="hover:bg-slate-50/60 transition">
                  <td className="p-4 flex items-center space-x-3">
                    <img
                      src={a.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                      alt={a.fullName}
                      className="w-9 h-9 rounded-xl object-cover border"
                    />
                    <div>
                      <p className="font-bold text-slate-900">{a.fullName}</p>
                      <span className="text-[10px] text-slate-400">{a.email}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-mono text-slate-800">{a.phone}</p>
                    <span className="text-[10px] text-slate-400">{a.serviceArea}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-slate-900 block">{a.vehicleType}</span>
                    <span className="font-mono text-[10px] text-slate-500 uppercase">{a.vehicleNumber}</span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      a.availability?.isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {a.availability?.isOnline ? '● Online' : '○ Offline'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current mr-1" />
                      <span>{a.rating || '5.0'}</span>
                    </div>
                  </td>
                  <td className="p-4 font-bold">{a.ordersCompleted || 0} trips</td>
                  <td className="p-4 font-black text-slate-900">₹{a.earnings?.total || 0}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                      a.verificationStatus === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : a.verificationStatus === 'PENDING'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {a.verificationStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                    {a.verificationStatus === 'PENDING' && (
                      <button
                        onClick={() => handleStatusChange(a._id, 'APPROVED')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold"
                      >
                        APPROVE
                      </button>
                    )}
                    {a.verificationStatus === 'APPROVED' && (
                      <button
                        onClick={() => handleStatusChange(a._id, 'SUSPENDED')}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-[10px] font-bold"
                      >
                        SUSPEND
                      </button>
                    )}
                    {a.verificationStatus === 'SUSPENDED' && (
                      <button
                        onClick={() => handleStatusChange(a._id, 'APPROVED')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold"
                      >
                        ACTIVATE
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedAgent(a)}
                      className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px]"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Partner Profile Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">Delivery Partner Profile</h3>
              <button onClick={() => setSelectedAgent(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedAgent.profilePhoto}
                  alt={selectedAgent.fullName}
                  className="w-14 h-14 rounded-2xl object-cover border"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{selectedAgent.fullName}</h4>
                  <p className="text-slate-500">{selectedAgent.email}</p>
                  <p className="font-mono text-slate-600">{selectedAgent.phone}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 space-y-2 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Vehicle:</span>
                  <span className="font-bold text-slate-900">{selectedAgent.vehicleType} ({selectedAgent.vehicleNumber})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Driving License:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedAgent.drivingLicense}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Govt ID:</span>
                  <span className="font-mono text-slate-700">{selectedAgent.governmentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Service Hub:</span>
                  <span className="font-bold text-slate-900">{selectedAgent.serviceArea}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Current Verification:</span>
                  <span className="font-bold uppercase text-brand-700">{selectedAgent.verificationStatus}</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => handleStatusChange(selectedAgent._id, 'APPROVED')}
                  className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl"
                >
                  Approve Application
                </button>
                <button
                  onClick={() => handleStatusChange(selectedAgent._id, 'REJECTED')}
                  className="flex-1 py-2.5 bg-rose-600 text-white font-bold rounded-xl"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
