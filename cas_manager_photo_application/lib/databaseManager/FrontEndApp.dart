import 'dart:io';
import 'dart:typed_data';
import 'package:camera/camera.dart';
import 'package:flutter/services.dart';
import 'package:cas_photo_manager_application/userData/UserData.dart';
import 'package:flutter/material.dart';
import 'package:cas_photo_manager_application/databaseManager/ConnectDatabase.dart' as db;

/// FILE IN CUI VI SONO TUTTE LE QUERY AL DATABASE


///Classe che registra la risposta alla chiamata del db quando si richiedono i
///dati dell'utente
class UserResponse {
  final List<dynamic>? userData;  //Dati dell'utente
  final GetDataUserStatus status; //Stato della chiamata

  UserResponse({
    required this.status,
    this.userData,
  });
}

///Classe che registra la risposta alla chiamata del db quando l'utente fa il login
class LoginResponse {
  final LoginStatus status;           //Stato della chiamata
  final List<dynamic>? userData;      //Dati dell'utente
  final List<dynamic>? userPhotoData; //Dati delle foto dell'utente

  LoginResponse({required this.status, this.userData, this.userPhotoData});
}

///Classe che registra la risposta alla chiamata del db quando si devono recuperare le
///"n" foto più vicine alla posizione attuale dell'utente
class GetNFotoResponse {
  final GetNFotoDB status;      //Stato della chiamata
  final List<dynamic>? photos;  //Foto recuperate

  GetNFotoResponse({required this.status, this.photos});
}

///Classe che registra la risposta alla chiamata del db quando si devono recuperare le
///foto dell'utente
class GetFotoUserResponse {
  final GetFotoUserDB status;
  final List<dynamic>? userPhotoData;

  GetFotoUserResponse({required this.status, this.userPhotoData});
}

///Classe che registra la risposta alla chiamata del db quando si devono recuperare le
///i nomi degli utenti con cui è attiva la condivisione delle foto
class GetNomiShareDBResponse {
  final GetNomiShareDB status;
  final List<dynamic>? result;

  GetNomiShareDBResponse({
    required this.status,
    this.result,
  });
}
///--------------------------------------------------------------------------//


/// ENUM PER GESTIRE GLI STATUS *
enum LoginStatus {
  success,
  errorPassword,
  userNotRegister,
  errorServer,
}

enum RegistrationStatus { success, userExists, errorServer }

enum GetDataUserStatus { success, errorServer }

enum LoadFotoDB { success, errorLoad, errorServer }

enum DeleteFotoDB { success, errorServerDelete }

enum DeleteCollezioneDB { success, errorServerDelete }

enum GetNFotoDB { success, noFoundFoto, errorServer }

enum GetNomiShareDB {success, noFoundUser, errorServer }

enum AddShareDB {success, errorServer }

enum GetFotoUserDB { success, noFoundFoto, errorServer }
///--------------------------------------------------------------------------//

///Funzione che effettua una chiamata al db quando l'utente effettua il login
Future<LoginResponse> loginToServer(String email, String password, BuildContext context) async {

  var client = await db.DataBaseConnection().startDatabaseConnection();

  try {
    String query = "SELECT * FROM Utenti WHERE Email = @aEmail";

    List<List<dynamic>> result = await client.query(
        query,
        substitutionValues: {'aEmail': email});

    print("RESULT + $result");

    //Caso in cui l'utente viene trovato
    if (result.isNotEmpty) {
      var passwordUser = result[0][3];
      if (password == passwordUser) {
        print('Login effettuato con successo');

        var userData = result[0];
        print("USER: ${userData[0].toString()}");

        //Recupero le foto dell'utente loggato
        GetFotoUserResponse resultPhoto = await getFotoUserDatabase(userData[0]);

        return LoginResponse(
            status: LoginStatus.success,
            userData: userData,
            userPhotoData: resultPhoto.userPhotoData!.isNotEmpty ? resultPhoto.userPhotoData : []);
      }

      else {
        print('Password errata! Riprova');
        return LoginResponse(status: LoginStatus.errorPassword);
      }
    } else {
      print('L\'utente non è registrato');
      return LoginResponse(status: LoginStatus.userNotRegister);
    }
  } catch (error, s) {
    print('Errore durante l\'accesso: $error');
    print('Errore durante l\'accesso: $s');
    return LoginResponse(status: LoginStatus.errorServer);
  } finally {
    client.close().then((value) => print('Database closed'));
  }
}

