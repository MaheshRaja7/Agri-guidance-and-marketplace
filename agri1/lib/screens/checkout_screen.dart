import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../providers/cart_provider.dart';
import '../services/auth_service.dart';
import '../utils/constants.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _addressController = TextEditingController();
  final _phoneController = TextEditingController();
  final _authService = AuthService();
  
  String _paymentMethod = 'upi';
  bool _isLoading = false;

  Future<void> _placeOrder() async {
    final cart = context.read<CartProvider>();
    if (cart.items.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Cart is empty')));
      return;
    }
    
    if (_addressController.text.trim().isEmpty || _phoneController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill all fields')));
      return;
    }

    setState(() => _isLoading = true);

    try {
      final token = await _authService.getToken();
      
      if (token == null) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please login to place an order')));
        setState(() => _isLoading = false);
        return;
      }

      final items = cart.items.values.map((cartItem) => {
        'productId': cartItem.product.id,
        'quantity': cartItem.quantity,
      }).toList();

      final response = await http.post(
        Uri.parse('\${Constants.apiBaseUrl}/orders/create'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'items': items,
          'totalAmount': cart.totalAmount,
          'shippingAddress': _addressController.text.trim(),
          'contactPhone': _phoneController.text.trim(),
          'paymentMethod': _paymentMethod,
        }),
      );

      if (response.statusCode == 201) {
        if (!mounted) return;
        cart.clear();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Order Placed Successfully!'), backgroundColor: Colors.green),
        );
        Navigator.popUntil(context, (route) => route.isFirst);
      } else {
        if (!mounted) return;
        try {
          final data = jsonDecode(response.body);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(data['error'] ?? 'Failed to place order')),
          );
        } catch (_) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Failed to place order (Server Error)')),
          );
        }
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Network error: \$e')),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Checkout'),
        backgroundColor: Colors.green[700],
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.green[50],
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.green[200]!)
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Total Amount:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  Text('₹\${cart.totalAmount.toStringAsFixed(2)}', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.green)),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Text('Shipping Details', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            TextField(
              controller: _addressController,
              decoration: const InputDecoration(
                labelText: 'Full Address', 
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.location_on),
              ),
              maxLines: 2,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _phoneController,
              decoration: const InputDecoration(
                labelText: 'Contact Phone Number', 
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.phone),
              ),
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 24),
            const Text('Payment Method', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Card(
              elevation: 2,
              child: Column(
                children: [
                  RadioListTile<String>(
                    title: const Text('UPI'),
                    value: 'upi',
                    groupValue: _paymentMethod,
                    onChanged: (value) => setState(() => _paymentMethod = value!),
                  ),
                  const Divider(height: 1),
                  RadioListTile<String>(
                    title: const Text('Credit / Debit Card'),
                    value: 'card',
                    groupValue: _paymentMethod,
                    onChanged: (value) => setState(() => _paymentMethod = value!),
                  ),
                  const Divider(height: 1),
                  RadioListTile<String>(
                    title: const Text('Cash on Delivery (COD)'),
                    value: 'cod',
                    groupValue: _paymentMethod,
                    onChanged: (value) => setState(() => _paymentMethod = value!),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _isLoading ? null : _placeOrder,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green[700],
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 55),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: _isLoading 
                ? const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)),
                      SizedBox(width: 12),
                      Text('Processing...', style: TextStyle(fontSize: 18)),
                    ],
                  )
                : const Text('Place Order', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
  
  @override
  void dispose() {
    _addressController.dispose();
    _phoneController.dispose();
    super.dispose();
  }
}
