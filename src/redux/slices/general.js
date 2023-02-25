import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  status: false,
};

const GeneralSlice = createSlice({
  name: 'general',
  initialState,
  reducers: {
    updateNotificationLListen(state, action) {
      state.status = false;
    },

    setStatus(state, action) {
      state.status = action.payload;
    },
  },
});

//actions
export const {updateNotificationLListen, setStatus} = GeneralSlice.actions;

//reducers
export default GeneralSlice.reducer;
