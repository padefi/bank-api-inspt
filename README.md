# Bank-API-INSTP-UTN
*Proyecto final de programación 3 INSPT UTN*

El proyecto se realizó con el stack MERN, junto con librería UI **React Bootstrap** y **Redux Toolkit** para la creación de endpoints.

## Intalación:

La api cuenta con 3 directorios:
*backend
*frontend
*migrations

```sh
npm i 
cd frontend
npm i
cd..
```

Una vez instalado todo, se debe crear un archivo **.env** en la raiz el cual contendrá la siguiente configuración necesaria para el funcionamiento de la API

```sh
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/bank-api
JWT_SECRET=2fada92209d75fae0d8277d5f3da7d339435b99d4dfe764e5d332ebb561051d0015974
SESSION_SECRET=3b002ce67802073c8764f9df8318560c5b52ed443f2f239dc4b7ff285049b99789f012
KEY_PASSWORD=7c55aee91e46d7d3ef9ea2906ccdc3d3f2f3fed881afd89aa4335ba38d45c5ed
```

## Inicio de API:

Una vez hecho todo esto se puede iniciar el servidor.

```sh
npm run dev (este comando ejecuta las migraciones e inicia ambos servidores)
```

### Caracteristicas:

> El sistema cuenta con 2 interfaces:
* Bank
* Customer

> Bank es todo lo relacionado a la gestión de clientes, cuentas y operaciones del lado del banco. Se puede ingresar con los siguientes usuarios:
> **Usuario**: admin   
> **Contraseña**: administrador    
> **Perfil**: Admin

> **Usuario**: jperez
> **Contraseña**: 20342114335    
> **Perfil**: Admin

> Customer es todo lo relacionado a la gestión de cuentas y operaciones del lado del cliente. Se puede ingresar con los siguientes usuarios:
> **Usuario**: 27280335148
> **Contraseña**: 27280335148
> **Tipo cliente**: Persona Física

> **Usuario**: 30715925083
> **Contraseña**: 30715925083
> **Tipo cliente**: Persona Juridica

> **IMPORTANTE**: Una vez iniciada la sesión, se generará un token de 10 minutos, el cual se irá renovando cada vez que el usuario ingrese a los diferentes menús/opciones. Junto con este se ejecutará una función definida con un setTimeout, la cual deslogueará al usuario automaticamente si este no interacciona con el sistema transcurridos los 10 minutos.

**Desarrollado por Pablo De Filpo**