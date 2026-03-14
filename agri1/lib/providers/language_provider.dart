import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LanguageProvider with ChangeNotifier {
  String _currentLanguage = 'en'; // Default is English

  String get currentLanguage => _currentLanguage;

  LanguageProvider() {
    _loadLanguage();
  }

  Future<void> _loadLanguage() async {
    final prefs = await SharedPreferences.getInstance();
    _currentLanguage = prefs.getString('app_lang') ?? 'en';
    notifyListeners();
  }

  Future<void> setLanguage(String langCode) async {
    if (_currentLanguage == langCode) return;
    _currentLanguage = langCode;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('app_lang', langCode);
    notifyListeners();
  }
}

// Common Support Languages
const Map<String, String> supportedLanguages = {
  'en': 'English',
  'hi': 'Hindi',
  'ta': 'Tamil',
  'te': 'Telugu',
  'mr': 'Marathi',
  'gu': 'Gujarati',
  'bn': 'Bengali',
};
