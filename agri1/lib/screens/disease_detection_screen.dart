import 'package:flutter/material.dart';
import 'dart:io';
import 'dart:convert';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import '../utils/constants.dart';

class DiseaseDetectionScreen extends StatefulWidget {
  const DiseaseDetectionScreen({super.key});

  @override
  State<DiseaseDetectionScreen> createState() => _DiseaseDetectionScreenState();
}

class _DiseaseDetectionScreenState extends State<DiseaseDetectionScreen> {
  File? _image;
  final picker = ImagePicker();
  bool _isAnalyzing = false;
  Map<String, dynamic>? _result;
  String _error = '';

  Future<void> _getImage(ImageSource source) async {
    try {
      final pickedFile = await picker.pickImage(source: source);
      if (pickedFile != null) {
        setState(() {
          _image = File(pickedFile.path);
          _result = null;
          _error = '';
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to pick image: \$e')));
      }
    }
  }

  Future<void> _analyzeImage() async {
    if (_image == null) return;
    
    setState(() {
      _isAnalyzing = true;
      _error = '';
    });

    try {
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('\${Constants.apiBaseUrl}/detect-disease'),
      );
      
      request.files.add(
        await http.MultipartFile.fromPath('image', _image!.path),
      );

      final response = await request.send();
      final responseBody = await response.stream.bytesToString();

      if (response.statusCode == 200) {
        setState(() {
          _result = jsonDecode(responseBody);
        });
      } else {
        setState(() {
          _error = 'Failed to analyze image. Status code: \${response.statusCode}. \$responseBody';
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Error analyzing image: \$e';
      });
    } finally {
      setState(() {
        _isAnalyzing = false;
      });
    }
  }

  Color _getSeverityColor(String severity) {
    if (severity == 'Low') return Colors.green;
    if (severity == 'Medium') return Colors.orange;
    if (severity == 'High') return Colors.red;
    if (severity == 'Critical') return Colors.red[900]!;
    return Colors.grey;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Disease Detection'),
        backgroundColor: Colors.green[700],
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Image Preview Card
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    _image == null
                        ? Container(
                            height: 200,
                            decoration: BoxDecoration(
                              color: Colors.grey[200],
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.photo_library, size: 50, color: Colors.grey),
                                  SizedBox(height: 10),
                                  Text('No image selected', style: TextStyle(color: Colors.grey)),
                                ],
                              ),
                            ),
                          )
                        : ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: Image.file(_image!, height: 250, fit: BoxFit.cover),
                          ),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        ElevatedButton.icon(
                          onPressed: _isAnalyzing ? null : () => _getImage(ImageSource.camera),
                          icon: const Icon(Icons.camera_alt),
                          label: const Text('Camera'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green[50],
                            foregroundColor: Colors.green[800],
                          ),
                        ),
                        ElevatedButton.icon(
                          onPressed: _isAnalyzing ? null : () => _getImage(ImageSource.gallery),
                          icon: const Icon(Icons.photo_library),
                          label: const Text('Gallery'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green[50],
                            foregroundColor: Colors.green[800],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: (_image != null && !_isAnalyzing) ? _analyzeImage : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green[700],
                        foregroundColor: Colors.white,
                        minimumSize: const Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: _isAnalyzing 
                          ? const CircularProgressIndicator(color: Colors.white) 
                          : const Text('Analyze Crop', style: TextStyle(fontSize: 18)),
                    ),
                  ],
                ),
              ),
            ),
            
            if (_error.isNotEmpty) ...[
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: Colors.red[50], borderRadius: BorderRadius.circular(10), border: Border.all(color: Colors.red[200]!)),
                child: Text(_error, style: TextStyle(color: Colors.red[900])),
              )
            ],

            // Results Section
            if (_result != null) ...[
              const SizedBox(height: 20),
              Card(
                elevation: 4,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.health_and_safety, color: _getSeverityColor(_result!['severity'] ?? 'Medium'), size: 30),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(_result!['diseaseName'] ?? 'Unknown', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: _getSeverityColor(_result!['severity'] ?? 'Medium'))),
                                Text('Confidence: \${((_result!['confidence'] ?? 0.0) * 100).toStringAsFixed(1)}% | Severity: \${_result!['severity'] ?? 'Medium'}', style: TextStyle(color: Colors.grey[700])),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 15),
                      Text(_result!['description'] ?? '', style: const TextStyle(fontSize: 16)),
                      const SizedBox(height: 15),
                      if (_result!['symptoms'] != null && (_result!['symptoms'] as List).isNotEmpty) ...[
                        const Text('Symptoms', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        ...(_result!['symptoms'] as List).map((s) => Row(crossAxisAlignment: CrossAxisAlignment.start, children: [const Text('• '), Expanded(child: Text(s.toString()))])),
                        const SizedBox(height: 10),
                      ],
                      if (_result!['treatments'] != null && (_result!['treatments'] as List).isNotEmpty) ...[
                        const Text('Treatments', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        ...(_result!['treatments'] as List).map((t) => Row(crossAxisAlignment: CrossAxisAlignment.start, children: [const Text('• '), Expanded(child: Text(t.toString()))])),
                        const SizedBox(height: 10),
                      ],
                      if (_result!['prevention'] != null && (_result!['prevention'] as List).isNotEmpty) ...[
                        const Text('Prevention', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        ...(_result!['prevention'] as List).map((p) => Row(crossAxisAlignment: CrossAxisAlignment.start, children: [const Text('• '), Expanded(child: Text(p.toString()))])),
                      ],
                    ],
                  ),
                ),
              )
            ]
          ],
        ),
      ),
    );
  }
}
