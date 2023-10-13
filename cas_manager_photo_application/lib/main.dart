import 'package:cas_photo_manager_application/Pages/Login.dart';
import 'package:cas_photo_manager_application/Pages/SignUp.dart';
import 'package:cas_photo_manager_application/userData/UserData.dart';
import 'package:flutter/material.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:postgres/postgres.dart';
import 'package:cas_photo_manager_application/databaseManager/ConnectDatabase.dart' as dbConnection;
import 'package:camera/camera.dart';
import 'Pages/Dashboard.dart';

void main() async {
  WidgetsBinding widgetsBinding = WidgetsFlutterBinding.ensureInitialized();
  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);
  runApp(const CasApp());
  FlutterNativeSplash.remove();
}

class CasApp extends StatefulWidget {
  const CasApp({super.key});

  @override
  State<CasApp> createState() => _MyCasAppState();
}

class _MyCasAppState extends State<CasApp> {
  late UserData userData;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: "CAS Photo Manager",
      theme: ThemeData(
        primarySwatch: Colors.orange,
        scaffoldBackgroundColor: Colors.white,
      ),
      routes: {
        '/login': (context) => const Login(),
        '/signup': (context) => const SignUp(),
        '/dashboard': (context,) => Dashboard(userData: userData)
      },
      home: const Scaffold(
        body: Login(),
      ),
    );
  }
}
