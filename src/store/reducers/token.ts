import { createReducer } from '@reduxjs/toolkit';
import update from 'immutability-helper';
import { addToken, removeToken } from '../actions';

const initialState = {
  items: {},
};

export default createReducer(initialState, (builder) => {
  builder
    .addCase(addToken, (state, { payload }) => {
      return update(state, {
        items: {
          [payload.id]: { $set: payload },
        },
      });
    })
    .addCase(removeToken, (state, { payload }) => {
      return update(state, {
        items: { $unset: [payload] },
      });
    });
});
