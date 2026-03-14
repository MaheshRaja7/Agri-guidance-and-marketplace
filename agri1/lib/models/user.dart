class User {
  final String id;
  final String name;
  final String email;
  final String role;
  final String phone;
  final String token;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.phone,
    required this.token,
  });

  factory User.fromJson(Map<String, dynamic> json, String token) {
    return User(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? '',
      phone: json['phone'] ?? '',
      token: token,
    );
  }
}
