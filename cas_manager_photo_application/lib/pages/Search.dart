import 'dart:typed_data';

import 'package:cas_photo_manager_application/cameras/PhotoDetailScreen.dart';
import 'package:cas_photo_manager_application/databaseManager/FrontEndApp.dart';
import 'package:cas_photo_manager_application/userData/UserData.dart';
import 'package:cas_photo_manager_application/widgets/AlertMessagePopup.dart';
import 'package:flutter/material.dart';
import 'package:geocoding/geocoding.dart';
import 'package:latlong2/latlong.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_map/flutter_map.dart';


class Search extends StatefulWidget {
  final UserData userData;  //Dati dell'utente

  const Search({super.key, required this.userData});

  @override
  _SearchState createState() => _SearchState();
}

class _SearchState extends State<Search> {
  late UserData userData;
  final LatLng centerLatLng = LatLng(44.494887, 11.3426163);
  LatLng? currentLatLng;
  Marker? currentLocationMarkers;
  MapController mapController = MapController();
  AnimationController? zoomController;
  Tween<double>? zoomTween;
  String? detailsPosition;
  int selectedPhotoCount = 5;
  List<Marker> photoMarkers = [];
  List<String> addressMarkers  = [];
  List<dynamic> searchPhotoMarker = [];
  Marker? selectedMarker;
  int numFotoAlbum = 0;

  /// Funzione che permette di determinare la posizione attuale dell'utente
  Future<void> getPosition() async {
    Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high);
    String details = await getDataFromPosition(position);

    final LatLng newLatLng = LatLng(position.latitude, position.longitude);
    final Marker newLocationMarkers = Marker(
      width: 40.0,
      height: 40.0,
      point: newLatLng,
      builder: (context) => const Icon(
        Icons.location_on,
        color: Colors.orange,
        size: 60.0,
      ),
    );

    final String newDetails = details;

