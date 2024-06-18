import { shareAsync } from "expo-sharing";
import { useState } from "react";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";

const { StorageAccessFramework } = FileSystem;

const save = async ({
  uri,
  mimetype,
  filename,
}: {
  uri: string;
  filename: string;
  mimetype: string;
}) => {};

export const downloadFile = async ({
  url,
  name,
}: {
  url: string;
  name: string;
}) => {
  const { uri, headers } = await FileSystem.downloadAsync(
    url,
    FileSystem.documentDirectory + name
  );
  // console.log(result);
  const mimetype = headers["Content-Type"];

  const permissions =
    await StorageAccessFramework.requestDirectoryPermissionsAsync();

  FileSystem.writeAsStringAsync(uri, "", { encoding: "base64" });

  //   if (Platform.OS === "android") {
  //     const permissions =
  //       await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
  //     if (permissions.granted) {
  //       const base64 = await FileSystem.readAsStringAsync(uri, {
  //         encoding: FileSystem.EncodingType.Base64,
  //       });
  //       await FileSystem.StorageAccessFramework.createFileAsync(
  //         permissions.directoryUri,
  //         name,
  //         mimetype
  //       )
  //         .then(async (uri) => {
  //           await FileSystem.writeAsStringAsync(uri, base64, {
  //             encoding: FileSystem.EncodingType.Base64,
  //           });
  //         })
  //         .catch((e) => console.log(e));
  //     } else {
  //       shareAsync(uri);
  //     }
  //   } else {
  //     shareAsync(uri);
  //   }
};
