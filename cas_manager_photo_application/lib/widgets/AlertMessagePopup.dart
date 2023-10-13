import 'package:flutter/material.dart';

class AlertMessagePopup extends StatelessWidget {
  final String titleMessage;
  final String message;
  final String? redirectToRoute;
  const AlertMessagePopup({
    Key? key,
    required this.message,
    required this.titleMessage,
    this.redirectToRoute,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(titleMessage),
      content: Text(message),
      actions: [
        TextButton(
          onPressed: () {
            Navigator.of(context).pop();
            if (redirectToRoute != null) {
              Navigator.of(context).pushNamed(redirectToRoute!);
            }
          },
          child: Text('Chiudi'),
        ),
      ],
    );
  }
}
