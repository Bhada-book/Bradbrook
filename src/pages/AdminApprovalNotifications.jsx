import React, { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import { collection, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';

export default function AdminApprovalNotifications() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'approvalRequests'), (snapshot) => {
      const reqs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setRequests(reqs.filter(r => r.status === 'Pending'));
    });
    return () => unsub();
  }, []);

  const handleApprove = async (req) => {
    try {
      // 1. Perform the actual deletion requested by the manager
      await deleteDoc(doc(db, req.targetCollection, req.targetId));
      
      // 2. Mark request as Approved
      await updateDoc(doc(db, 'approvalRequests', req.id), { status: 'Approved' });
      alert('Request approved and record deleted successfully.');
    } catch (err) {
      console.error('Error approving deletion:', err);
    }
  };

  const handleReject = async (reqId) => {
    try {
      await updateDoc(doc(db, 'approvalRequests', reqId), { status: 'Rejected' });
      alert('Manager deletion request rejected.');
    } catch (err) {
      console.error('Error rejecting:', err);
    }
  };

  return (
    <div style={{ padding: '16px', fontFamily: 'Arial, sans-serif' }}>
      <h3>Manager Deletion Approvals</h3>
      {requests.length === 0 ? (
        <p style={{ color: '#777' }}>No pending approval requests from managers.</p>
      ) : (
        requests.map((req) => (
          <div key={req.id} style={{ background: '#fff', border: '1px solid #ddd', padding: '12px', marginBottom: '10px', borderRadius: '6px' }}>
            <p><strong>Manager:</strong> {req.managerName}</p>
            <p><strong>Requested Deletion:</strong> {req.itemName} (Collection: {req.targetCollection})</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button 
                onClick={() => handleApprove(req)} 
                style={{ background: '#006600', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
              >
                Approve & Delete
              </button>
              <button 
                onClick={() => handleReject(req.id)} 
                style={{ background: '#b30000', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}