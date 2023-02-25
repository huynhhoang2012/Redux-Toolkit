import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  AppState,
  Button,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import RNAndroidNotificationListener from "react-native-android-notification-listener";
import { hmacSHA256 } from "react-native-hmac";
import { useDispatch } from "react-redux";
import { updateNotificationLListen } from "./src/redux/slices/general";

let interval = null;
const { width } = Dimensions.get("screen");

const App = () => {
  const dispatch = useDispatch();
  const Notification = ({
    time,
    app,
    title,
    titleBig,
    text,
    subText,
    summaryText,
    bigText,
    audioContentsURI,
    imageBackgroundURI,
    extraInfoText,
    icon,
    image,
    iconLarge,
  }) => {
    return (
      <View style={styles.notificationWrapper}>
        <View style={styles.notification}>
          <View style={styles.imagesWrapper}>
            {!!icon && (
              <View style={styles.notificationIconWrapper}>
                <Image source={{ uri: icon }} style={styles.notificationIcon} />
              </View>
            )}
            {!!image && (
              <View style={styles.notificationImageWrapper}>
                <Image
                  source={{ uri: image }}
                  style={styles.notificationImage}
                />
              </View>
            )}
            {!!iconLarge && (
              <View style={styles.notificationImageWrapper}>
                <Image
                  source={{ uri: iconLarge }}
                  style={styles.notificationImage}
                />
              </View>
            )}
          </View>
          <View style={styles.notificationInfoWrapper}>
            <Text style={styles.textInfo}>{`app: ${app}`}</Text>
            <Text style={styles.textInfo}>{`title: ${title}`}</Text>
            <Text style={styles.textInfo}>{`text: ${text}`}</Text>
            {!!time && <Text style={styles.textInfo}>{`time: ${time}`}</Text>}
            {!!titleBig && (
              <Text style={styles.textInfo}>{`titleBig: ${titleBig}`}</Text>
            )}
            {!!subText && (
              <Text style={styles.textInfo}>{`subText: ${subText}`}</Text>
            )}
            {!!summaryText && (
              <Text
                style={styles.textInfo}
              >{`summaryText: ${summaryText}`}</Text>
            )}
            {!!bigText && (
              <Text style={styles.textInfo}>{`bigText: ${bigText}`}</Text>
            )}
            {!!audioContentsURI && (
              <Text
                style={styles.textInfo}
              >{`audioContentsURI: ${audioContentsURI}`}</Text>
            )}
            {!!imageBackgroundURI && (
              <Text
                style={styles.textInfo}
              >{`imageBackgroundURI: ${imageBackgroundURI}`}</Text>
            )}
            {!!extraInfoText && (
              <Text
                style={styles.textInfo}
              >{`extraInfoText: ${extraInfoText}`}</Text>
            )}
          </View>
        </View>
      </View>
    );
  };
  const [hasPermission, setHasPermission] = useState(false);
  const [lastNotification, setLastNotification] = useState(null);

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

  const handleOnPressPermissionButton = async () => {
    /**
     * Open the notification settings so the user
     * so the user can enable it
     */
    RNAndroidNotificationListener.requestPermission();
  };

  const handleAppStateChange = async (nextAppState, force) => {
    if (nextAppState === "active" || force) {
      const status = await RNAndroidNotificationListener.getPermissionStatus();
      setHasPermission(status !== "denied");
    }
  };

  const handleCheckNotificationInterval = React.useCallback(async () => {
    const lastStoredNotification = await AsyncStorage.getItem(
      "@lastNotification"
    );

    if (lastStoredNotification) {
      const json = JSON.parse(lastStoredNotification);

      const timeNow = new Date();
      timeNow.setMinutes(timeNow.getMinutes() + 5);
      let timeStamp = Math.floor(new Date(timeNow).getTime() / 1000);

      const body = {
        provider: conventProvider(json?.app),
        title: json?.title,
        content: json?.text,
        timestamp: timeStamp,
      };

      const params = {
        "x-api-timestamp": json?.time,
      };
      dispatch(updateNotificationLListen(body, params));

      setLastNotification(json);
    }
  }, [dispatch]);

  useEffect(() => {
    clearInterval(interval);

    interval = setInterval(handleCheckNotificationInterval, 3000);

    const listener = AppState.addEventListener("change", handleAppStateChange);

    handleAppStateChange("", true);

    return () => {
      clearInterval(interval);
      listener.remove();
    };
  }, [handleCheckNotificationInterval]);

  const hasGroupedMessages =
    lastNotification &&
    lastNotification.groupedMessages &&
    lastNotification.groupedMessages.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.buttonWrapper}>
        <Text
          style={[
            styles.permissionStatus,
            { color: hasPermission ? "green" : "red" },
          ]}
        >
          {hasPermission
            ? "Allowed to handle notifications"
            : "NOT allowed to handle notifications"}
        </Text>
        <Button
          title="Open Configuration"
          onPress={handleOnPressPermissionButton}
          disabled={hasPermission}
        />
      </View>
      <View style={styles.notificationsWrapper}>
        {lastNotification && !hasGroupedMessages && (
          <ScrollView style={styles.scrollView}>
            <Notification {...lastNotification} />
          </ScrollView>
        )}
        {lastNotification && hasGroupedMessages && (
          <FlatList
            data={lastNotification.groupedMessages}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <Notification app={lastNotification.app} {...item} />
            )}
          />
        )}
      </View>
      {/* <TouchableOpacity
        onPress={async () => {
          const timeNow = new Date();
          timeNow.setSeconds(timeNow.getSeconds() + 60);
          let timeStamp = Math.floor(new Date(timeNow).getTime() / 1000);

          const body = {
            provider: 'techcombank',
            title: '+ VND 40,000',
            content: `Tài khoản: 19036786563017 Số dư: VND 2,882,796 NAP masonmy`,
            timestamp: timeStamp,
          };
          await axios.post(
            'https://api.phongthan2.com/api/transfer/listen',
            body,
            {
              headers: {
                'content-type': 'application/json',
                'x-api-timestamp': timeStamp,
                'x-api-signature': await hmacSHA256(
                  `${timeStamp}|techcombank|+ VND 40,000|Tài khoản: 19036786563017 Số dư: VND 2,882,796 NAP masonmy`,
                  'fSTzq2EXtCFhvW79',
                ),
              },
            },
          );
        }}>
        <Text>123123</Text>
      </TouchableOpacity> */}
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionStatus: {
    marginBottom: 20,
    fontSize: 18,
  },
  notificationsWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationWrapper: {
    flexDirection: "column",
    width: width * 0.8,
    backgroundColor: "#f2f2f2",
    padding: 20,
    marginTop: 20,
    borderRadius: 5,
    elevation: 2,
  },
  notification: {
    flexDirection: "row",
  },
  imagesWrapper: {
    flexDirection: "column",
  },
  notificationInfoWrapper: {
    flex: 1,
  },
  notificationIconWrapper: {
    backgroundColor: "#aaa",
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    marginRight: 15,
    justifyContent: "center",
  },
  notificationIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  notificationImageWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    marginRight: 15,
    justifyContent: "center",
  },
  notificationImage: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  buttonWrapper: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  scrollView: {
    flex: 1,
  },
  textInfo: {
    color: "#000",
  },
});
