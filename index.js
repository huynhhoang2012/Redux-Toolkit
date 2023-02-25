/**
 * @format
 */

import { AppRegistry } from "react-native";
import App from "./App";
import { name as appName } from "./app.json";

import { RNAndroidNotificationListenerHeadlessJsName } from "react-native-android-notification-listener";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { hmacSHA256 } from "react-native-hmac";
import { Provider } from "react-redux";
import store from "./src/redux/configureStore";

const arrayPackageBank = ["vn.com.techcombank.bb.app", "com.VCB"];

const headlessNotificationListener = async ({ notification }) => {
  const conventProvider = (packageAndroid) => {
    let provider = "";
    switch (packageAndroid) {
      case "vn.com.techcombank.bb.app":
        provider = "techcombank";
        break;
      case "com.VCB": {
        provider = "vietcombank";
        break;
      }
      default:
        provider = "techcombank";
        break;
    }
    return provider;
  };

  if (notification) {
    await AsyncStorage.setItem("@lastNotification", notification);
    const json = JSON.parse(notification);

    // if (!!arrayPackageBank.includes(json?.app)) {
    // let timeStamp = Math.floor(new Date().getTime() / 1000);
    const timeNow = new Date();
    timeNow.setMinutes(timeNow.getMinutes() + 5);
    let timeStamp = Math.floor(new Date(timeNow).getTime() / 1000);

    const body = {
      provider: conventProvider(json?.app),
      title: json?.title,
      content: json?.text,
      timestamp: timeStamp,
    };

    await axios.post("URL_API", body, {
      headers: {
        "content-type": "application/json",
        "Content-Length": "<calculated when request is sent>",
        "x-api-timestamp": timeStamp,
      },
    });
  }
  // }
};

/**
 * AppRegistry should be required early in the require sequence
 * to make sure the JS execution environment is setup before other
 * modules are required.
 */
AppRegistry.registerHeadlessTask(
  RNAndroidNotificationListenerHeadlessJsName,
  () => headlessNotificationListener
);

const ReduxProvider = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};

AppRegistry.registerComponent(appName, () => ReduxProvider);
