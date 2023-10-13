import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:permission_handler/permission_handler.dart';
import 'package:cas_photo_manager_application/widgets/AlertMessagePopup.dart';
import 'package:flutter/material.dart';
import 'package:cas_photo_manager_application/cameras/PhotoDetailScreen.dart';
import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:cas_photo_manager_application/userData/UserData.dart';

import '../databaseManager/FrontEndApp.dart';

///Classe rappresentante la galleria di ciascun utente
class Gallery extends StatefulWidget {
  final UserData userData;

  const Gallery({super.key, required this.userData});

  @override
  State<Gallery> createState() => _GalleryState();
}

class _GalleryState extends State<Gallery> {
  int selectedAlbumIndex = 0; //Indice dell'album visualizzato sulla galleria
  late UserData userData;
  TextEditingController albumNameController = TextEditingController();
  String? selectedUser; //Nome dell'utente
  int? selectedUserID;  //Id dell'utente
  bool isExpanded = false;

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
    return "${dataPlacemark[0].street} ${dataPlacemark[0].name}\n${dataPlacemark[0].locality} ${dataPlacemark[0].postalCode}\n${dataPlacemark[0].country}";
  }

  ///Funzione che gestisce la creazione di un nuova nuova collezione
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
                  Position position = await determinePosition();
                  String detailPosition = await getDataFromPosition(position);
                  String formattedGeoTag =
                      'POINT(${position.longitude} ${position.latitude})';

                  int maxIdPhoto = await getMaxIDPhoto(userData);
                  print("MAX ID PHOTO PRIMA: $maxIdPhoto");

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
                          List<Photo> selectedPhotos = await Future.wait(
                              selectedImages.map((image) async {
                            final file = File(image.path);
                            Uint8List imageBytes = await file.readAsBytes();
                            final String base64Image = base64Encode(imageBytes);
                            print(
                                'Lunghezza dei dati dell\'immagine GALLERY: ${imageBytes.length}');
                            print("IS NOT EMPTY: ${imageBytes.isNotEmpty}");
                            print("ImageBytes -->> $base64Image");

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
                            selectedAlbumIndex++;
                          });

                          print('Foto caricate con successo!!');
                        } else if (response == LoadFotoDB.errorLoad) {
                          print('Errore durante il caricamento delle foto');
                        } else {
                          print(
                              'Errore server durante il caricamento delle foto');
                        }
                      } catch (e) {
                        print('Errore durante la lettura dell\'immagine: $e');
                        // Gestisci l'errore in modo appropriato
                      }

                      Navigator.of(context).pop();

                      albumNameController.clear();

                      const messageError = "Album creato correttamente!";
                      const titleMessageError = "Successo";
                      // ignore: use_build_context_synchronously
                      showDialog(
                          context: context,
                          builder: (BuildContext context) {
                            return const AlertMessagePopup(
                                message: messageError,
                                titleMessage: titleMessageError);
                          });
                    }
                  } else if (statusPhotos == PermissionStatus.denied) {
                    print('Permesso non consentito');
                  } else if (statusPhotos == PermissionStatus.limited) {
                    openAppSettings();
                  }
                }
              },
            ),
          ],
        );
      },
    );
  }

  ///Funzione che apre il menu per l'eliminazione di una foto da una collezione
  void showDeletePhotoMenu(BuildContext context, Photo photo) {
    showModalBottomSheet(
      context: context,
      builder: (BuildContext context) {
        return Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.delete),
              title: const Text("Elimina foto"),
              onTap: () {
                removePhotoFromCollection(photo);
              },
            ),
          ],
        );
      },
    );
  }

  ///Funzione che apre il menu per l'eliminazione di una collezione
  void showDeleteCollectionMenu(BuildContext context, Collezione collezione) {
    showModalBottomSheet(
      context: context,
      builder: (BuildContext context) {
        return Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.delete),
              title: const Text("Elimina collezione"),
              onTap: () {
                removeCollection(collezione);
              },
            ),
          ],
        );
      },
    );
  }

  ///Funzione che gestisce l'eliminazione di una collezione
  void removeCollection(Collezione collezione) async {
    final response = await deleteCollezioneDatabase(collezione.nameAlbum, userData.idUtente);

    print(response);

    if (response == DeleteCollezioneDB.success) {
      setState(() {
        userData.collezioni.remove(collezione);
        selectedAlbumIndex--; //Decremento dell'indice per mostrare la collezione precedente

        Navigator.of(context).pop();
        const messageError = "Collezione eliminata correttamente!";
        const titleMessageError = "Successo";
        // ignore: use_build_context_synchronously
        showDialog(
            context: context,
            builder: (BuildContext context) {
              return const AlertMessagePopup(
                  message: messageError, titleMessage: titleMessageError);
            });
      });
    } else {
      print("Errore durante l'eliminazione della foto");
    }
  }

  ///Funzione che gestisce l'eliminazione di una foto da una collezione
  void removePhotoFromCollection(Photo photo) async {
    final response = await deletePhotoDatabase(photo);

    print(response);
    if (response == DeleteFotoDB.success) {
      setState(() {
        userData.collezioni[selectedAlbumIndex].photos.remove(photo);
      });
      Navigator.of(context).pop();
      const messageError = "Foto eliminata correttamente!";
      const titleMessageError = "Successo";
      // ignore: use_build_context_synchronously
      showDialog(
          context: context,
          builder: (BuildContext context) {
            return const AlertMessagePopup(
                message: messageError, titleMessage: titleMessageError);
          });
    } else {
      print("Errore durante l'eliminazione della foto");
    }
  }

  ///Funzione che apre il popup per la condivisione della galleria tra utenti
  Future<void> showSharePopup(BuildContext context) async {
    GetNomiShareDBResponse registeredUsers =
        await getNomiUtentiShare(userData.idUtente);
    List<String> userNames = [];
    List<int> userNamesID = [];

    print(registeredUsers.result);

    if (registeredUsers.status == GetNomiShareDB.success) {
      if (registeredUsers.result!.isNotEmpty) {
        for (var res in registeredUsers.result!) {
          userNamesID.add(res[0]);
          userNames.add(res[1]);
        }
        isExpanded =
            true; // Imposta isExpanded su true solo se ci sono nomi disponibili
      }

      // ignore: use_build_context_synchronously
      showDialog(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: const Text("Condividi Galleria"),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                ExpansionTile(
                  title: const Text("Seleziona un utente"),
                  trailing: Icon(
                    isExpanded ? Icons.arrow_drop_up : Icons.arrow_drop_down,
                  ),
                  onExpansionChanged: (bool expanding) {
                    setState(() {
                      isExpanded = expanding;
                    });
                  },
                  children: [
                    if (isExpanded)
                      Container(
                        constraints: const BoxConstraints(maxHeight: 200),
                        child: SingleChildScrollView(
                          child: Column(
                            children: userNames.asMap().entries.map((entry) {
                              final index = entry.key;
                              final user = entry.value;
                              return ListTile(
                                title: Text(user),
                                onTap: () {
                                  setState(() {
                                    selectedUser = user;
                                    selectedUserID = userNamesID[
                                        index]; // Imposta l'indice dell'utente selezionato
                                    isExpanded = false;
                                  });
                                  shareWithUser(
                                      selectedUser!); // Passa l'utente selezionato
                                  Navigator.of(context).pop();
                                },
                              );
                            }).toList(),
                          ),
                        ),
                      ),
                  ],
                ),
              ],
            ),
            actions: <Widget>[
              TextButton(
                child: const Text("Annulla"),
                onPressed: () {
                  Navigator.of(context).pop();
                },
              ),
            ],
          );
        },
      );
    }
  }

  ///Funzione che gestisce la condivisione della galleria tra gli utenti
  void shareWithUser(String selectedUser) async {
    try {
      List<Photo> photosUser = [];
      List<Collezione> collezioni = [];

      var resultPhoto = await getFotoUserDatabase(userData.idUtente);
      print(resultPhoto.userPhotoData?.length.toString());

      var result = await addShareDatabase(userData.idUtente, selectedUserID!);

      if (result == AddShareDB.success) {
        print('Utente aggiunto alla condivisione');
        var resultPhoto = await getFotoUserDatabase(selectedUserID!);
        var nameUser = await getNameFromIDUser(selectedUserID!);

        if (resultPhoto.status == GetFotoUserDB.success) {
          for (int i = 0; i < resultPhoto.userPhotoData!.length; i++) {
            try {

              //Conversione della foto ricevuta dal database
              final base64String = resultPhoto.userPhotoData?[i][4];
              final cleanedBase64 = base64String.replaceAll('\n', '').replaceAll('\r', '');
              final decodedImage = base64Decode(cleanedBase64);

              //Estrazione del punto dal geotag relativo alla foto
              final double longitudine = resultPhoto.userPhotoData?[i][5]?.toDouble() ?? 0.0;
              final double latitudine = resultPhoto.userPhotoData?[i][6]?.toDouble() ?? 0.0;
              final GeoTag geoTag = GeoTag(latitudine: latitudine, longitudine: longitudine);

              Photo newPhoto = Photo(
                  idPhoto: resultPhoto.userPhotoData?[i][0],
                  immagine: decodedImage,
                  nomeFoto: resultPhoto.userPhotoData?[i][1],
                  idUtente: resultPhoto.userPhotoData?[i][3],
                  indirizzo: resultPhoto.userPhotoData?[i][2],
                  geoTag: geoTag,
                  nomeCollezione: resultPhoto.userPhotoData?[i][7],
                  nomeAutore: nameUser[0].toString());

              photosUser.add(newPhoto);

              //Assegnazione delle foto alla collezione appartenente

              Map<String, List<Photo>> collezioniMap = {};

              //Se la collezione esiste già essa non viene aggiunta alla lista delle collezioni
              bool collezioneEsistente = userData.collezioni.any((collezione) {
                return collezione.idUtente == resultPhoto.userPhotoData?[i][3] && collezione.nameAlbum == resultPhoto.userPhotoData?[i][7];
              });

              if(!collezioneEsistente) {
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
                      idUtente: resultPhoto.userPhotoData?[i][3],
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

          setState(() {
            userData.collezioni.addAll(collezioni);
          });
          const messageError = "Utente aggiunto correttamente!";
          const titleMessageError = "Successo";
          // ignore: use_build_context_synchronously
          showDialog(
              context: context,
              builder: (BuildContext context) {
                return const AlertMessagePopup(
                    message: messageError,
                    titleMessage: titleMessageError);
              });
        }
      } else if (result == AddShareDB.errorServer) {
        print("Errore durante l\'aggiunta della condivisione");
        const messageError = "Utente già abilitato alla condivisione!";
        const titleMessageError = "Errore";
        // ignore: use_build_context_synchronously
        showDialog(
            context: context,
            builder: (BuildContext context) {
              return const AlertMessagePopup(
                  message: messageError,
                  titleMessage: titleMessageError);
            });
      }
    } catch (e, s) {
      print(
          "Errore server durante l\'aggiunta della condivisione galleria: $e");
      print(s);
    }
  }

  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: Text(
          "Galleria di ${userData.nome}",
          style: const TextStyle(fontSize: 22),
        ),
        actions: <Widget>[
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () async {
              await showSharePopup(context);
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            flex: 1,
            child: GridView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: userData.collezioni.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 1,
                crossAxisSpacing: 1,
                mainAxisSpacing: 40,
                mainAxisExtent: 100,
              ),
              itemBuilder: (context, index) {
                String albumName = userData.collezioni[index].nameAlbum;
                return GestureDetector(
                  onLongPress: () {
                    showDeleteCollectionMenu(context, userData.collezioni[index]);
                  },
                  onTap: () {
                    setState(() {
                      selectedAlbumIndex = index;
                    });
                  },
                  child: Container(
                    margin: const EdgeInsets.only(left: 20, top: 20),
                    child: Wrap(
                      direction: Axis.horizontal,
                      children: [
                        Image(image: AssetImage(userData.collezioni[index].isSharedCollection ? 'assets/open_folder_share.png' : 'assets/open_folder.png')),
                        Container(
                          margin: const EdgeInsets.only(top: 5),
                          child: Text(
                            albumName,
                            style: const TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.bold,
                            ),
                            overflow: TextOverflow.ellipsis,
                            softWrap: true,
                            maxLines: 2,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          Container(
            margin: const EdgeInsets.only(top: 5, bottom: 5),
            height: 10,
            color: Colors.orange,
          ),
          Expanded(
            flex: 4,
            child: userData.collezioni.isNotEmpty &&
                    selectedAlbumIndex >= 0 &&
                    selectedAlbumIndex < userData.collezioni.length
                ? GridView.builder(
                    itemCount:
                        userData.collezioni[selectedAlbumIndex].photos.length,
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 2,
                      mainAxisSpacing: 5,
                      mainAxisExtent: 200,
                    ),
                    itemBuilder: (context, index) {
                      Photo photo =
                          userData.collezioni[selectedAlbumIndex].photos[index];
                      return GestureDetector(
                        onLongPress: () {
                          showDeletePhotoMenu(context, photo);
                        },
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (context) => PhotoDetailScreen(
                                photo: photo,
                              ),
                            ),
                          );
                        },
                        child: Card(
                            child: Image.memory(
                          photo.immagine,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            print(photo.immagine);
                            return Text("Errore durante il caricamento dell\'immagine: $error,\n\n$stackTrace");
                          },
                        )),
                      );
                    },
                  )
                : Container(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          await showCreateCollectionDialog();
          for (Collezione col in userData.collezioni) {
            for (Photo photo in col.photos) {
              print("N -> ${photo.nomeFoto}");
              print("I -> ${Uint8List.fromList(photo.immagine)}");
            }
          }
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}