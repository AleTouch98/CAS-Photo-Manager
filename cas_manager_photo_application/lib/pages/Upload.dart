import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:cas_photo_manager_application/cameras/CollectionList.dart';
import 'package:cas_photo_manager_application/databaseManager/FrontEndApp.dart';
import 'package:cas_photo_manager_application/pages/Gallery.dart';
import 'package:cas_photo_manager_application/widgets/AlertMessagePopup.dart';
import 'package:flutter/material.dart';
import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:cas_photo_manager_application/userData/UserData.dart';
import 'package:permission_handler/permission_handler.dart';

///Classe che rappresenta la pagina di upload dell'utente
class Upload extends StatefulWidget {
  final UserData userData; //Dati dell'utente

  const Upload({super.key, required this.userData});

  @override
  State<Upload> createState() => _UploadState();
}

class _UploadState extends State<Upload> {
  TextEditingController albumNameController = TextEditingController();
  late UserData userData;

  ///All'avvio del widget, vengono salvati i dati passati in input
  @override
  void initState() {
    super.initState();
    userData = widget.userData;
  }

  ///Funzione che gestisce il caricamento dalla galleria di un immagine all'interno di una collezione
  Future<void> pickImageFromGallery() async {
    // ignore: use_build_context_synchronously
    Navigator.of(context).push(
        MaterialPageRoute(builder: (context) => AlbumList(userData: userData)));
  }

  /// Funzione che permette di determinare la posizione attuale dell'utente
  Future<Position> determinePosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      await Geolocator.openLocationSettings();
      return Future.error('Location services are disabled.');
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return Future.error('Location permissions are denied');
      }
    }

    if (permission == LocationPermission.deniedForever) {
      return Future.error(
          'Location permissions are permanently denied, we cannot request permissions.');
    }
    return await Geolocator.getCurrentPosition();
  }

  ///Funzione che estrae le informazioni riguardo l'indirizzo di una posizione
  Future<String> getDataFromPosition(Position position) async {
    List<Placemark> dataPlacemark =
        await placemarkFromCoordinates(position.latitude, position.longitude);
    return "${dataPlacemark[0].street} ${dataPlacemark[0].name}\n${dataPlacemark[0].locality} ${dataPlacemark[0].postalCode}\n${dataPlacemark[0].country}";
  }

  ///Funzione che mostra il dialog per la creazione di una collezione
  Future<void> showCreateCollectionDialog() async {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text("Crea un nuovo album"),
          content: TextField(
            controller: albumNameController,
            decoration: const InputDecoration(labelText: "Nome album"),
          ),
          actions: <Widget>[
            TextButton(
              child: const Text("Cancella"),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
            TextButton(
                child: const Text("Crea album"),
                onPressed: () async {
                  String albumName = albumNameController.text;

                  if (albumName.isNotEmpty) {
                    //Alle foto selezionate dalla galleria viene assegnata la posizione attuale
                    Position position = await determinePosition();
                    String detailPosition =
                        await (getDataFromPosition(position));
                    String formattedGeoTag =
                        'POINT(${position.longitude} ${position.latitude})';
                    int maxIdPhoto = await getMaxIDPhoto(userData);

                    PermissionStatus statusPhotos =
                        await Permission.photos.request();

                    print("statusPhotos $statusPhotos");

                    if (statusPhotos == PermissionStatus.granted) {
                      List<XFile>? selectedImages =
                          await ImagePicker().pickMultiImage();

                      if (selectedImages.isNotEmpty) {
                        try {
                          final response = await loadPhotoDataBase(
                              userData,
                              selectedImages,
                              detailPosition,
                              formattedGeoTag,
                              albumName);

                          if (response == LoadFotoDB.success) {
                            List<Photo> selectedPhotos = await Future.wait(selectedImages.map((image) async {
                              final file = File(image.path);
                              Uint8List imageBytes = await file.readAsBytes();

                              return Photo(
                                  idPhoto: maxIdPhoto,
                                  immagine: Uint8List.fromList(imageBytes),
                                  nomeFoto: image.name,
                                  idUtente: userData.idUtente,
                                  indirizzo: detailPosition,
                                  geoTag: GeoTag(
                                      latitudine: position.latitude,
                                      longitudine: position.longitude),
                                  nomeCollezione: albumName,
                                  nomeAutore: userData.nome);
                            }).toList());

                            Collezione newAlbum = Collezione(
                                idUtente: userData.idUtente,
                                nameAlbum: albumName,
                                photos: selectedPhotos,
                                isSharedCollection: false);

                            setState(() {
                              userData.collezioni.add(newAlbum);
                            });
                            print('Foto caricate con successo!!');

                            Navigator.of(context).pop();
                            albumNameController.clear();

                            const messageError = "Foto caricata correttamente!";
                            const titleMessageError = "Successo";
                            // ignore: use_build_context_synchronously
                            showDialog(
                                context: context,
                                builder: (BuildContext context) {
                                  return const AlertMessagePopup(
                                      message: messageError,
                                      titleMessage: titleMessageError);
                                });
                          } else if (response == LoadFotoDB.errorLoad) {
                            print('Errore durante il caricamento delle foto');

                            Navigator.of(context).pop();
                            albumNameController.clear();

                            const messageError = "Errore durante il caricamento delle foto!";
                            const titleMessageError = "Errore";
                            // ignore: use_build_context_synchronously
                            showDialog(
                                context: context,
                                builder: (BuildContext context) {
                                  return const AlertMessagePopup(
                                      message: messageError,
                                      titleMessage: titleMessageError);
                                });
                          } else {
                            print(
                                'Errore server durante il caricamento delle foto');
                          }
                        } catch (e, s) {
                          print('Errore durante la lettura dell\'immagine: $e');
                          print('\n$s');
                        }
                      }
                    } else if (statusPhotos == PermissionStatus.denied) {
                      print('Permesso non consentito');
                    } else if (statusPhotos == PermissionStatus.limited) {
                      openAppSettings();
                    }
                  }
                }),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: const Text(
          "Carica",
          style: TextStyle(fontSize: 22),
        ),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            GestureDetector(
              onTap: pickImageFromGallery,
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  color: Colors.orangeAccent,
                  borderRadius: BorderRadius.circular(8.0),
                ),
                child: const Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.photo_camera_back,
                      size: 45,
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Aggiungi foto ad album',
                      style:
                          TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 80),
            GestureDetector(
              onTap: () async {
                await showCreateCollectionDialog();
              },
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  color: Colors.orangeAccent,
                  borderRadius: BorderRadius.circular(8.0),
                ),
                child: const Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.photo_album,
                      size: 45,
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Crea un nuovo album',
                      style:
                          TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
