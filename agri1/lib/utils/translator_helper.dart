import 'package:translator/translator.dart';
import 'package:shared_preferences/shared_preferences.dart';

class TranslatorHelper {
  static final _translator = GoogleTranslator();
  static final Map<String, String> _cache = {};

  static Future<String> translate(String text, String toLang) async {
    if (toLang == 'en' || text.isEmpty) return text;
    
    final cacheKey = '\${text}_\${toLang}';
    if (_cache.containsKey(cacheKey)) {
      return _cache[cacheKey]!;
    }

    try {
      final translation = await _translator.translate(text, to: toLang);
      _cache[cacheKey] = translation.text;
      return translation.text;
    } catch (e) {
      print('Translation error: \$e');
      return text; // Fallback to original text
    }
  }
}
