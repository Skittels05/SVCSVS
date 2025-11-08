import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import './MemberList.css';
import { 
  selectAllMembers, 
  deleteMember,
  selectMembersError 
} from '../store/slices/membersSlice';
import MemberForm from './MemberForm';

const MemberList = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const members = useSelector(selectAllMembers);
  const error = useSelector(selectMembersError);
  
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const handleDelete = (memberId) => {
    if (window.confirm(t('confirmDelete'))) {
      dispatch(deleteMember(memberId));
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setShowForm(true);
  };

  return (
    <div className="member-list">
      <div className="list-header">
        <h2>{t('team')}</h2>
        <button 
          className="btn-primary"
          onClick={() => {
            setEditingMember(null);
            setShowForm(true);
          }}
        >
          {t('addMember')}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <MemberForm
          member={editingMember}
          onCancel={() => {
            setShowForm(false);
            setEditingMember(null);
          }}
        />
      )}

      <div className="members-grid">
        {members.length === 0 ? (
          <p>{t('noMembers')}</p>
        ) : (
          members.map(member => (
            <div key={member.id} className="member-card">
              <div className="card-header">
                <h3>{member.name}</h3>
              </div>
              
              <div className="member-info">
                <p><strong>{t('email')}:</strong> {member.email}</p>
                <p><strong>{t('role')}:</strong> {member.role}</p>
              </div>
              
              <div className="member-actions">
                <button 
                  className="btn-edit"
                  onClick={() => handleEdit(member)}
                >
                  {t('edit')}
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDelete(member.id)}
                >
                  {t('delete')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MemberList;