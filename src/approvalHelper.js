import { db } from '../src/firebase';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';

/**
 * Handles deletion logic based on user role.
 * If user is a Manager -> sends an approval request to Firestore.
 * If user is an Admin/Landlord -> performs direct deletion.
 */
export const handleRoleBasedDelete = async (currentUserRole, currentUser, targetCollection, targetId, itemName) => {
  if (currentUserRole === 'Manager') {
    try {
      // Send approval notification to admin
      await addDoc(collection(db, 'approvalRequests'), {
        managerId: currentUser?.id || currentUser?.uid || 'manager',
        managerName: `${currentUser?.name || ''} ${currentUser?.surname || ''}`.trim() || 'Manager',
        targetCollection: targetCollection, // e.g., 'tenants', 'properties', 'managers'
        targetId: targetId,
        itemName: itemName || 'Record',
        status: 'Pending',
        createdAt: new Date().toISOString()
      });
      alert('Delete request sent to Admin for approval.');
      return true;
    } catch (error) {
      console.error('Error sending manager deletion request:', error);
      alert('Failed to send approval request.');
      return false;
    }
  } else {
    // Admin / Landlord direct delete execution
    if (window.confirm(`Are you sure you want to delete ${itemName || 'this item'}?`)) {
      try {
        await deleteDoc(doc(db, targetCollection, targetId));
        alert('Deleted successfully.');
        return true;
      } catch (error) {
        console.error('Error executing direct delete:', error);
        alert('Failed to delete item.');
        return false;
      }
    }
    return false;
  }
};