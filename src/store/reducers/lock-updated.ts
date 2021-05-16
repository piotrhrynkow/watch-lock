import { createReducer } from '@reduxjs/toolkit';
import update from 'immutability-helper';
import { LockUpdated } from '../../model/types';
import { addLockUpdated } from '../actions';

const initialState: { [key: string]: LockUpdated } = {};

export default createReducer(initialState, (builder) => {
  builder.addCase(addLockUpdated, (state, { payload }) => {
    return update(state, { [payload.id]: { $set: payload } });
  });
});
