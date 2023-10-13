import 'dart:typed_data';
class Photo {
  final int idPhoto;
  final Uint8List immagine;
  final String nomeFoto;
  final int idUtente;
  final String indirizzo;
  final GeoTag geoTag;
  final String nomeCollezione;
  final String nomeAutore;

  Photo(
      {required this.idPhoto,
      required this.immagine,
      required this.nomeFoto,
      required this.idUtente,
      required this.indirizzo,
      required this.geoTag,
      required this.nomeCollezione,
      required this.nomeAutore});
}

class Collezione {
  final int idUtente;
  final String nameAlbum;
  final List<Photo> photos;
  final bool isSharedCollection;

  Collezione({required this.idUtente, required this.nameAlbum, required this.photos,required this.isSharedCollection});
}

class UserData {
  final int idUtente;
  final String nome;
  final String email;
  final String password;
  final List<Collezione> collezioni;

  UserData(
      {required this.idUtente,
      required this.nome,
      required this.email,
      required this.password,
      required this.collezioni});
}

class GeoTag {
  final double latitudine;
  final double longitudine;

  GeoTag({required this.latitudine, required this.longitudine});
}
