# Bank-API-INSTP-UTN

## :newspaper: Introducción
Bank API INSPT es una aplicación web SPA desarrollada utilizando el stack MERN.
Dicho sistema permite gestionar y administrar una entidad bancaria, proporcionando a la entidad y a sus clientes dos interfaces distintas que les permiten acceder al sistema y realizar diversas operaciones y consultas según sus respectivos roles y permisos asignados.

## Índice
- [Introducción](#:newspaper:-introducción)
- [Funcionalidades](#:hammer:-funcionalidades-del-sistema)
- [Instalación](#:rocket:-instalación)
- [Tecnologías utilizadas](#:heavy_check_mark:-tecnologías-utilizadas)
- [Créditos](#:coffee:-créditos)
- [Autor](#:blue_book:-autor)

## :hammer: Funcionalidades del sistema
### Entidad bancaria:
+ #### Inicio: 
    + Listado de clientes del banco.
    + ABM clientes.
    + ABM cuentas bancarias.

+ #### Cuentas                
    + ##### Ver cuentas
        + Visualizar operaciones realizadas
        + Cerrar/Activar cuenta.
    + #####  Resumen de cuenta
        + Emitir resumen de cuenta

+ #### Operaciones:
    + Deposito.
    + Extracción.
    + Transferencia.

+ #### Panel de usuarios: Únicamente disponible para el rol Administrador
    + ABM empleados de la entidad bancaria.

### Cliente:
- #### Posición consolidada: Mini resumen del estado del cliente
    + Listado de cuentas que posee el cliente.
    + Últimas operaciones realizadas por cuenta (2 como máximo por c/u).

+ #### Cuentas: 
+ ##### Mis cuentas: Listado de cuentas que posee el cliente.
    + Cerrar/Activar cuenta
    + Modificar ALIAS 
    + Visualizar operaciones realizadas.
+ ##### Resumen de cuenta:
    + Emitir resumen de cuenta.

+ #### Operaciones:
    + Transferencia.

+ ### Perfil del usuario:
Esta opción está disponible para todos los usuarios (empleados y clientes), la cual permite modificar ciertos datos personales.

## :rocket: Instalación
La aplicación cuenta con tres directorios principales
+ #### Backend
Contiene todas las funciones necesarias para la conexión, consultas y almacenamientos de los datos en la BD.

+ #### Frontend
Contiene las diferentes funciones que le permiten al usuario (empleado y cliente) interactuar con el sistema.

+ #### Migrations
Contiene los datos iniciales necesarios para poder configurar el sistema por primera vez.

Antes que nada se deberá crear un archivo **.env** en la carpeta raíz y definirle las siguientes variables:
```sh
NODE_ENV=development
PORT=5000
	@@ -37,48 +81,103 @@ EMAIL_PASS=
```
:rotating_light: **IMPORTANTE**: Para que funcione el envío del mail automático para restablecer la contraseña con la opción *¿Ha olvidado la contraseña?*, se deberá configurar las opciones **EMAIL** del archivo .env :rotating_light:

Una vez hecho esto, se deberá posicionar en la carpeta raíz y ejecutar el siguiente comando que instalará las librerías necesarias:
```sh
npm i 
```
Luego se deberá dirigir a la carpeta **frontend** y ejecutar nuevamente el mismo comando para instalar las librerías necesarias:
```sh
cd frontend
npm i
```
Una vez que se hayan instalado todas las librerías se deberá volver a la carpeta raíz y ejecutar el siguiente comando (ya que se utiliza la librería concurrently, se pueden ejecutar el servidor del backend y el frontend con el mismo comando): 
```sh
cd..
npm run dev
```
Ya pude acceder al sistema a través de la ruta <http://localhost:3000/login>

Si se desea poner la app en producción, se deberá ejecutar el siguiente comando en el directorio **frontend**
```sh
cd frontend
npm run build
```

Una vez hecho esto se deberá modificar dos archivos:
##### .env
```sh
NODE_ENV=production
FRONTEND_URL=http://localhost:5000
```

##### backend/server.js
Importar la siguiente librería
```sh
import path from 'path';
```

Modificar esta parte del código
Actual
```javascript
app.get('/', (req, res) => res.send('API ejecutandose.'));
```

Nuevo
```javascript
if (process.env.NODE_ENV === 'production') {
    const __dirname = path.resolve();
    app.use(express.static(path.join(__dirname, '/frontend/dist')));

    app.get('*', (req, res) =>
        res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'))
    );
} else {
    app.get('/', (req, res) => {
        res.send('API corriendo.');
    });
}

```

Ya terminados los cambios se podrá ejecutar el siguiente comando en la raiz:
```sh
npm start
```

Ahora se puede acceder al sistema a través de la ruta <http://localhost:5000/login>

Puede utilizar los siguientes usuarios:
+ ##### Empleados:
    + **Usuario**: admin
    + **Contraseña**: administrador
    + **Perfil**: Admin
    + **Usuario**: jperez
    + **Contraseña**: 20342114335
    + **Perfil**: Empleado

+ ##### Clientes:
    + **Usuario**: 27280335148
    + **Contraseña**: 27280335148
    + **Tipo cliente**: Persona Física
    + **Usuario**: 30715925083
    + **Contraseña**: 30715925083
    + **Tipo cliente**: Persona Jurídica

## :heavy_check_mark: Tecnologías utilizadas
- MongoDB
- Express
- React
- React Router
- React Bootstrap
- Redux
- NodeJS
- JWT
- Entre otras

## :coffee: Créditos
El sistema está desarrollado teniendo como referencia la guía gratuita **MERN Crash Course** [Parte 1 ](https://www.traversymedia.com/blog/mern-crash-course-part-1) y [Parte 2](https://www.traversymedia.com/blog/mern-crash-course-part-2), ofrecida por **Brad Traversy** en su sitio web <https://www.traversymedia.com>

## :blue_book: Autor
**Desarrollado por Pablo De Filpo**