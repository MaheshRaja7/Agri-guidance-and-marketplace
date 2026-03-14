import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

class Constants {
  // Use 10.0.2.2 for Android emulator to access localhost, otherwise use localhost
  static String get apiBaseUrl {
    if (kIsWeb) {
      return 'http://localhost:3000/api';
    } else if (Platform.isAndroid) {
      return 'http://10.0.2.2:3000/api';
    } else {
      return 'http://localhost:3000/api';
    }
  }
}
