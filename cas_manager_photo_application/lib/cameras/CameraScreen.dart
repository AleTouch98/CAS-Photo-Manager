import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

class CameraScreen extends StatefulWidget {
  const CameraScreen({super.key});

  @override
  State<CameraScreen> createState() => _CameraScreenState();
}

class _CameraScreenState extends State<CameraScreen> {

  File? imageFile;  //Fotografia scattata

  ///Funzione che apre la fotocamera e ottiene l'immagine fotografata
  void getImage({required ImageSource imageSource}) async {
    final file = await ImagePicker().pickImage(source: imageSource);

    //Caso in cui l'utente abbia scattato la foto. Viene salvata per poi essere
    //passata alle funzioni relative di salvataggio.
    if(file?.path != null){
      setState(() {
        imageFile = File(file!.path);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return const Placeholder();
  }

}
