import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import './MemberForm.css';
import { addMember, updateMember, selectMembersError, clearError } from '../store/slices/membersSlice';

const MemberForm = ({ member, onCancel }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const error = useSelector(selectMembersError);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ''
  });

  useEffect(() => {
    if (member) {
      setFormData(member);
    }
  }, [member]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (member) {
      dispatch(updateMember({ id: member.id, updates: formData }));
    } else {
      dispatch(addMember(formData));
    }
    
    if (!error) {
      onCancel();
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="member-form">
      <h3>{member ? t('edit') : t('addMember')}</h3>
      
      {error && <div className="error">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="name">{t('name')}: *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="email">{t('email')}: *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="role">{t('role')}:</label>
        <input
          type="text"
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          placeholder={t('role')}
        />
      </div>
      
      <div className="form-actions">
        <button type="submit">{t('save')}</button>
        <button type="button" onClick={onCancel}>{t('cancel')}</button>
      </div>
    </form>
  );
};

export default MemberForm;