///Funzione che effettua una chiamata al db quando l'utente effettua la registrazione
Future<RegistrationStatus> registerToServer(String nome, String email, String password, BuildContext context) async {
  var client = await db.DataBaseConnection().startDatabaseConnection();

  try {

    String query = "SELECT * FROM Utenti WHERE Email = @aEmail";

    List<List<dynamic>> existUser = await client.query(
        query,
        substitutionValues: {'aEmail': email});

    if (existUser.isNotEmpty) {
      print('Utente già registrato!');
      return RegistrationStatus.userExists;
    } else {
      await client.query(
          "INSERT INTO Utenti (Nome_Utente, Email, Password_Utente) VALUES (@aNome, @aEmail, @aPassword)",
          substitutionValues: {
            'aNome': nome,
            'aEmail': email,
            "aPassword": password
          });
      return RegistrationStatus.success;
    }
  } catch (error) {
    print(
        "Si è verificato un errore durante l inserimento dell utente: $error");
    return RegistrationStatus.errorServer;
  } finally {
    client.close();
  }
}

///Funzione che effettua una chiamata al db per il recupero dei dati dell'utente
Future<UserResponse> getDataUser(String email, String password, BuildContext context) async {

  var client = await db.DataBaseConnection().startDatabaseConnection();

  try {

    String query = "SELECT * FROM Utenti WHERE Email = @aEmail AND Password_Utente = @aPassword";

    List<List<dynamic>> result = await client.query(
        query,
        substitutionValues: {'aEmail': email, 'aPassword': password});

    if (result.isNotEmpty) {
      print(result);
      return UserResponse(status: GetDataUserStatus.success, userData: result);
    }
    return UserResponse(status: GetDataUserStatus.errorServer);
  } catch (error) {
    print('Errore durante l\'accesso: $error');
    return UserResponse(status: GetDataUserStatus.errorServer);
  } finally {
    client.close();
  }
}

///Funzione che effettua una chiamata al db e restituisce il massimo ID delle
///foto dell'utente per essere assegnato alla foto nella classe relativa a ciascuna foto
Future<int> getMaxIDPhoto(UserData userData) async {

  var client = await db.DataBaseConnection().startDatabaseConnection();

  int maxId = 0;
  String query = "SELECT MAX(Foto.ID) AS max_id FROM Foto JOIN Utenti ON Foto.ID_Utente = Utenti.ID WHERE Utenti.ID = ${userData.idUtente}";
  List<List<dynamic>> maxIdResult = await client.query(query);

  if (maxIdResult[0][0] != null) {
    maxId = maxIdResult[0][0] as int;
  }

  return maxId;
}

///Funzione che effettua una chiamata al db per il caricamento delle foto nel database
Future<Object> loadPhotoDataBase(
    UserData userData,
    List<XFile> listPhotos,
    String addressPosition,
    String formattedGeoTag,
    String nomeCollezione) async {

  var client = await db.DataBaseConnection().startDatabaseConnection();

  try {

    for (XFile photo in listPhotos) {

      final file = File(photo.path);
      final Uint8List imageBytes = await file.readAsBytes();
      final fileName = photo.name.split('/').last.split('.').first;

      String query =
          "INSERT INTO Foto (Immagine, Nome_Foto, ID_Utente, Indirizzo, GeoTag_Spaziale, Nome_Collezione) VALUES "
          "(@aImmagine:bytea, @aNome_Foto, @aID_Utente, @aIndirizzo, ST_GeomFromText(@aGeoTag_Spaziale, 4326), @aNome_Collezione) "
          "ON CONFLICT (ID_Utente, Nome_Foto) DO NOTHING";
      try {
        await client.query(
          query,
          substitutionValues: {
            'aImmagine': imageBytes,
            'aNome_Foto': fileName,
            'aID_Utente': userData.idUtente,
            'aIndirizzo': addressPosition,
            'aGeoTag_Spaziale': formattedGeoTag,
            'aNome_Collezione': nomeCollezione,
          },
        );
        print("Query SQL: $query");
        print("Sostituzione: $imageBytes\n");
        print("Sostituzione: $fileName\n, ${userData.idUtente}\n, $addressPosition\n, $formattedGeoTag\n, $nomeCollezione\n");
      } catch (e, s) {
        print("Query SQL: $query");
        print("Sostituzione: $imageBytes\n");
        print("Sostituzione: $fileName\n, ${userData.idUtente}\n, $addressPosition\n, $formattedGeoTag\n, $nomeCollezione\n");
        print(e.toString());
        print(s.toString());
      }
    }
    return LoadFotoDB.success;
  } catch (error, s) {
    print("Si è verificato un errore server durante l inserimento delle foto: $error");
    print(s);
    return LoadFotoDB.errorServer;
  } finally {
    client.close();
  }
}

