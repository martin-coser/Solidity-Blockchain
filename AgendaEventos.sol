// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AgendaEventos {

    // Estructura para guardar los datos de cada evento
    struct Evento {
        string nombre;
        string descripcion;
        uint fecha;
        bool existe;
    }

    // Mapping para asociar eventos a cada usuario (address)
    mapping(address => mapping(uint => Evento)) private eventos;

    // Contador para llevar la cuenta de los eventos por usuario
    mapping(address => uint) private contadorEventos;

    // Eventos que emitiremos en cada acción
    event EventoCreado(address indexed creador, uint id, string nombre);

    // Función para crear un nuevo evento
    function createEvent(string memory nombre, string memory descripcion, uint fecha) public {
        // Guardamos el evento en el mapping usando el contador actual como ID
        eventos[msg.sender][contadorEventos[msg.sender]] = Evento(nombre, descripcion, fecha, true);
        emit EventoCreado(msg.sender, contadorEventos[msg.sender], nombre);
        // Incrementamos el contador de eventos para ese usuario
        contadorEventos[msg.sender]++;
    }

        // Función para obtener un evento por su ID
    function getEvent(uint id) public view returns (string memory, string memory, uint) {
        // Validamos que el evento exista
        require(eventos[msg.sender][id].existe, "Evento no existe");
        Evento storage e = eventos[msg.sender][id];
        return (e.nombre, e.descripcion, e.fecha);
    }

        // Función para modificar un evento existente
    function updateEvent(uint id, string memory nombre, string memory descripcion, uint fecha) public {
        // Validamos que el evento exista
        require(eventos[msg.sender][id].existe, "Evento no existe");
        // Actualizamos los datos del evento
        eventos[msg.sender][id] = Evento(nombre, descripcion, fecha, true);
        emit EventoModificado(msg.sender, id, nombre);
    }

        // Función para eliminar un evento
    function deleteEvent(uint id) public {
        // Validamos que el evento exista
        require(eventos[msg.sender][id].existe, "Evento no existe");
        delete eventos[msg.sender][id];
        emit EventoEliminado(msg.sender, id);
    }

        // Función para listar todos los eventos de un usuario
    function listEvents() public view returns (Evento[] memory) {
        // Obtenemos el número de eventos del usuario
        uint numEventos = contadorEventos[msg.sender];

        // Creamos un array dinámico para almacenar los eventos
        Evento[] memory eventosUsuario = new Evento[](numEventos);

        // Llenamos el array con los eventos del usuario
        for (uint i = 0; i < numEventos; i++) {
            eventosUsuario[i] = eventos[msg.sender][i];
        }

        return eventosUsuario;
    }

    

    event EventoModificado(address indexed creador, uint id, string nombre);
    event EventoEliminado(address indexed creador, uint id);
}
