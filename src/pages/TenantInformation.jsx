import React, { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import { collection, getDocs } from 'firebase/firestore';
import Navbar from './navbar.jsx';
import BottomNavWithPopup from './BottomNavWithPopup';

export default function TenantList({ onNavigate, onEdit }) {
  const [tenants, setTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [buildings, setBuildings] = useState([]);
  
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsData, setNotificationsData] = useState([]);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'tenants'));
        const tenantList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTenants(tenantList);
        setFilteredTenants(tenantList);

        const uniqueBuildings = [...new Set(tenantList.map(t => t.buildingOrComplex).filter(Boolean))];
        setBuildings(uniqueBuildings);
      } catch (error) {
        console.error('Error fetching tenants:', error);
      }
    };
    fetchTenants();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'notifications'));
        const notifs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNotificationsData(notifs);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    let result = tenants;

    if (selectedBuilding) {
      result = result.filter(t => t.buildingOrComplex === selectedBuilding);
    }
    if (selectedProperty) {
      result = result.filter(t => t.propertyOrUnit === selectedProperty);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => {
        const tenantName = `${t.name || ''} ${t.surname || ''}`.toLowerCase();
        const unitNumber = (t.propertyOrUnit || t.unitId || '').toLowerCase();
        const buildingName = (t.buildingOrComplex || '').toLowerCase();
        const mobile = (t.mobile || '').toLowerCase();

        return (
          tenantName.includes(query) ||
          unitNumber.includes(query) ||
          buildingName.includes(query) ||
          mobile.includes(query)
        );
      });
    }

    setFilteredTenants(result);
  }, [selectedBuilding, selectedProperty, searchQuery, tenants]);

  return (
    <div className="tenant-container">
      <Navbar 
        onNavigate={onNavigate} 
        notificationsData={notificationsData} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
      />
      <main className="tenant-content">
        <h2>Tenant Information List</h2>
        
        {/* Filter Controls */}
        <div className="filter-section" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <select 
            value={selectedBuilding} 
            onChange={(e) => {
              setSelectedBuilding(e.target.value);
              setSelectedProperty(''); // Reset property filter when building changes
            }}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">All Buildings</option>
            {buildings.map((bldg, idx) => (
              <option key={idx} value={bldg}>{bldg}</option>
            ))}
          </select>

          <select 
            value={selectedProperty} 
            onChange={(e) => setSelectedProperty(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">All Properties/Units</option>
            {tenants
              .filter(t => !selectedBuilding || t.buildingOrComplex === selectedBuilding)
              .map(t => t.propertyOrUnit)
              .filter((val, i, arr) => val && arr.indexOf(val) === i) // Unique units
              .map((unit, idx) => (
                <option key={idx} value={unit}>{unit}</option>
              ))}
          </select>
        </div>

        {/* Filtered Tenant Cards */}
        <div className="tenant-list">
          {filteredTenants.length === 0 ? (
            <p>No tenants found for the selected criteria.</p>
          ) : (
            filteredTenants.map(tenant => (
              <div key={tenant.id} className="tenant-card" style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px', borderRadius: '6px', background: '#fff' }}>
                <h3>{tenant.name} {tenant.surname}</h3>
                <p><strong>Building:</strong> {tenant.buildingOrComplex}</p>
                <p><strong>Unit:</strong> {tenant.propertyOrUnit}</p>
                <p><strong>Mobile:</strong> {tenant.mobile}</p>
                <button 
                  onClick={() => onEdit(tenant)}
                  style={{ background: '#b30000', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginTop: '8px' }}
                >
                  Edit / View Details
                </button>
              </div>
            ))
          )}
        </div>
      </main>
      <BottomNavWithPopup onNavigate={onNavigate} currentActive="home" />
    </div>
  );
}