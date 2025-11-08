import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [
    {
      id: '1',
      name: 'Иван Иванов',
      email: 'ivan@example.com',
      role: 'Разработчик'
    },
    {
      id: '2',
      name: 'Петр Петров',
      email: 'petr@example.com',
      role: 'Дизайнер'
    },
    {
      id: '3',
      name: 'Мария Сидорова',
      email: 'maria@example.com',
      role: 'Менеджер'
    }
  ],
  loading: false,
  error: null
};

const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    addMember: (state, action) => {
      const newMember = {
        id: Date.now().toString(),
        ...action.payload,
      };
      
      if (!newMember.name || !newMember.email) {
        state.error = 'Name and email are required';
        return;
      }
      
      state.items.push(newMember);
      state.error = null;
    },
    
    updateMember: (state, action) => {
      const { id, updates } = action.payload;
      const memberIndex = state.items.findIndex(member => member.id === id);
      
      if (memberIndex !== -1) {
        state.items[memberIndex] = { ...state.items[memberIndex], ...updates };
      }
    },
    
    deleteMember: (state, action) => {
      state.items = state.items.filter(member => member.id !== action.payload);
    },
    
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  addMember,
  updateMember,
  deleteMember,
  setError,
  clearError,
} = membersSlice.actions;

export const selectAllMembers = (state) => state.members.items;
export const selectMemberById = (state, memberId) => 
  state.members.items.find(member => member.id === memberId);
export const selectMembersError = (state) => state.members.error;

export default membersSlice.reducer;