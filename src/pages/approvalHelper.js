import { db } from './firebase.js';
import { doc, deleteDoc, addDoc, collection } from 'firebase/firestore';

export const handleRoleBasedDelete = async (userRole, loggedInUser, collectionName, documentId, profileName) => {
  try {
    if (userRole === 'Manager') {
      await addDoc(collection(db, 'notifications'), {
        title: `Delete Approval: ${profileName}`,
        mode: 'Profile Deletion',
        status: 'Pending',
        date: new Date().toLocaleDateString(),
        targetCollection: collectionName,
        targetDocumentId: documentId,
        requestedBy: loggedInUser.name || 'Manager',
        timestamp: new Date()
      });
      alert('Delete request sent to Admin for approval.');
    } else {
      await deleteDoc(doc(db, collectionName, documentId));
      alert('Profile deleted successfully.');
    }
  } catch (error) {
    console.error('Error handling role-based delete:', error);
    alert('Operation failed. Please try again.');
  }
};