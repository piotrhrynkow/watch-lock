import { createReducer } from '@reduxjs/toolkit';
import update from 'immutability-helper';
import { size } from 'lodash';
import {
  addProjectProcessing,
  removeProjectProcessing,
  setUpdatedAtProcessing,
} from '../actions';

const initialState = {
  updatedAt: 0,
  processing: {
    projects: {},
  },
};

export default createReducer(initialState, (builder) => {
  builder
    .addCase(setUpdatedAtProcessing, (state, { payload }) => {
      return {
        ...state,
        updatedAt: Date.now(),
      };
    })
    .addCase(addProjectProcessing, (state, { payload }) => {
      return update(state, {
        processing: {
          projects: { [payload]: { $set: payload } },
        },
      });
    })
    .addCase(removeProjectProcessing, (state, { payload }) => {
      const updatedAt: number =
        size(state.processing.projects) > 1 ? state.updatedAt : Date.now();
      return update(state, {
        updatedAt: { $set: updatedAt },
        processing: {
          projects: { $unset: [payload] },
        },
      });
    });
});
