import 'dart:io';
import 'dart:typed_data';
import 'package:camera/camera.dart';
import 'package:cas_photo_manager_application/databaseManager/FrontEndApp.dart';
import 'package:cas_photo_manager_application/widgets/AlertMessagePopup.dart';
import 'package:flutter/material.dart';
import 'package:cas_photo_manager_application/userData/UserData.dart';
import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';

///Classe che permette di selezionare le foto dalla galleria e caricarle
///di una cartella scelta dall'utente
class AlbumList extends StatefulWidget {
  final UserData userData;  //Dati dell'utente
  final File? image;        //Immagine

  const AlbumList({super.key, required this.userData, this.image});

  @override
  State<AlbumList> createState() => _AlbumListPageState();
}

class _AlbumListPageState extends State<AlbumList> {
  late UserData userData;

  ///All'avvio del widget, vengono salvati i dati passati in input
  @override
  void initState() {
    super.initState();
    userData = widget.userData;
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
    return "${dataPlacemark[0].street} ${dataPlacemark[0].name}, ${dataPlacemark[0].locality} ${dataPlacemark[0].postalCode}, ${dataPlacemark[0].country}";
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Albums'),
      ),
      body: ListView.builder(
        itemCount: userData.collezioni.length,
        itemBuilder: (context, index) {
          return ListTile(
            leading:
                Image.asset(userData.collezioni[index].isSharedCollection ? 'assets/open_folder_share.png' : 'assets/open_folder.png', width: 50, height: 50),
            title: Text(userData.collezioni[index].nameAlbum),

            /* Al tocco dell'utente viene catturata la posizione attuale e ne viene
              estratto il punto geografico. Viene aperta la galleria dell'utente in
              cui potrà selezionare le foto da caricare. Dopo di che, viene mostrata
              la lista degli album dell'utente su cui caricare le foto precedentemente
              selezionate.
             */
            onTap: () async {
              Position position = await determinePosition();
              String detailPosition = await (getDataFromPosition(position));
              String formattedGeoTag = 'POINT(${position.longitude} ${position.latitude})';
              int maxIdPhoto = await getMaxIDPhoto(userData);

              //Richiesta dei permessi per accedere alla galleria dell'utente
              PermissionStatus statusPhotos = await Permission.photos.request();

              /* Caso in cui il permesso sia concesso. Viene permesso all'utente di
                 scegliere le foto dalla galleria.
               */
              if (statusPhotos == PermissionStatus.granted) {
                List<XFile>? selectedImages = await ImagePicker().pickMultiImage();

                //Caso in cui sia stata scelta almeno un immagine.
                if (selectedImages.isNotEmpty) {
                  try {
                    //Richiesta al db per il caricamento della foto
                    final response = await loadPhotoDataBase(
                        userData,
                        selectedImages,
                        detailPosition,
                        formattedGeoTag,
                        userData.collezioni[index].nameAlbum);

                    //Caso in cui l'immagine è stata caricata con successo. La foto viene aggiunta
                    //nell'album selezionato
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
                            nomeCollezione: userData.collezioni[index].nameAlbum,
                            nomeAutore: userData.nome);
                      }).toList());

                      setState(() {
                        userData.collezioni[index].photos.addAll(selectedPhotos);
                      });

                      //Alert di caricamento avvenuto con successo
                      Navigator.of(context).pop();
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
                      print('Foto caricate con successo!!');
                    }
                    //Caso in cui la foto non è stata caricata. Viene mostrato un messaggio di errore
                    else if (response == LoadFotoDB.errorLoad) {
                      print('Errore durante il caricamento delle foto');
                      Navigator.of(context).pop();
                      const messageError =
                          "Errore durante il caricamento delle foto!";
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
                      print('Errore server durante il caricamento delle foto');
                    }
                  } catch (e, s) {
                    print('Errore durante la lettura dell\'immagine: $e');
                    print('\n$s');
                  }
                  Navigator.of(context).pop();
                }
              }
              //Caso in cui l'utente abbia rifiutato il permesso
              else if (statusPhotos == PermissionStatus.denied) {
                print('Permesso non consentito');
              } else if (statusPhotos == PermissionStatus.limited) {
                openAppSettings();
              }
            },
          );
        },
      ),
    );
  }
}
