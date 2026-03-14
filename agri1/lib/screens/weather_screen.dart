import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../utils/constants.dart';

class WeatherScreen extends StatefulWidget {
  const WeatherScreen({super.key});

  @override
  State<WeatherScreen> createState() => _WeatherScreenState();
}

class _WeatherScreenState extends State<WeatherScreen> {
  final TextEditingController _searchController = TextEditingController(text: 'Delhi');
  String _currentLocation = 'Delhi';
  bool _isLoading = false;
  Map<String, dynamic>? _currentWeather;
  List<dynamic> _forecast = [];
  List<dynamic> _irrigation = [];
  String _error = '';
  late final WebViewController _controller;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000));
    _fetchWeatherData();
  }

  Future<void> _fetchWeatherData() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      final currentRes = await http.get(Uri.parse('${Constants.apiBaseUrl}/weather/current?location=$_currentLocation'));
      if (currentRes.statusCode == 200) {
        final data = jsonDecode(currentRes.body);
        setState(() {
          _currentWeather = data;
        });

        // Load map
        if (_currentWeather != null) {
          final lat = _currentWeather!['lat'];
          final lon = _currentWeather!['lon'];
          _controller.loadRequest(Uri.parse(
              'https://embed.windy.com/embed2.html?lat=$lat&lon=$lon&detailLat=$lat&detailLon=$lon&width=650&height=450&zoom=10&level=surface&overlay=wind&product=ecmwf&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1'));
        }
      } else {
        throw Exception('Failed to load current weather');
      }

      final forecastRes = await http.get(Uri.parse('${Constants.apiBaseUrl}/weather/forecast?location=$_currentLocation&days=7'));
      if (forecastRes.statusCode == 200) {
        final forecastData = jsonDecode(forecastRes.body);
        setState(() {
          _forecast = forecastData['forecast'] ?? [];
          _irrigation = forecastData['irrigation'] ?? [];
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Failed to fetch weather data: \$e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _onSearch() {
    final query = _searchController.text.trim();
    if (query.isNotEmpty) {
      setState(() {
        _currentLocation = query;
      });
      _fetchWeatherData();
    }
  }

  // Basic weather icon mapper based on codes returned by our mock/Open-Meteo logic
  IconData _getWeatherIcon(String code) {
    if (code.contains('d') && code.contains('01')) return Icons.wb_sunny;
    if (code.contains('n') && code.contains('01')) return Icons.nights_stay;
    if (code.contains('02') || code.contains('03') || code.contains('04')) return Icons.cloud;
    if (code.contains('09') || code.contains('10')) return Icons.water_drop;
    if (code.contains('11')) return Icons.flash_on;
    if (code.contains('13')) return Icons.ac_unit;
    return Icons.cloud;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Weather Forecast & Irrigation'),
        backgroundColor: Colors.green[700],
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: 'Search city...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 0),
                    ),
                    onSubmitted: (_) => _onSearch(),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _onSearch,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green[700],
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.all(16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Icon(Icons.search),
                ),
              ],
            ),
          ),
          
          Expanded(
            child: _isLoading 
              ? const Center(child: CircularProgressIndicator())
              : _error.isNotEmpty 
                ? Center(child: Text(_error, style: const TextStyle(color: Colors.red)))
                : RefreshIndicator(
                    onRefresh: _fetchWeatherData,
                    child: SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      child: Padding(
                        padding: const EdgeInsets.all(12.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Current Weather Card
                            if (_currentWeather != null) ...[
                              _buildCurrentWeatherCard(),
                              const SizedBox(height: 20),
                              
                              // Live Windy Map
                              const Text('Live Weather Map', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.green)),
                              const SizedBox(height: 10),
                              Container(
                                height: 300,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: Colors.grey.shade300),
                                ),
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(12),
                                  child: WebViewWidget(controller: _controller),
                                ),
                              ),
                              const SizedBox(height: 20),
                            ],

                            // 7-Day Forecast
                            if (_forecast.isNotEmpty) ...[
                              const Text('7-Day Forecast', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.green)),
                              const SizedBox(height: 10),
                              SizedBox(
                                height: 160,
                                child: ListView.builder(
                                  scrollDirection: Axis.horizontal,
                                  itemCount: _forecast.length,
                                  itemBuilder: (context, index) {
                                    final day = _forecast[index];
                                    return _buildForecastCard(day, index == 0);
                                  },
                                ),
                              ),
                              const SizedBox(height: 20),
                            ],

                            // Irrigation Schedule
                            if (_irrigation.isNotEmpty) ...[
                              const Text('Irrigation Schedule', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.green)),
                              const SizedBox(height: 10),
                              _buildIrrigationList(),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildCurrentWeatherCard() {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(_currentWeather!['location'], style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Text(_currentWeather!['description'].toString().toUpperCase(), style: TextStyle(color: Colors.grey[600])),
                  ],
                ),
                Icon(_getWeatherIcon(_currentWeather!['icon']), size: 60, color: Colors.orange),
              ],
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Column(
                  children: [
                    Text('\${_currentWeather!['temperature']}°C', style: const TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: Colors.green)),
                    Text('Feels like \${_currentWeather!['feelsLike']}°C', style: const TextStyle(fontSize: 12)),
                  ],
                ),
                Container(width: 1, height: 50, color: Colors.grey[300]),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(children: [const Icon(Icons.water_drop, size: 16, color: Colors.blue), const SizedBox(width: 4), Text('Humidity: \${_currentWeather!['humidity']}%')]),
                    const SizedBox(height: 8),
                    Row(children: [const Icon(Icons.air, size: 16, color: Colors.grey), const SizedBox(width: 4), Text('Wind: \${_currentWeather!['windSpeed']} km/h')]),
                  ],
                ),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildForecastCard(Map<String, dynamic> day, bool isToday) {
    return Card(
      margin: const EdgeInsets.only(right: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      child: Container(
        padding: const EdgeInsets.all(12),
        width: 120,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(isToday ? "Today" : _formatDateShort(day['date']), style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            Icon(_getWeatherIcon(day['icon']), size: 40, color: Colors.blueGrey),
            const SizedBox(height: 10),
            Text('\${day['temperature']}°C', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.green)),
            Text('\${day['maxTemp']}°/\${day['minTemp']}°', style: const TextStyle(fontSize: 12, color: Colors.grey)),
          ],
        ),
      ),
    );
  }

  Widget _buildIrrigationList() {
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _irrigation.length,
      itemBuilder: (context, index) {
        final plan = _irrigation[index];
        Color badgeColor;
        switch(plan['waterAmount']) {
          case 'Heavy': badgeColor = Colors.blue[700]!; break;
          case 'Moderate': badgeColor = Colors.green[600]!; break;
          case 'Light': badgeColor = Colors.orange[400]!; break;
          default: badgeColor = Colors.red[400]!; break;
        }

        return Card(
          margin: const EdgeInsets.only(bottom: 10),
          child: ListTile(
            leading: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.calendar_today, size: 16),
                const SizedBox(height: 4),
                Text(_formatDateShort(plan['date']), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              ],
            ),
            title: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: badgeColor.withOpacity(0.2), borderRadius: BorderRadius.circular(12)),
                  child: Text(plan['waterAmount'], style: TextStyle(color: badgeColor, fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 4),
                Text(plan['recommendation'], style: const TextStyle(fontWeight: FontWeight.bold)),
                Text(plan['reason'], style: const TextStyle(fontSize: 12)),
              ],
            ),
          ),
        );
      },
    );
  }

  String _formatDateShort(String dateStr) {
    try {
      final parts = dateStr.split('-');
      if (parts.length >= 3) {
        return '\${parts[2]}/\${parts[1]}'; // DD/MM
      }
      return dateStr;
    } catch (_) {
      return dateStr;
    }
  }
}
