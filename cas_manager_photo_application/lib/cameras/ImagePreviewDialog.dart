import 'dart:io';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';

///Classe che permette di visualizzare la foto appena scattata tramite la fotocamera
class ImagePreviewDialog extends StatelessWidget {
  final String detailsPositionPhoto; //Dettagli della posizione delle foto
  final XFile imageFile;             //Immagine
  final VoidCallback onSave;         //Funzione in caso di salvataggio della foto
  final VoidCallback onCancel;       //Funzione in caso di non salvataggio della foto

  const ImagePreviewDialog(
      {super.key, required this.imageFile,
      required this.onSave,
      required this.onCancel,
      required this.detailsPositionPhoto});

  @override
  Widget build(BuildContext context) {

    File image = File(imageFile.path);  //Converto il percorso dell'immagine

    return Dialog(
      insetPadding: const EdgeInsets.only(right: 40, left: 40),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Image.file(image),
          Container(
            padding: const EdgeInsets.only(top: 10, bottom: 10),
            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width - 80),
            child: Text(
              "$detailsPositionPhoto",
              style: const TextStyle(
                fontWeight: FontWeight.w500,
                fontSize: 20,
              ),
              overflow: TextOverflow.ellipsis,
              softWrap: true,
              maxLines: 4,
            ),
          ),
          ButtonBar(
            children: [
              ElevatedButton(
                onPressed: onCancel,
                child: const Text("Annulla"),
              ),
              ElevatedButton(
                onPressed: onSave,
                child: const Text("Aggiungi ad album"),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
