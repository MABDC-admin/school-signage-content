import React from 'react';
import { useAuditLogs } from '@/hooks/useSignageData';
import { ClipboardList, User, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AuditSection: React.FC = () => {
  const { logs, isLoading } = useAuditLogs();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Audit Log</h2>
        <p className="text-sm text-slate-500">Track all changes and actions in the system</p>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Action</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Entity</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Details</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      log.action.includes('CREATE') ? 'bg-green-100 text-green-700' :
                      log.action.includes('UPDATE') ? 'bg-blue-100 text-blue-700' :
                      log.action.includes('DELETE') ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-900">{log.entity_type}</p>
                      {log.entity_id && (
                        <p className="text-xs text-slate-500 font-mono">{log.entity_id.substring(0, 8)}...</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {log.details && (
                      <pre className="text-xs text-slate-600 bg-slate-50 p-2 rounded max-w-xs overflow-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(log.created_at))} ago
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && (
          <div className="text-center py-12">
            <ClipboardList className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">No audit logs yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditSection;
