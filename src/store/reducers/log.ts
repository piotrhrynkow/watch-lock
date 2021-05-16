import { createReducer } from '@reduxjs/toolkit';
import update from 'immutability-helper';
import Log from '../../model/log';
import { addLog, removeLog } from '../actions';

const initialState: Log[] = [];

export default createReducer(initialState, (builder) => {
  builder
    .addCase(addLog, (state, { payload }) => {
      return update(state, {
        $push: [payload],
      });
    })
    .addCase(removeLog, (state, { payload }) => {
      return update(state, {
        $splice: [[payload, 1]],
      });
    });
});
