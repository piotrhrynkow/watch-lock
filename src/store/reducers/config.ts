import { createReducer } from '@reduxjs/toolkit';
import { ConfigState } from '../types';
import {
  removeConfigBackup,
  setConfigBackup,
  setConfigFile,
  setConfigVersion,
} from '../actions';

const initialState: ConfigState = {
  filePath: null,
  backup: null,
  version: null,
};

export default createReducer(initialState, (builder) => {
  builder
    .addCase(setConfigFile, (state, { payload }) => {
      return {
        ...state,
        filePath: payload,
      };
    })
    .addCase(setConfigBackup, (state, { payload }) => {
      return {
        ...state,
        backup: payload,
      };
    })
    .addCase(setConfigVersion, (state, { payload }) => {
      return {
        ...state,
        version: payload,
      };
    })
    .addCase(removeConfigBackup, (state) => {
      return {
        ...state,
        backup: null,
      };
    });
});
