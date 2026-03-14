import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../providers/language_provider.dart';
import '../utils/translator_helper.dart';
import 'login_screen.dart';
import 'disease_detection_screen.dart';
import 'weather_screen.dart';
import 'chat_screen.dart';
import 'marketplace_screen.dart';

class FarmerDashboard extends StatelessWidget {
  const FarmerDashboard({super.key});

  void _logout(BuildContext context) async {
    await AuthService().logout();
    if (!context.mounted) return;
    Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
  }

  Widget _buildDashboardCard(BuildContext context, String title, IconData icon, Color color, Widget destination, String langCode) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: InkWell(
        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => destination)),
        borderRadius: BorderRadius.circular(15),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 50, color: color),
            const SizedBox(height: 10),
            // Translate card titles on the fly
            FutureBuilder<String>(
              future: TranslatorHelper.translate(title, langCode),
              initialData: title,
              builder: (context, snapshot) {
                return Text(snapshot.data ?? title, textAlign: TextAlign.center, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold));
              }
            )
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final langProvider = context.watch<LanguageProvider>();
    final langCode = langProvider.currentLanguage;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Farmer Dashboard'),
        backgroundColor: Colors.green[700],
        foregroundColor: Colors.white,
        actions: [
          DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: langCode,
              dropdownColor: Colors.green[800],
              icon: const Icon(Icons.language, color: Colors.white),
              items: supportedLanguages.entries.map((entry) {
                return DropdownMenuItem(
                  value: entry.key,
                  child: Text(entry.value, style: const TextStyle(color: Colors.white)),
                );
              }).toList(),
              onChanged: (val) {
                if (val != null) {
                  langProvider.setLanguage(val);
                }
              },
            ),
          ),
          IconButton(icon: const Icon(Icons.logout), onPressed: () => _logout(context)),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            FutureBuilder<String>(
              future: TranslatorHelper.translate('Welcome back!', langCode),
              initialData: 'Welcome back!',
              builder: (context, snapshot) {
                return Text(snapshot.data ?? 'Welcome back!', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold));
              }
            ),
            FutureBuilder<String>(
              future: TranslatorHelper.translate('What would you like to do today?', langCode),
              initialData: 'What would you like to do today?',
              builder: (context, snapshot) {
                return Text(snapshot.data ?? 'What would you like to do today?', style: const TextStyle(fontSize: 16, color: Colors.grey));
              }
            ),
            const SizedBox(height: 20),
            Expanded(
              child: GridView.count(
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                children: [
                  _buildDashboardCard(context, 'Marketplace', Icons.store, Colors.orange, const MarketplaceScreen(), langCode),
                  _buildDashboardCard(context, 'Disease AI', Icons.health_and_safety, Colors.red, const DiseaseDetectionScreen(), langCode),
                  _buildDashboardCard(context, 'Weather', Icons.cloud, Colors.blue, const WeatherScreen(), langCode),
                  _buildDashboardCard(context, 'AgriBot Chat', Icons.chat, Colors.green, const ChatScreen(), langCode),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