///Funzione che effettua una chiamata al db per la cancellazione di una foto dal db
Future<DeleteFotoDB> deletePhotoDatabase(Photo photo) async {
  var client = await db.DataBaseConnection().startDatabaseConnection();

  String query =
      "DELETE FROM Foto WHERE ID_Utente = @aIdUtente AND ID = @aIdPhoto;";
  try {
    await client.query(
      query,
      substitutionValues: {
        'aIdUtente': photo.idUtente,
        'aIdPhoto': photo.idPhoto,
      },
    );
    print("Query SQL: $query");
    print("Sostituzione: ${photo.idUtente}\n, ${photo.idPhoto}\n");
    return DeleteFotoDB.success;
  } catch (e, s) {
    print("Query SQL: $query");
    print("Sostituzione: ${photo.idUtente}\n, ${photo.idPhoto}\n");
    print(e.toString());
    print(s.toString());
    return DeleteFotoDB.errorServerDelete;
  } finally {
    client.close();
  }
}

///Funzione che effettua una chiamata al db per la cancellazione di una collezione dal db
Future<DeleteCollezioneDB> deleteCollezioneDatabase(
    String nameCollezione, int userId) async {
  var client = await db.DataBaseConnection().startDatabaseConnection();

  String query =
      "DELETE FROM Foto WHERE ID_Utente = @aIdUtente AND Nome_Collezione = @aNomeCollezione";

  try {
    await client.query(
      query,
      substitutionValues: {
        'aIdUtente': userId,
        'aNomeCollezione': nameCollezione
      },
    );
    print("Query SQL: $query");
    print("Sostituzione: $userId\n, $nameCollezione\n");
    return DeleteCollezioneDB.success;
  } catch (e, s) {
    print("Query SQL: $query");
    print("Sostituzione: $userId\n, $nameCollezione\n");
    print(e.toString());
    print(s.toString());
    return DeleteCollezioneDB.errorServerDelete;
  } finally {
    client.close();
  }
}

///Funzione che effettua una chiamata al db quando si devono recuperare le
///"n" foto più vicine alla posizione attuale dell'utente
Future<GetNFotoResponse> getNFotoDatabase(
    int numFoto, int userID, double longitudine, double latitudine) async {

  var client = await db.DataBaseConnection().startDatabaseConnection();

  String query = """
    SELECT Foto.ID, 
    Foto.Indirizzo,
    ST_X(Foto.GeoTag_Spaziale) AS longitudine, 
    ST_Y(Foto.GeoTag_Spaziale) AS latitudine  
    FROM Foto
    INNER JOIN Utenti ON Foto.ID_Utente = Utenti.ID
    WHERE Foto.ID_Utente = @aUser
    ORDER BY ST_Distance(Foto.GeoTag_Spaziale, ST_GeomFromText('POINT($longitudine $latitudine)', 4326))
    LIMIT @aNumeroFoto """;

  try {
    List<List<dynamic>> result = await client.query(
      query,
      substitutionValues: {
        'aUser': userID,
        'aNumeroFoto': numFoto
      },
    );
    print("Query SQL: $query");
    print("Sostituzione: $userID\n, $longitudine\n, $latitudine\n, $numFoto\n");

    if (result.isNotEmpty) {
      print('Foto trovate!');
      return GetNFotoResponse(status: GetNFotoDB.success, photos: result);
    } else {
      print('Non sono state trovate foto');
      return GetNFotoResponse(status: GetNFotoDB.noFoundFoto);
    }
  } catch (e, s) {
    print("Query SQL: $query");
    print("Sostituzione: $userID\n, $longitudine\n, $latitudine\n, $numFoto\n");
    print(e.toString());
    print(s.toString());
    return GetNFotoResponse(status: GetNFotoDB.errorServer);
  } finally {
    client.close();
  }
}

///Funzione che effettua una chiamata al db quando si devono recuperare le
///foto dell'utente
Future<GetFotoUserResponse> getFotoUserDatabase(int userID) async {

  var client = await db.DataBaseConnection().startDatabaseConnection();

  try {
    String query = "SELECT Foto.ID, "
        "Foto.Nome_Foto, "
        "Foto.Indirizzo, "
        "Utenti.ID, "
        "encode(Foto.Immagine, \'base64\') AS ImmagineBase64,"
        "ST_X(Foto.GeoTag_Spaziale) AS longitudine, "
        "ST_Y(Foto.GeoTag_Spaziale) AS latitudine,"
        "Foto.Nome_Collezione "
        "FROM Foto INNER JOIN Utenti ON Foto.ID_Utente = Utenti.ID "
        "WHERE Foto.ID_Utente = @aUser";
    List<List<dynamic>> resultPhoto = await client.query(query, substitutionValues: {'aUser': userID});

    print("Query SQL: $query");
    print("Sostituzione: $userID\n");

    //print(resultPhoto);
    if(resultPhoto.isNotEmpty) {
      print("Foto trovate con successo!");
      return GetFotoUserResponse(
          status: GetFotoUserDB.success,
          userPhotoData: resultPhoto.isNotEmpty ? resultPhoto : []);
    } else {
      print("Nessuna foto caricata!");
      return GetFotoUserResponse(status: GetFotoUserDB.noFoundFoto);
    }
  } catch(e,s){
    print("Errore server durante il recupero delle foto: $e");
    print(s);
    return GetFotoUserResponse(status: GetFotoUserDB.errorServer);
  }
  finally {
    client.close();
  }
}

