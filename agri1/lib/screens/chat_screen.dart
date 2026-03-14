import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../utils/constants.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  
  final List<Map<String, String>> _messages = [
    {
      'sender': 'bot', 
      'text': 'Hello! I am AgriBot. I can provide crop recommendations, irrigation advice, and pest control strategies based on real-time weather. How can I help you today?'
    }
  ];
  bool _isLoading = false;

  Future<void> _sendMessage() async {
    if (_messageController.text.trim().isEmpty) return;
    
    final userMessage = _messageController.text.trim();
    setState(() {
      _messages.add({'sender': 'user', 'text': userMessage});
      _messageController.clear();
      _isLoading = true;
    });
    
    _scrollToBottom();

    try {
      final response = await http.post(
        Uri.parse('\${Constants.apiBaseUrl}/chat'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'message': userMessage,
          'location': 'Mumbai', // In a real app we'd get the actual user location from device
          'userId': 'flutter_user_123',
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _messages.add({'sender': 'bot', 'text': data['response']});
        });
      } else {
        setState(() {
          _messages.add({'sender': 'bot', 'text': 'Sorry, I am having trouble connecting to the server.'});
        });
      }
    } catch (e) {
      setState(() {
        _messages.add({'sender': 'bot', 'text': 'Network error. Please try again later.'});
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
      _scrollToBottom();
    }
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Crop Advisor'),
        backgroundColor: Colors.green[700],
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(12.0),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final isUser = _messages[index]['sender'] == 'user';
                return Align(
                  alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    constraints: BoxConstraints(
                      maxWidth: MediaQuery.of(context).size.width * 0.75,
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    margin: const EdgeInsets.symmetric(vertical: 6),
                    decoration: BoxDecoration(
                      color: isUser ? Colors.green[600] : Colors.grey[200],
                      borderRadius: BorderRadius.only(
                        topLeft: const Radius.circular(16),
                        topRight: const Radius.circular(16),
                        bottomLeft: isUser ? const Radius.circular(16) : const Radius.circular(4),
                        bottomRight: isUser ? const Radius.circular(4) : const Radius.circular(16),
                      ),
                      boxShadow: [
                        const BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, 2))
                      ]
                    ),
                    child: Text(
                      _messages[index]['text']!,
                      style: TextStyle(
                        color: isUser ? Colors.white : Colors.black87,
                        fontSize: 16,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          if (_isLoading)
            const Padding(
              padding: EdgeInsets.all(12.0),
              child: Align(
                alignment: Alignment.centerLeft,
                child: SizedBox(
                   width: 20, height: 20,
                   child: CircularProgressIndicator(strokeWidth: 2),
                ),
              ),
            ),
          Container(
            padding: const EdgeInsets.all(8.0),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(color: Colors.grey.withOpacity(0.2), spreadRadius: 1, blurRadius: 5)
              ]
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      decoration: InputDecoration(
                        hintText: 'Ask about crops, diseases...',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide.none,
                        ),
                        filled: true,
                        fillColor: Colors.grey[100],
                        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                      ),
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  CircleAvatar(
                    backgroundColor: Colors.green[700],
                    child: IconButton(
                      icon: const Icon(Icons.send, color: Colors.white),
                      onPressed: _isLoading ? null : _sendMessage,
                    ),
                  ),
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
  
  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }
}