    setState(() {
      currentLatLng = newLatLng;
      currentLocationMarkers = newLocationMarkers;
      detailsPosition = newDetails;
    });
    mapController.move(currentLatLng!, 15.0);
  }

  ///Funzione che estrae le informazioni riguardo l'indirizzo di una posizione
  Future<String> getDataFromPosition(Position position) async {
    List<Placemark> dataPlacemark =
        await placemarkFromCoordinates(position.latitude, position.longitude);
    //print(dataPlacemark);
    return "${dataPlacemark[0].street} ${dataPlacemark[0].name}\n${dataPlacemark[0].locality} ${dataPlacemark[0].postalCode}\n${dataPlacemark[0].country}";
  }

  ///Funzione che mostra un dialog per il numero di foto da filtrare
  Future<void> showPhotoCountDialog() async {

    int? newPhotoCount = await showDialog<int>(
      context: context,
      builder: (BuildContext context) {
        TextEditingController customCountController = TextEditingController();
        return AlertDialog(
          title: Text(
              'Seleziona il numero di foto: (sono state caricate $numFotoAlbum foto)'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              ListTile(
                title: const Text('3 Foto'),
                onTap: () async {
                  Navigator.of(context).pop(3);
                  await searchNFotoPositionActual(3);
                },
              ),
              ListTile(
                title: const Text('5 Foto'),
                onTap: () async {
                  Navigator.of(context).pop(5);
                  await searchNFotoPositionActual(5);
                },
              ),
              ListTile(
                title: const Text('10 Foto'),
                onTap: () async {
                  Navigator.of(context).pop(10);
                  await searchNFotoPositionActual(10);
                },
              ),
              TextFormField(
                controller: customCountController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Inserisci un numero personalizzato',
                ),
              ),
              const SizedBox(
                height: 10.0,
              ),
              ElevatedButton(
                onPressed: () async {
                  if (customCountController.text.isNotEmpty) {
                    int customCount =
                        int.tryParse(customCountController.text) ?? 0;
                    Navigator.of(context).pop(customCount);
                    await searchNFotoPositionActual(customCount);
                  }
                },
                child: const Text('Conferma'),
              ),
            ],
          ),
        );
      },
    );

    if (newPhotoCount != null) {
      setState(() {
        selectedPhotoCount = newPhotoCount;
      });
    }
  }

  ///Funzione che permette di selezionare un marker relativo a una foto
  void selectMarker(Marker marker) {
    setState(() {
      selectedMarker = marker;
    });
    mapController.move(marker.point, 15.0);
  }

  ///Funzione che gestisce la ricerca delle n foto più vicine alla posizione attuale dell'utente
  Future<void> searchNFotoPositionActual(int numPhotos) async {
    //Caso in cui il numero di foto presenti nell'album sia inferiore al numero di
    //foto da voler ricercare
    try {
      if (numFotoAlbum < numPhotos) {
        const messageError = "Errore!";
        const titleMessageError =
            "Numero di foto presenti insufficienti per la ricerca. Seleziona un numero valido!";
        // ignore: use_build_context_synchronously
        showDialog(
            context: context,
            builder: (BuildContext context) {
              return const AlertMessagePopup(
                  message: messageError, titleMessage: titleMessageError);
            });
        print(
            'Numero di foto nella galleria insufficienti per effettuare la ricerca');
      }
      //Caso in cui non c'è nessuna foto nel database
      else if (userData.collezioni.isEmpty) {
        const messageError = "Errore!";
        const titleMessageError = "Nessuna foto presente nella galleria!";
        // ignore: use_build_context_synchronously
        showDialog(
            context: context,
            builder: (BuildContext context) {
              return const AlertMessagePopup(
                  message: messageError, titleMessage: titleMessageError);
            });
        print('Nessuna foto presente nel database');
      } else {
        final response = await getNFotoDatabase(numPhotos, userData.idUtente,
            currentLatLng!.longitude, currentLatLng!.latitude);

        if (response.status == GetNFotoDB.success) {
          searchPhotoMarker.clear();
          searchPhotoMarker.addAll(response.photos!);

        } else if (response.status == GetNFotoDB.noFoundFoto) {
          print('Non è stata trovata nessuna foto dalla query');
          const messageError = "Errore!";
          const titleMessageError =
              "Non è stata trovata nessuna foto nel database!";
          // ignore: use_build_context_synchronously
          showDialog(
              context: context,
              builder: (BuildContext context) {
                return const AlertMessagePopup(
                    message: messageError, titleMessage: titleMessageError);
              });
        } else if (response.status == GetNFotoDB.errorServer) {
          print('Errore del server durante la ricerca delle n foto');
        }
      }
    } catch (e, s) {
      print('Errore server durante la ricerca delle foto: $e');
      print('$s');
    }
  }

  ///Funzione che mostra la lista di tutti i marker presenti
  void showMarkerListBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (BuildContext context) {
        return ListView.builder(
          itemCount: photoMarkers.length,
          itemBuilder: (context, index) {
            final marker = photoMarkers[index];
            return ListTile(
              title: Text('Marker ${index + 1}: ${addressMarkers[index]}'),
              onTap: () {
                Navigator.of(context).pop();
                selectMarker(marker);
              },
            );
          },
        );
      },
    );
  }

  ///Funzione che mostra tutti i marker trovati durante il filtraggio delle foto più vicine alla
  ///posizione attuale dell'utente
  void showSearchResultsBottomSheet(BuildContext context, List<dynamic> markers) {
    showModalBottomSheet(
      context: context,
      builder: (BuildContext context) {
        return ListView.builder(
          itemCount: markers.length,
          itemBuilder: (context, index) {
            final photoData = markers[index];
            final photoLatLng = LatLng(
              photoData[3],
              photoData[2],
            );

            return ListTile(
              title: Text(photoData[1]),
              onTap: () {
                Navigator.of(context).pop();
                mapController.move(photoLatLng, 15.0);
              },
            );
          },
        );
      },
    );
  }

  ///All'avvio del widget, vengono salvati i dati passati in input
  @override
  void initState() {
    super.initState();
    userData = widget.userData;
    mapController = MapController();

    for (Collezione col in userData.collezioni) {
      numFotoAlbum += col.photos.length;
    }

    getPosition(); //Ottiene la posizione attuale dell'utente

    //Per ciascuna foto presente nella galleria viene creato un relativo marker
    for (Collezione collezione in userData.collezioni) {
      for (Photo photo in collezione.photos) {
        final LatLng photoLatLng = LatLng(photo.geoTag.latitudine, photo.geoTag.longitudine);

        final Marker photoMarker = Marker(
          width: 40.0,
          height: 40.0,
          point: photoLatLng,
          builder: (context) {
            if (currentLatLng != null && detailsPosition != null) {
              return GestureDetector(
                onTap: () {
                  showDialog(
                    context: context,
                    builder: (BuildContext context) {
                      return AlertDialog(
                        content: Container(
                          width: 200,
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "Dettagli del marker ${photo.idPhoto.toString()}:",
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 10),
                              Container(
                                alignment: Alignment.center,
                                child:Image.memory(
                                  photo.immagine,
                                  fit: BoxFit.cover,
                                  alignment: Alignment.center,
                                  width: 200,
                                  height: 200,
                                ),
                              ),
                              const SizedBox(height: 10),
                              Text(photo.indirizzo),
                            ],
                          ),
                        ),
                        actions: [
                          TextButton(
                            onPressed: () {
                              Navigator.of(context).pop();
                            },
                            child: const Text("Chiudi"),
                          ),
                          TextButton(
                            onPressed: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (context) => PhotoDetailScreen(
                                    photo: photo,
                                  ),
                                ),
                              );
                            },
                            child: const Text("Apri foto"),
                          ),
                        ],
                      );
                    },
                  );
                },
                child: const Icon(
                  Icons.location_on,
                  color: Colors.blue,
                  size: 60.0,
                ),
              );
            } else {
              return const CircularProgressIndicator();
            }
          },
        );
        photoMarkers.add(photoMarker);
        addressMarkers.add(photo.indirizzo);
      }
    }
    for (Marker marker in photoMarkers) {
      print("POINT: ${marker.point}");
    }
  }

  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: const Text(
          "Search",
          style: TextStyle(fontSize: 22),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: showPhotoCountDialog,
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            TextButton(
              onPressed: () {
                showMarkerListBottomSheet(context);
              },
              child: const Text(
                'Seleziona un marker',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
              ),
            ),
            TextButton(
              onPressed: () {showSearchResultsBottomSheet(context,searchPhotoMarker);},
              child: const Text('Le foto più vicine a me si trovano in...',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
              ),
            ),
            SizedBox(
              height: MediaQuery.of(context).size.height,
              child: FlutterMap(
                mapController: mapController,
                options: MapOptions(
                  center: currentLatLng ?? centerLatLng,
                  zoom: 10,
                  maxZoom: 18,
                ),
                nonRotatedChildren: [
                  RichAttributionWidget(
                    attributions: [
                      TextSourceAttribution(
                        'OpenStreetMap contributors',
                        onTap: () => launchUrl(
                            Uri.parse('https://openstreetmap.org/copyright')),
                      ),
                    ],
                  ),
                ],
                children: [
                  TileLayer(
                    urlTemplate:
                        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                    userAgentPackageName: 'com.example.app',
                  ),
                  if (currentLocationMarkers != null)
                    MarkerLayer(
                      markers: [
                        Marker(
                          width: 40.0,
                          height: 40.0,
                          point: currentLatLng!,
                          builder: (context) {
                            return GestureDetector(
                              onTap: () {
                                showDialog(
                                  context: context,
                                  builder: (BuildContext context) {
                                    return AlertDialog(
                                      content: Container(
                                        width: 200,
                                        child: Column(
                                          mainAxisSize: MainAxisSize.min,
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            const Text(
                                              "Dettagli della posizione attuale:",
                                              style: TextStyle(
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                            const SizedBox(height: 10),
                                            Text(detailsPosition.toString()),
                                          ],
                                        ),
                                      ),
                                      actions: [
                                        TextButton(
                                          onPressed: () {
                                            Navigator.of(context).pop();
                                          },
                                          child: const Text("Chiudi"),
                                        ),
                                      ],
                                    );
                                  },
                                );
                              },
                              child: const Icon(
                                Icons.location_on,
                                color: Colors.orange,
                                size: 60.0,
                              ),
                            );
                          },
                        ),
                        ...photoMarkers,
                      ],
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: getPosition,
        child: const Icon(Icons.location_on),
      ),
    );
  }
}
