import 'package:cas_photo_manager_application/Pages/Login.dart';
import 'package:cas_photo_manager_application/databaseManager/FrontEndApp.dart';
import 'package:flutter/material.dart';

import '../widgets/AlertMessagePopup.dart';

class SignUp extends StatefulWidget {
  const SignUp({super.key});

  @override
  State<SignUp> createState() => _SignUpState();
}

class _SignUpState extends State<SignUp> {
  String nome = "";
  String email = "";
  String password = "";
  Map loginData = {"nome": "", "email": "", "password": ""};
  final formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          automaticallyImplyLeading: false,
          title: const Text(
            "CAS Photo Manager",
            style: TextStyle(fontSize: 22),
          ),
        ),
        body: SingleChildScrollView(
            child: Center(
          child: Column(children: [
            Container(
              width: 400,
              //color: Colors.orangeAccent,
              margin: const EdgeInsets.only(top: 50, left: 10, right: 10),
              //padding: const EdgeInsets.only(bottom: 10, left: 10, right: 10, top: 10),
              child: const Column(
                children: [
                  Padding(
                    padding: EdgeInsets.all(8.0),
                    child: Image(
                      image: AssetImage("assets/photologo.png"),
                      width: 160,
                      height: 160,
                    ),
                  ),
                  Padding(
                      padding: EdgeInsets.all(8.0),
                      child: Text(
                        'Registrati',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                            fontSize: 40, fontWeight: FontWeight.bold),
                      )),
                ],
              ),
            ),
            // Container per il form
            Container(
              width: 400,
              height: 350,
              //color: Colors.orangeAccent,
              margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 10),
              child: Form(
                key: formKey,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 15),
                      child: TextFormField(
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Inserisci nome';
                          }
                          return null;
                        },
                        onSaved: (value) {
                          loginData['nome'] = value;
                        },
                        onChanged: (text) {
                          setState(() {
                            email = text;
                          });
                        },
                        textInputAction: TextInputAction.next,
                        decoration: const InputDecoration(
                          label: Text(
                            'Nome',
                            style: TextStyle(
                                fontSize: 20, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 15),
                      child: TextFormField(
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Inserisci email';
                          }
                          return null;
                        },
                        onSaved: (value) {
                          loginData['email'] = value;
                        },
                        onChanged: (text) {
                          setState(() {
                            email = text;
                          });
                        },
                        textInputAction: TextInputAction.next,
                        decoration: const InputDecoration(
                          label: Text(
                            'Email',
                            style: TextStyle(
                                fontSize: 20, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(
                          left: 15, right: 15, bottom: 15),
                      child: TextFormField(
                        obscureText: true, // Nasconde i caratteri della password
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Inserisci password';
                          }
                          return null;
                        },
                        onSaved: (value) {
                          loginData['password'] = value;
                        },
                        onChanged: (text) {
                          setState(() {
                            password = text;
                          });
                        },
                        decoration: const InputDecoration(
                          label: Text(
                            'Password',
                            style: TextStyle(
                                fontWeight: FontWeight.bold, fontSize: 20),
                          ),
                        ),
                      ),
                    ),
                    Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: ElevatedButton(
                            onPressed: () async {
                              if (formKey.currentState!.validate()) {
                                formKey.currentState!.save();

                                //Chiamata al db per registrare l'utente
                                final resultSignup = await registerToServer(loginData['nome'],
                                    loginData['email'], loginData['password'], context);


                                switch (resultSignup) {
                                  case RegistrationStatus.success:
                                    const messageError = "Registrazione completata!";
                                    const titleMessageError = "Successo";
                                    // ignore: use_build_context_synchronously
                                    showDialog(context: context,
                                        builder: (BuildContext context) {
                                          return const AlertMessagePopup(message: messageError, titleMessage: titleMessageError,
                                              redirectToRoute: '/login');
                                        });
                                    break;
                                  case RegistrationStatus.userExists:
                                    const messageError = "Utente già registrato!";
                                    const titleMessageError = "Errore";
                                    // ignore: use_build_context_synchronously
                                    showDialog(context: context,
                                        builder: (BuildContext context) {
                                          return const AlertMessagePopup(message: messageError, titleMessage: titleMessageError,
                                            redirectToRoute: '/signup',);
                                        });
                                    break;
                                    default:
                                }
                              }
                            },
                            style: ElevatedButton.styleFrom(
                                minimumSize: const Size(350, 50)),
                            child: const Text(
                              'Registrati',
                              style: TextStyle(
                                  fontWeight: FontWeight.bold, fontSize: 20),
                            ))),
                    Padding(
                      padding: const EdgeInsets.only(top: 15),
                      child: TextButton(
                        onPressed: () {
                          // Naviga alla pagina di Login
                          Navigator.of(context)
                              .pushReplacement(MaterialPageRoute(
                            builder: (context) => const Login(),
                          ));
                        },
                        child: const Text(
                          'Hai già un account? Accedi!',
                          style: TextStyle(
                              decoration: TextDecoration.underline,
                              fontSize: 20),
                        ),
                      ),
                    )
                  ],
                ),
              ),
            )
          ]),
        )));
  }
}
