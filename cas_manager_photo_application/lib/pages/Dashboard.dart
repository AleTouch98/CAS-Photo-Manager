import 'dart:io';
import 'package:cas_photo_manager_application/cameras/CollectionContainer.dart';
import 'package:cas_photo_manager_application/pages/Gallery.dart';
import 'package:cas_photo_manager_application/userData/UserData.dart';
import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import '../cameras/ImagePreviewDialog.dart';
import 'Profile.dart';
import 'Search.dart';
import 'Upload.dart';

///Classe che rappresenta la dashboard dell'applicazione
class Dashboard extends StatefulWidget {
  final UserData userData;  //Dati dell'utente

  const Dashboard({super.key, required this.userData});

  @override
  State<Dashboard> createState() => _DashboardState();
}

class _DashboardState extends State<Dashboard> {
  int currentState = 0;   //Id della schermata corrente
  late UserData userData;

  late List<Widget> pages = [
    Gallery(userData: userData,),
    Upload(userData: userData),
    Search(userData: userData),
    Profile(userData: userData),
  ];

  final PageStorageBucket bucket = PageStorageBucket();
  Position? location;
  String? detailsPosition;
  late Widget currentScreen;
  XFile? imageFile;
  bool isImagePreviewDialogOpen = false;  //Booleano che nasconde/apre l'anteprima delle foto scattata

  ///All'avvio del widget, vengono salvati i dati passati in input
  @override
  void initState(){
    super.initState();
    userData = widget.userData;
    //Viene impostata la pagina Galleria come pagina aperta
    currentScreen = Gallery(userData: userData);
  }

  ///Funzione che mostra il dialog di anteprima della foto scattata
  void openImagePreviewDialog() {
    setState(() {
      isImagePreviewDialogOpen = true;
    });
  }

