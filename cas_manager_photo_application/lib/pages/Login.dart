import 'package:cas_photo_manager_application/Pages/Dashboard.dart';
import 'package:cas_photo_manager_application/userData/UserData.dart';
import 'package:cas_photo_manager_application/widgets/AlertMessagePopup.dart';
import 'package:cas_photo_manager_application/Pages/SignUp.dart';
import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:cas_photo_manager_application/databaseManager/FrontEndApp.dart';

///Classe che rappresenta la pagina di login dell'utente
class Login extends StatefulWidget {
  const Login({super.key});

  @override
  State<Login> createState() => _LoginState();
}

class _LoginState extends State<Login> {
  String email = "";
  String password = "";
  Map loginData = {"email": "", "password": ""};
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
              margin: const EdgeInsets.only(top: 50, left: 10, right: 10),
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
                        'Login',
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
                            return 'Inserisci email';
                          }
                          return null;
                        },
                        onSaved: (value) {
                          loginData['email'] = value;
                        },
                        keyboardType: TextInputType.emailAddress,
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
                        obscureText: true,
                        // Nasconde i caratteri della password
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

                                final resultLogin = await loginToServer(loginData['email'], loginData['password'], context);
                                switch (resultLogin.status) {
                                  case LoginStatus.success:
                                    List<Photo> photosUser = [];
                                    List<Collezione> collezioni = [];

                                    UserData userLogin = UserData(
                                        idUtente: resultLogin.userData?[0],
                                        nome: resultLogin.userData?[1],
                                        email: resultLogin.userData?[2],
                                        password: resultLogin.userData?[3],
                                        collezioni: []);


                                    if (resultLogin.userPhotoData!.isNotEmpty) {
                                      for (int i = 0; i < resultLogin.userPhotoData!.length; i++) {
                                        try {

                                          //Conversione della foto ricevuta dal database
                                          final base64String = resultLogin.userPhotoData?[i][4];
                                          final cleanedBase64 = base64String.replaceAll('\n', '').replaceAll('\r', '');
                                          final decodedImage = base64Decode(cleanedBase64);

                                          //Estrazione del punto dal geotag relativo alla foto
                                          final double longitudine = resultLogin.userPhotoData?[i][5]?.toDouble() ?? 0.0;
                                          final double latitudine = resultLogin.userPhotoData?[i][6]?.toDouble() ?? 0.0;
                                          final GeoTag geoTag = GeoTag(latitudine: latitudine, longitudine: longitudine);

                                          Photo newPhoto = Photo(
                                              idPhoto: resultLogin.userPhotoData?[i][0],
                                              immagine: decodedImage,
                                              nomeFoto: resultLogin.userPhotoData?[i][1],
                                              idUtente: resultLogin.userPhotoData?[i][3],
                                              indirizzo: resultLogin.userPhotoData?[i][2],
                                              geoTag: geoTag,
                                              nomeCollezione: resultLogin.userPhotoData?[i][7],
                                              nomeAutore: userLogin.nome
                                          );

                                          photosUser.add(newPhoto);

                                          //Assegnazione delle foto alla collezione appartenente
                                          Map<String, List<Photo>> collezioniMap = {};

                                          for (var photo in photosUser) {
                                            if (!collezioniMap.containsKey(photo.nomeCollezione)) {
                                              // Se la collezione non esiste ancora
                                              collezioniMap[photo.nomeCollezione] = [photo];
                                            } else {
                                              // Aggiunge la foto alla collezione esistente
                                              collezioniMap[photo.nomeCollezione]!.add(photo);
                                            }
                                          }

                                          collezioni = collezioniMap.entries.map((entry) {
                                            return Collezione(
                                                idUtente: resultLogin.userData?[0],
                                                nameAlbum: entry.key,
                                                photos: entry.value,
                                                isSharedCollection: false);
                                          }).toList();

                                        } catch (e, s) {
                                          print(
                                              'Errore nella decodifica della stringa base64: ${e}');
                                          print('StackTrace: ${s}');
                                        }
                                      }
                                    }

                                    userLogin.collezioni.addAll(collezioni);

                                    //Gestione delle collezioni condivise con l'utente
                                    try {
                                      List<Photo> photosUserShared = [];
                                      List<Collezione> collezioniShared = [];

                                      //Recupero di tutti gli utenti che hanno condiviso la propria galleria con l'utente che sta accedendo
                                      var sharedUsers = await getShareDatabase(userLogin.idUtente);

                                      if (sharedUsers != []) {
                                        for (var res in sharedUsers) {
                                          var resultPhotoShared = await getFotoUserDatabase(res[0]);
                                          var nameUser = await getNameFromIDUser(res[0]);

                                          print("SONO STATE TROVATE ${resultPhotoShared.userPhotoData?.length.toString()} foto di utente ${res[0]}");

                                          if (resultPhotoShared.status == GetFotoUserDB.success) {
                                            for (int i = 0; i < resultPhotoShared.userPhotoData!.length; i++) {
                                              try {
                                                //Conversione della foto ricevuta dal database
                                                final base64String = resultPhotoShared.userPhotoData?[i][4];
                                                final cleanedBase64 = base64String.replaceAll('\n', '').replaceAll('\r', '');
                                                final decodedImage = base64Decode(cleanedBase64);

                                                //Estrazione del punto dal geotag relativo alla foto
                                                final double longitudine = resultPhotoShared.userPhotoData?[i][5]?.toDouble() ?? 0.0;
                                                final double latitudine = resultPhotoShared.userPhotoData?[i][6]?.toDouble() ?? 0.0;
                                                final GeoTag geoTag = GeoTag(latitudine: latitudine, longitudine: longitudine);

                                                Photo newPhoto = Photo(
                                                    idPhoto: resultPhotoShared.userPhotoData?[i][0],
                                                    immagine: decodedImage,
                                                    nomeFoto: resultPhotoShared.userPhotoData?[i][1],
                                                    idUtente: resultPhotoShared.userPhotoData?[i][3],
                                                    indirizzo: resultPhotoShared.userPhotoData?[i][2],
                                                    geoTag: geoTag,
                                                    nomeCollezione: resultPhotoShared.userPhotoData?[i][7],
                                                nomeAutore: nameUser[0].toString());

                                                photosUserShared.add(newPhoto);

                                                //Assegnazione delle foto alla collezione appartenente
                                                Map<String, List<Photo>> collezioniMapShared = {};

                                                //Se la collezione esiste già essa non viene aggiunta alla lista delle collezioni
                                                bool collezioneEsistente = userLogin.collezioni.any((collezione) {
                                                  return collezione.idUtente == resultPhotoShared.userPhotoData?[i][3] && collezione.nameAlbum == resultPhotoShared.userPhotoData?[i][7];
                                                });

                                                if(!collezioneEsistente) {
                                                  for (var photo in photosUserShared) {
                                                    if (!collezioniMapShared.containsKey(photo.nomeCollezione)) {
                                                      print("collezione esistente non esistente");
                                                      // Se la collezione non esiste ancora
                                                      collezioniMapShared[photo.nomeCollezione] = [photo];
                                                    } else {
                                                      // Aggiunge la foto alla collezione esistente
                                                      collezioniMapShared[photo.nomeCollezione]!.add(photo);
                                                      print("collezione esistente esistente");
                                                    }
                                                  }

                                                  collezioniShared =
                                                      collezioniMapShared.entries.map((entry) {
                                                        print("${entry.key}, ${entry.value}");
                                                        return Collezione(
                                                            idUtente: resultPhotoShared.userPhotoData?[i][3],
                                                            nameAlbum: entry.key,
                                                            photos: entry.value,
                                                            isSharedCollection: true);
                                                      }).toList();
                                                }
                                              } catch (e, s) {
                                                print('Errore nella decodifica della stringa base64: ${e}');
                                                print('StackTrace: ${s}');
                                              }
                                            }
                                          }
                                        }
                                        print(collezioniShared.length);
                                        setState(() {
                                          userLogin.collezioni.addAll(collezioniShared);
                                        });
                                      }
                                    } catch (e, s) {
                                      print('Errore durante il recupero delle foto condivise: $e');
                                      print(s);
                                    }

                                    // ignore: use_build_context_synchronously
                                    Navigator.of(context)
                                        .pushReplacement(MaterialPageRoute(
                                      builder: (context) =>
                                          Dashboard(userData: userLogin),
                                    ));
                                    break;
                                  case LoginStatus.errorPassword:
                                    const messageError =
                                        "Password non corretta!";
                                    const titleMessageError = "Errore";
                                    // ignore: use_build_context_synchronously
                                    showDialog(
                                        context: context,
                                        builder: (BuildContext context) {
                                          return const AlertMessagePopup(
                                              message: messageError,
                                              titleMessage: titleMessageError,
                                              redirectToRoute: '/login');
                                        });
                                    break;
                                  case LoginStatus.userNotRegister:
                                    const messageError =
                                        "Utente non registrato!";
                                    const titleMessageError = "Errore";
                                    // ignore: use_build_context_synchronously
                                    showDialog(
                                        context: context,
                                        builder: (BuildContext context) {
                                          return const AlertMessagePopup(
                                              message: messageError,
                                              titleMessage: titleMessageError,
                                              redirectToRoute: '/login');
                                        });
                                    break;
                                  default:
                                }

                                //print();
                              }
                            },
                            style: ElevatedButton.styleFrom(
                                minimumSize: const Size(350, 50)),
                            child: const Text(
                              'Accedi',
                              style: TextStyle(
                                  fontSize: 23, fontWeight: FontWeight.bold),
                            ))),
                    Padding(
                      padding: const EdgeInsets.only(top: 15),
                      child: TextButton(
                        onPressed: () {
                          Navigator.of(context)
                              .pushReplacement(MaterialPageRoute(
                            builder: (context) => const SignUp(),
                          ));
                        },
                        child: const Text(
                          'Non sei registrato? Creane uno',
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