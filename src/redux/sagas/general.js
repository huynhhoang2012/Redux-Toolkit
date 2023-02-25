import {call, put, takeEvery} from 'redux-saga/effects';
import {updateNotificationListen} from '../apis/general';
import * as actGeneral from '../slices/general';

function* updateNotificationListenSaga(action) {
  const {body, param} = action.payload;

  try {
    const res = yield call(updateNotificationListen, body, param);

    if (res.data.length > 0) {
      yield put(actGeneral.setStatus(true));
    }
  } catch (error) {
    yield put(actGeneral.setStatus(false));
  }
}

export default function* billWatcher() {
  yield takeEvery(
    actGeneral.updateNotificationLListen.type,
    updateNotificationListenSaga,
  );
}