  ///Funzione che chiude il dialog di anteprima della foto scattata
  void closeImagePreviewDialog() {
    setState(() {
      isImagePreviewDialogOpen = false;
    });
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

  ///Funzione che apre la fotocamera del telefono per scattare la foto
  void getImage({required ImageSource imageSource}) async {
    Position position = await determinePosition();
    PermissionStatus statusCamera = await Permission.camera.request();

    print("statusPhotos $statusCamera");

    if(statusCamera == PermissionStatus.granted) {
      XFile? image = await ImagePicker().pickImage(source: imageSource);

      if (image?.path != null) {
        setState(() async {
          imageFile = image;
          location = position;
          detailsPosition = (await getDataFromPosition(position));
          openImagePreviewDialog();
        });
      }
    }
    else if(statusCamera == PermissionStatus.denied){
      print('Permesso non consentito');
    }
    else if(statusCamera == PermissionStatus.limited){
      openAppSettings();
    }

  }

  ///Funzione che estrae le informazioni riguardo l'indirizzo di una posizione
  Future<String> getDataFromPosition(Position position) async {
    List<Placemark> dataPlacemark =
        await placemarkFromCoordinates(position.latitude, position.longitude);
    print(dataPlacemark);
    return "${dataPlacemark[0].street} ${dataPlacemark[0].name}\n${dataPlacemark[0].locality} ${dataPlacemark[0].postalCode}\n${dataPlacemark[0].country}";
  }

  @override
  Widget build(BuildContext context) {
    if (isImagePreviewDialogOpen) {
      return Scaffold(
        appBar: AppBar(
          automaticallyImplyLeading: false,
          title: const Text(
            "Anteprima foto",
            style: TextStyle(fontSize: 22),
          ),
        ),
        body: PageStorage(
          bucket: bucket,
          child: ImagePreviewDialog(
            imageFile: imageFile!,
            onSave: () async {
              closeImagePreviewDialog();
              Navigator.of(context)
                  .push(MaterialPageRoute(builder: (context) => AlbumContainer(userData: userData, image: imageFile!, position: location!, detailsPosition: detailsPosition!,)));
            },
            onCancel: () {
              closeImagePreviewDialog();
            },
            detailsPositionPhoto: detailsPosition ?? "",
          ),
        ),
        floatingActionButton: FloatingActionButton(
            child: const Icon(Icons.photo_camera),
            onPressed: () => {getImage(imageSource: ImageSource.camera)}
        ),

        floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
        bottomNavigationBar: BottomAppBar(
          shape: const CircularNotchedRectangle(),
          notchMargin: 20,
          child: Container(
            height: 60,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: <Widget>[
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    MaterialButton(
                      minWidth: 40,
                      onPressed: () {
                        setState(() {
                          currentScreen = Gallery(userData: userData,);
                          currentState = 0;
                        });
                      },
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.dashboard,
                            color: currentState == 0
                                ? Colors.deepOrangeAccent
                                : Colors.orangeAccent,
                          ),
                          Text(
                            'Galleria',
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                                color: currentState == 0
                                    ? Colors.deepOrangeAccent
                                    : Colors.orangeAccent),
                          )
                        ],
                      ),
                    ), //GALLERIA
                    MaterialButton(
                      minWidth: 40,
                      onPressed: () {
                        setState(() {
                          currentScreen = Upload(userData: userData,);
                          currentState = 1;
                        });
                      },
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.upload,
                            color: currentState == 1
                                ? Colors.deepOrangeAccent
                                : Colors.orangeAccent,
                          ),
                          Text(
                            'Carica',
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                                color: currentState == 1
                                    ? Colors.deepOrangeAccent
                                    : Colors.orangeAccent),
                          )
                        ],
                      ),
                    ), //CARICA
                  ],
                ),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    MaterialButton(
                      minWidth: 40,
                      onPressed: () {
                        setState(() {
                          currentScreen = Search(userData: userData,);
                          currentState = 2;
                        });
                      },
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.search,
                            color: currentState == 2
                                ? Colors.deepOrangeAccent
                                : Colors.orangeAccent,
                          ),
                          Text(
                            'Search',
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                                color: currentState == 2
                                    ? Colors.deepOrangeAccent
                                    : Colors.orangeAccent),
                          )
                        ],
                      ),
                    ), //RICERCA
                    MaterialButton(
                      minWidth: 40,
                      onPressed: () {
                        setState(() {
                          currentScreen = Profile(userData: userData,);
                          currentState = 3;
                        });
                      },
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.person,
                            color: currentState == 3
                                ? Colors.deepOrangeAccent
                                : Colors.orangeAccent,
                          ),
                          Text(
                            'Profilo',
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                                color: currentState == 3
                                    ? Colors.deepOrangeAccent
                                    : Colors.orangeAccent),
                          )
                        ],
                      ),
                    ), //PROFILO
                  ],
                )
              ],
            ),
          ),
        ),
      );
    } else {
      return Scaffold(
        body: PageStorage(
          bucket: bucket,
          child: currentScreen,
        ),
        floatingActionButton: FloatingActionButton(
            child: const Icon(Icons.photo_camera),
            onPressed: () => {getImage(imageSource: ImageSource.camera)}),
        floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
        bottomNavigationBar: BottomAppBar(
          shape: const CircularNotchedRectangle(),
          notchMargin: 20,
          child: Container(
            height: 60,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: <Widget>[
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    MaterialButton(
                      minWidth: 40,
                      onPressed: () {
                        setState(() {
                          currentScreen = Gallery(userData: userData);
                          currentState = 0;
                        });
                      },
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.dashboard,
                            color: currentState == 0
                                ? Colors.deepOrangeAccent
                                : Colors.orangeAccent,
                          ),
                          Text(
                            'Galleria',
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                                color: currentState == 0
                                    ? Colors.deepOrangeAccent
                                    : Colors.orangeAccent),
                          )
                        ],
                      ),
                    ), //GALLERIA
                    MaterialButton(
                      minWidth: 40,
                      onPressed: () {
                        setState(() {
                          currentScreen = Upload(userData: userData,);
                          currentState = 1;
                        });
                      },
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.upload,
                            color: currentState == 1
                                ? Colors.deepOrangeAccent
                                : Colors.orangeAccent,
                          ),
                          Text(
                            'Carica',
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                                color: currentState == 1
                                    ? Colors.deepOrangeAccent
                                    : Colors.orangeAccent),
                          )
                        ],
                      ),
                    ), //CARICA
                  ],
                ),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    MaterialButton(
                      minWidth: 40,
                      onPressed: () {
                        setState(() {
                          currentScreen = Search(userData: userData);
                          currentState = 2;
                        });
                      },
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.search,
                            color: currentState == 2
                                ? Colors.deepOrangeAccent
                                : Colors.orangeAccent,
                          ),
                          Text(
                            'Search',
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                                color: currentState == 2
                                    ? Colors.deepOrangeAccent
                                    : Colors.orangeAccent),
                          )
                        ],
                      ),
                    ), //RICERCA
                    MaterialButton(
                      minWidth: 40,
                      onPressed: () {
                        setState(() {
                          currentScreen = Profile(userData: userData);
                          currentState = 3;
                        });
                      },
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.person,
                            color: currentState == 3
                                ? Colors.deepOrangeAccent
                                : Colors.orangeAccent,
                          ),
                          Text(
                            'Profilo',
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                                color: currentState == 3
                                    ? Colors.deepOrangeAccent
                                    : Colors.orangeAccent),
                          )
                        ],
                      ),
                    ), //PROFILO
                  ],
                )
              ],
            ),
          ),
        ),
      );
    }
  }
}
