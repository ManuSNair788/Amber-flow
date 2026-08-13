'use client'

import { useState } from 'react';
import { X, Edit3, MessageSquareWarning, Slack, Phone, Check, Save } from 'lucide-react';

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  )
}

export function QueueItem({ 
  approval, 
  waGroupId,
  handleApprove,
  handleReject,
  handleCreateWaGroup,
  handleDnpQuickAction,
  handleEditMessage
}: { 
  approval: any, 
  waGroupId: string,
  handleApprove: (formData: FormData) => void,
  handleReject: (formData: FormData) => void,
  handleCreateWaGroup: (formData: FormData) => void,
  handleDnpQuickAction: (formData: FormData) => void,
  handleEditMessage: (id: string, msg: string) => Promise<{success: boolean, error?: string}>
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(approval.message);
  const [isSaving, setIsSaving] = useState(false);
  
  const partner = approval.students?.partners;

  const onSaveEdit = async () => {
    setIsSaving(true);
    await handleEditMessage(approval.id, message);
    setIsSaving(false);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col lg:flex-row gap-6">
      {/* Student Info */}
      <div className="lg:w-1/4 border-b lg:border-b-0 lg:border-r border-slate-200 pb-4 lg:pb-0 lg:pr-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
            {approval.students?.name?.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{approval.students?.name}</h3>
            <p className="text-xs text-slate-500">{approval.students?.prospect_id}</p>
          </div>
        </div>
        <div className="space-y-2 text-sm text-slate-600">
          <p><span className="font-medium text-slate-900">Partner:</span> {partner?.name}</p>
          <p><span className="font-medium text-slate-900">Status:</span> {approval.students?.status}</p>
          
          {/* Follow up Metric requested by user */}
          <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-semibold mt-2 border border-amber-200">
            <ClockIcon /> Follow-up #2
          </div>
        </div>

        {/* Create WA Group Action */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <form action={handleCreateWaGroup}>
            <input type="hidden" name="studentId" value={approval.students?.id} />
            <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-sm font-bold rounded-lg transition-colors border border-[#25D366]/20">
              <Phone className="w-4 h-4" /> Create WA Group
            </button>
          </form>
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 flex flex-col gap-4">
        
        {/* Raw Slack Context */}
        {approval.raw_slack_context && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
               <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Slack className="w-4 h-4 text-[#E01E5A]" />
                Extracted from Slack
              </div>
            </div>
            <div className="text-slate-700 text-sm font-medium p-2 bg-white rounded border border-slate-100 shadow-sm">
              {approval.raw_slack_context}
            </div>
          </div>
        )}

        {/* AI Draft */}
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
             <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
              <MessageSquareWarning className="w-4 h-4" />
              AI Generated WhatsApp Draft
            </div>
          </div>
          {isEditing ? (
            <div className="flex flex-col gap-2 flex-1">
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full flex-1 min-h-[120px] p-2 text-sm text-slate-700 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              />
              <div className="flex gap-2 justify-end mt-2">
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setMessage(approval.message);
                  }}
                  className="px-3 py-1.5 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                  disabled={isSaving}
                  type="button"
                >
                  Cancel
                </button>
                <button 
                  onClick={onSaveEdit}
                  className="px-3 py-1.5 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center gap-1.5"
                  disabled={isSaving}
                  type="button"
                >
                  <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-slate-700 text-sm whitespace-pre-wrap font-medium">
              {approval.message}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-row lg:flex-col gap-3 justify-center">
        <form action={handleApprove}>
          <input type="hidden" name="approvalId" value={approval.id} />
          <input type="hidden" name="waGroupId" value={waGroupId} />
          <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-lg transition-colors shadow-sm whitespace-nowrap">
            <Phone className="w-4 h-4" /> Approve & Send to WA
          </button>
        </form>

        {approval.students?.status === 'DNP' && (
          <form action={handleDnpQuickAction}>
            <input type="hidden" name="approvalId" value={approval.id} />
            <input type="hidden" name="waGroupId" value={waGroupId} />
            <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 text-sm font-bold rounded-lg transition-colors shadow-sm whitespace-nowrap">
              <MessageSquareWarning className="w-4 h-4" /> DNP Quick Action
            </button>
          </form>
        )}

        <form action={handleReject}>
          <input type="hidden" name="approvalId" value={approval.id} />
          <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-medium rounded-lg transition-colors">
            <X className="w-4 h-4" /> Reject
          </button>
        </form>
        {!isEditing && (
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              console.log('Edit clicked for', approval.id);
              try {
                setIsEditing(true);
              } catch (err) {
                console.error('Error setting edit state:', err);
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-sm font-medium rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4" /> Edit
          </button>
        )}
      </div>
    </div>
  );
}
