import {all} from 'redux-saga/effects';
import generalWatcher from './general';

function* rootSaga() {
  yield all([generalWatcher()]);
}

export default rootSaga;
