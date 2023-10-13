#!/bin/bash

kubectl apply -f pgdata-persistentvolumeclaim.yaml #crea il persistentvolumeclaim

kubectl apply -f db-deployment.yaml #crea il deployment del db (pod)

kubectl apply -f db-service.yaml #crea il servizio del db (service)

kubectl apply -f backend-deployment.yaml #crea il deployment del backend (pod)

kubectl apply -f backend-service.yaml #crea il servizio del backend (service)

kubectl apply -f frontend-deployment.yaml #crea il deployment del frontend (pod)

kubectl apply -f frontend-service.yaml #crea il servizio del frontend (service)