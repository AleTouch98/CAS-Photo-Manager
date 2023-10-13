import 'dart:io';
import 'dart:typed_data';
import 'package:cas_photo_manager_application/databaseManager/FrontEndApp.dart';
import 'package:cas_photo_manager_application/widgets/AlertMessagePopup.dart';
import 'package:flutter/material.dart';
import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:cas_photo_manager_application/userData/UserData.dart';

///Classe che mostra gli album creati su cui inserire l'immagine scattata tramite fotocamera
class AlbumContainer extends StatefulWidget {
  final UserData userData;      //Dati dell'utente
  final XFile image;            //Immagine
  final Position position;      //Posizione
  final String detailsPosition; //Dettagli della posizione

  const AlbumContainer(
      {super.key,
      required this.userData,
      required this.image,
      required this.position,
      required this.detailsPosition});

  @override
  _AlbumContainerState createState() => _AlbumContainerState();
}

class _AlbumContainerState extends State<AlbumContainer> {
  late UserData userData;
  late XFile image;
  late Position position;
  late String detailsPosition;

  ///All'avvio del widget, vengono salvati i dati passati in input
  @override
  void initState() {
    super.initState();
    userData = widget.userData;
    image = widget.image;
    position = widget.position;
    detailsPosition = widget.detailsPosition;
  }

  /// Funzione che permette di determinare la posizione attuale dell'utente
  Future<Position> determinePosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      await Geolocator.openLocationSettings();
      return Future.error('I servizi di localizzazione sono disattivati.');
    }

    ///Controllo se l'utente ha dato accesso ai servizi di localizzazione.
    ///Se non sono stati concessi i permetti, viene fatta la richiesta
    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return Future.error('Permessi di localizzazione rifiutati');
      }
    }

    ///Caso in cui l'utente ha rifiutato in modo permanente i servizi di localizzazione
    if (permission == LocationPermission.deniedForever) {
      return Future.error('I servizi di localizzazione sono stati disattivati in modo permanente.');
    }
    return await Geolocator.getCurrentPosition();
  }

  ///Funzione che estrae le informazioni riguardo l'indirizzo di una posizione
  Future<String> getDataFromPosition(Position position) async {
    List<Placemark> dataPlacemark =
        await placemarkFromCoordinates(position.latitude, position.longitude);
    return "${dataPlacemark[0].street} ${dataPlacemark[0].name}\n${dataPlacemark[0].locality} ${dataPlacemark[0].postalCode}\n${dataPlacemark[0].country}";
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
              estratto il punto geografico. Successivamente, dopo lo scatto della fotografia
              tramite fotocamera, vengono mostrati gli album su cui inserire l'immagine.
             */
            onTap: () async {
              String detailPosition = await (getDataFromPosition(position));
              String formattedGeoTag ='POINT(${position.longitude} ${position.latitude})';
              int maxIdPhoto = await getMaxIDPhoto(userData);
              List<XFile> selectedPhoto = [];
              selectedPhoto.add(image);

              try {
                //Richiesta al db per il caricamento della foto
                final response = await loadPhotoDataBase(
                    userData,
                    selectedPhoto,
                    detailPosition,
                    formattedGeoTag,
                    userData.collezioni[index].nameAlbum);

                //Caso in cui l'immagine è stata caricata con successo. La foto viene aggiunta
                //nell'album selezionato
                if (response == LoadFotoDB.success) {
                  List<Photo> selectedPhotos = await Future.wait(selectedPhoto.map((image) async {
                    final file = File(image.path);
                    Uint8List imageBytes = await file.readAsBytes();

                    return Photo(
                        idPhoto: maxIdPhoto,
                        immagine: Uint8List.fromList(imageBytes),
                        nomeFoto: image.name,
                        idUtente: userData.idUtente,
                        indirizzo: detailPosition,
                        geoTag: GeoTag(latitudine: position.latitude, longitudine: position.longitude),
                        nomeCollezione: userData.collezioni[index].nameAlbum,
                    nomeAutore: userData.nome);
                  }).toList());

                  setState(() {
                    userData.collezioni[index].photos.addAll(selectedPhotos);
                  });

                  //Alert di caricamento avvenuto con successo
                  Navigator.of(context).pop();
                  const messageSuccess = "Foto caricata correttamente!";
                  const titleMessageSuccess = "Successo";
                  // ignore: use_build_context_synchronously
                  showDialog(
                      context: context,
                      builder: (BuildContext context) {
                        return const AlertMessagePopup(
                            message: messageSuccess,
                            titleMessage: titleMessageSuccess);
                      });
                  print('Foto caricata con successo!!');
                }
                //Caso in cui la foto non è stata caricata. Viene mostrato un messaggio di errore
                else if (response == LoadFotoDB.errorLoad) {
                  print('Errore durante il caricamento delle foto');
                  Navigator.of(context).pop();
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
                  print('Errore server durante il caricamento delle foto');
                }
              } catch (e, s) {
                print('Errore durante la lettura dell\'immagine: $e');
                print('\n$s');
              }
              Navigator.of(context).pop();
            },
          );
        },
      ),
    );
  }
}
