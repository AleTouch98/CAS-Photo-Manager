import 'package:postgres/postgres.dart';

///Classe di configurazione del database
class DataBaseConnection {

  //Connessione al database
  final dbConnection = PostgreSQLConnection('10.0.2.2', 5432, 'photo_man',
      username: 'postgres', password: 'Mp090998');

  ///Funzione che avvia la connessione al database
  startDatabaseConnection() async {
    await dbConnection.open().then((value) => print('Database connected'));
    return dbConnection;
  }

  ///Funzione che chiude la connessione al database
  closeDatabaseConnection() async {
    await dbConnection.close().then((value) => print('Database closed'));
  }
}