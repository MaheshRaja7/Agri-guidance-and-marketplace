import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/product.dart';
import '../utils/constants.dart';

class ProductService {
  Future<List<Product>> getProducts() async {
    try {
      final response = await http.get(Uri.parse('\${Constants.apiBaseUrl}/marketplace/products'));
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Product.fromJson(json)).toList();
      }
    } catch (e) {
      print('Error fetching products: \$e');
    }
    return [];
  }

  // Add more methods for getFarmerProducts, addProduct, updateProduct, deleteProduct...
}
