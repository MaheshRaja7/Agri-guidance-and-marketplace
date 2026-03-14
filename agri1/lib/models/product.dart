class Product {
  final String id;
  final String name;
  final String description;
  final double price;
  final int stock;
  final String farmerId;
  final String farmerName;

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.stock,
    required this.farmerId,
    required this.farmerName,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      stock: json['stock'] ?? 0,
      farmerId: json['farmerId'] is String ? json['farmerId'] : (json['farmerId']['_id'] ?? ''),
      farmerName: json['farmerId'] is Map ? (json['farmerId']['name'] ?? '') : '',
    );
  }
}
