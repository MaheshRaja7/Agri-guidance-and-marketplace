import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../utils/constants.dart';

class AuthService {
  Future<User?> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('${Constants.apiBaseUrl}/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final user = User.fromJson(data['user'], data['token']);
        await saveToken(user.token);
        await saveUserRole(user.role);
        return user;
      }
    } catch (e) {
      print('Login error: $e');
    }
    return null;
  }

  Future<User?> register(String name, String email, String password, String role, String phone, String city, [String? area]) async {
    try {
      final Map<String, dynamic> requestBody = {
        'name': name,
        'email': email,
        'password': password,
        'userType': role,
        'phone': phone,
        'city': city,
      };

      if (role == 'farmer' && area != null && area.isNotEmpty) {
        requestBody['area'] = double.tryParse(area);
      }

      final response = await http.post(
        Uri.parse('${Constants.apiBaseUrl}/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(requestBody),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final user = User.fromJson(data['user'], data['token']);
        await saveToken(user.token);
        await saveUserRole(user.role);
        return user;
      }
    } catch (e) {
      print('Register error: $e');
    }
    return null;
  }

  Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('jwt_token', token);
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token');
  }

  Future<void> saveUserRole(String role) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user_role', role);
  }

  Future<String?> getUserRole() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('user_role');
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt_token');
    await prefs.remove('user_role');
  }
}