///Funzione che effettua una chiamata al db quando si devono recuperare
///i nomi degli utenti registrati nel db
Future<GetNomiShareDBResponse> getNomiUtentiShare(int userID) async {
  var client = await db.DataBaseConnection().startDatabaseConnection();

  String query = "SELECT Utenti.ID, Utenti.Nome_Utente FROM Utenti WHERE Utenti.ID <> @aUserID;";

  try {
    List<List<dynamic>> result = await client.query(
      query,
      substitutionValues: {
        'aUserID': userID,
      },
    );
    print("Query SQL: $query");
    print("Sostituzione: $userID\n");

    if (result.isNotEmpty) {
      print('Utenti trovati!');
      return GetNomiShareDBResponse(status: GetNomiShareDB.success, result: result);
    } else {
      print('Non è stato trovato nessun utente');
      return GetNomiShareDBResponse(status: GetNomiShareDB.noFoundUser);
    }
  } catch (e, s) {
    print("Query SQL: $query");
    print("Sostituzione: $userID\n");
    print("Errore server durante il recupero degli utenti in modalita share: ${e.toString()}");
    print(s.toString());
    return GetNomiShareDBResponse(status: GetNomiShareDB.errorServer);
  } finally {
    client.close();
  }

}

///Funzione che effettua una chiamata al db quando si deve aggiungere un utente
///alla condivisione della propria galleria
Future<AddShareDB> addShareDatabase(int userID, int userIDToShare) async {
  var client = await db.DataBaseConnection().startDatabaseConnection();

  String query = "INSERT INTO Shares (Utente1, Utente2) VALUES (@auserID, @aUserIDToShare)";

  try {
    List<List<dynamic>> result = await client.query(
      query,
      substitutionValues: {
        'auserID': userID,
        'aUserIDToShare': userIDToShare,
      },
    );
    print("Query SQL: $query");
    print("Sostituzione: $userID\n$userIDToShare\n");

    print('Utenti trovati!');
    return AddShareDB.success;
  } catch (e, s) {
    print("Query SQL: $query");
    print("Sostituzione: $userID\n$userIDToShare\n");
    print("Errore server durante il recupero degli utenti in modalita share: ${e.toString()}");
    print(s.toString());
    return AddShareDB.errorServer;
  } finally {
    client.close();
  }
}

///Funzione che effettua una chiamata al db quando si devono recuperare
///i nomi degli utenti con cui è attiva la condivisione del database
Future<List<dynamic>> getShareDatabase(int userID) async {

  var client = await db.DataBaseConnection().startDatabaseConnection();

  String query = "SELECT Utente1 FROM Shares WHERE Utente2 = @aUserID";

  try {
    List<List<dynamic>> result = await client.query(
      query,
      substitutionValues: {
        'aUserID': userID,
      },
    );

    print("Query SQL: $query");
    print("Sostituzione: $userID\n");
    print("QUERY MISTICA AVVENUTA");
    print(result);
    return result;

  } catch (e, s) {
    print("Query SQL: $query");
    print("Sostituzione: $userID\n");
    print("Errore server durante il Query mistica: ${e.toString()}");
    print(s.toString());
    return [];
  } finally {
    client.close();
  }
}

///Funzione che effettua una chiamata al db quando si devono recuperare le
///il nome di un utente dato il suo id
Future<List<dynamic>> getNameFromIDUser(int userID) async {
  var client = await db.DataBaseConnection().startDatabaseConnection();
  String query = "SELECT Nome_Utente FROM Utenti WHERE ID = @aUserID";

  try {
    List<dynamic> result = await client.query(
      query,
      substitutionValues: {
        'aUserID': userID,
      },
    );

    print("Query SQL: $query");
    print("Sostituzione: $userID\n");
    print("QUERY MISTICA AVVENUTA");
    print(result);

    if (result.isNotEmpty) {
      // Estrai il valore dalla lista e convertilo in una stringa
      return result[0];
    } else {
      return []; // Restituisce una stringa vuota se non ci sono risultati
    }
  } catch (e, s) {
    print("Query SQL: $query");
    print("Sostituzione: $userID\n");
    print("Errore server durante il Query mistica: ${e.toString()}");
    print(s.toString());
    return [];
  } finally {
    client.close();
  }
}
