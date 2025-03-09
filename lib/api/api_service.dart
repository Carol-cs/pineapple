import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:pineapple/model/UserModel.dart';

class ApiService {
  final String baseUrl = "https://pineapple-6bdm.onrender.com/pineapple/api"; 

  // ✅ Fetch user data with Debugging Logs
  Future<Map<String, dynamic>?> fetchUserData(String userId, String firstName, String lastName) async {
    try {
      print("🔹 Sending Request to: $baseUrl");
      print("🔹 User ID: $userId");

      final response = await http.post(
        Uri.parse('$baseUrl/auth'),
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonEncode({"uid": userId, "firstname": firstName, "lastname": lastName}),
      ).timeout(Duration(seconds: 10)); // Timeout after 10 seconds

      print("🔹 Response Status Code: ${response.statusCode}");
      print("🔹 Response Body: ${response.body}");

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        print("❌ Error: ${response.reasonPhrase}");
        return null;
      }
    } catch (e) {
      print("❌ Exception: $e");
      return null;
    }
  }


Future<String?> getRoomId(String userId, String teamName) async {
  final String endpoint = "$baseUrl/teams"; // Ensure this is correct

  try {
    print("🚀 Sending request to: $endpoint");
    print("📤 Request Body: ${jsonEncode({"adminUid": userId, "name": teamName})}");

    final response = await http.post(
      Uri.parse(endpoint),
      headers: {
        "Content-Type": "application/json",
      },
      body: jsonEncode({"adminUid": userId, "name": teamName}),
    );

    print("📩 Response Status Code: ${response.statusCode}");
    print("📩 Response Body: ${response.body}");

    if (response.statusCode == 201) {
      final Map<String, dynamic> data = jsonDecode(response.body);
      
      if (data.containsKey("joinToken")) {
        print("✅ Room ID received: ${data["joinToken"]}");
        return data["joinToken"];
      } else {
        print("⚠️ Response does not contain 'joinToken' key.");
        return null;
      }
    } else {
      print("❌ Failed to fetch Room ID. Status Code: ${response.statusCode}");
      print("❌ Error Response: ${response.body}");
      return null;
    }
  } catch (e) {
    print("🔥 Exception: $e");
    return null;
  }
}



Future<String?> joinRoom(String userId, String joinToken) async {
  final String endpoint = "$baseUrl/teams/join"; // Adjust with actual backend URL

  try {
    final response = await http.post(
      Uri.parse(endpoint),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "uid": userId,        // Pass user ID
        "joinToken": joinToken,  // Pass room join token
      }),
    );

    print("🔹 Response Status Code: ${response.statusCode}");
    print("🔹 Response Body: ${response.body}");

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data["team"]["name"]; // Assuming the response contains { "roomId": "ROOM12345" }
    } else {
      print("❌ Failed to join room. Status: ${response.statusCode}");
      return response.statusCode.toString();
    }
  } catch (e) {
    print("❌ Error joining room: $e");
    return null;
  }
}

Future<UserModel?> fetchUserData2(String userId) async {
  try {
    final String endpoint = "$baseUrl/users/$userId"; // ✅ Pass userId as a query parameter

    print("🔹 Sending Request to: $endpoint");

    final response = await http.get(
      Uri.parse(endpoint), // ✅ Corrected GET request
      headers: {
        "Content-Type": "application/json",
      },
    ).timeout(Duration(seconds: 10));

    print("🔹 Response Status Code: ${response.statusCode}");
    print("🔹 Response Body: ${response.body}");

    if (response.statusCode == 200) {
      final Map<String, dynamic> userData = jsonDecode(response.body);
      return UserModel.fromJson(userData); // ✅ Convert JSON response to UserModel
    } else {
      print("❌ Error: ${response.reasonPhrase}");
      return null;
    }
  } catch (e) {
    print("❌ Exception: $e");
    return null;
  }
}

Future<String?> fetchUsersInRoom(String ) async {
    //final String endpoint = "$baseUrl/teams/$"; 
}






}