import { createReducer } from '@reduxjs/toolkit';
import update from 'immutability-helper';
import { addUUID, addUUIDs } from '../actions';

const initialState: string[] = [];

export default createReducer(initialState, (builder) => {
  builder
    .addCase(addUUID, (state, { payload }) => {
      return update(state, {
        $push: [payload],
      });
    })
    .addCase(addUUIDs, (state, { payload }) => {
      return update(state, {
        $push: payload,
      });
    });
});
