import 'dart:typed_data';
import 'package:cas_photo_manager_application/userData/UserData.dart';
import 'package:flutter/material.dart';
import 'package:photo_view/photo_view.dart';

///Classe che mostra una fotografia nel dettaglio
class PhotoDetailScreen extends StatefulWidget {

  final Photo photo;  //Dati della fotografia

  PhotoDetailScreen({required this.photo});

  @override
  _PhotoDetailScreenState createState() => _PhotoDetailScreenState();
}

class _PhotoDetailScreenState extends State<PhotoDetailScreen> {

  bool isOverlayVisible = true; //Booleano che nasconde/mostra i dati della foto

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dettaglio Foto'),
      ),
      body: GestureDetector(
        //Al tocco dello schermo vengono nascoste/mostrate le informazioni della foto
        onTap: () {
          setState(() {
            isOverlayVisible = !isOverlayVisible;
          });
        },
        child: Stack(
          children: [
            PhotoView(
              imageProvider: MemoryImage(Uint8List.fromList(widget.photo.immagine)),
              minScale: PhotoViewComputedScale.contained,
              maxScale: PhotoViewComputedScale.covered * 2,
            ),
            if (isOverlayVisible)
              Align(
                alignment: Alignment.bottomLeft,
                child: Container(
                  padding: const EdgeInsets.all(16.0),
                  color: Colors.black.withOpacity(0.5),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Nome foto: ${widget.photo.nomeFoto}",
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                        ),
                      ),
                      Text(
                        "Indirizzo: ${widget.photo.indirizzo}",
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                        ),
                      ),
                      Text(
                        "Autore: ${widget.photo.nomeAutore}",
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                        ),
                      ),
                      Text(
                        "Nome collezione: ${widget.photo.nomeCollezione}",
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                        ),
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
