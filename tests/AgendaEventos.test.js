const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AgendaEventos", function () {
  let agendaEventos;
  let owner;
  let user1;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

    const AgendaEventos = await ethers.getContractFactory("AgendaEventos");
    agendaEventos = await AgendaEventos.deploy();
    await agendaEventos.deployed();
  });

  it("Debería permitir crear un nuevo evento", async function () {
    await agendaEventos.createEvent("Reunión de equipo", "Discusión sobre el proyecto", 1672531200); // Ejemplo de fecha Unix timestamp

    const evento = await agendaEventos.getEvent(0);
    expect(evento[0]).to.equal("Reunión de equipo");
    expect(evento[1]).to.equal("Discusión sobre el proyecto");
    expect(evento[2]).to.equal(1672531200);

    // Verificamos que se emitió el evento EventoCreado
    await expect(agendaEventos.createEvent("Otro evento", "Descripción", 1672617600))
      .to.emit(agendaEventos, "EventoCreado")
      .withArgs(owner.address, 1, "Otro evento");
  });

  it("Debería permitir obtener un evento existente", async function () {
    await agendaEventos.createEvent("Conferencia", "Presentación importante", 1672704000);
    const evento = await agendaEventos.getEvent(0);
    expect(evento[0]).to.equal("Conferencia");
    expect(evento[1]).to.equal("Presentación importante");
    expect(evento[2]).to.equal(1672704000);
  });

  it("Debería fallar al obtener un evento inexistente", async function () {
    await expect(agendaEventos.getEvent(0)).to.be.revertedWith("Evento no existe");
  });

  it("Debería permitir modificar un evento existente", async function () {
    await agendaEventos.createEvent("Evento antiguo", "Descripción antigua", 1672790400);
    await agendaEventos.updateEvent(0, "Evento nuevo", "Descripción nueva", 1672876800);
    const eventoActualizado = await agendaEventos.getEvent(0);
    expect(eventoActualizado[0]).to.equal("Evento nuevo");
    expect(eventoActualizado[1]).to.equal("Descripción nueva");
    expect(eventoActualizado[2]).to.equal(1672876800);

    // Verificamos que se emitió el evento EventoModificado
    await expect(agendaEventos.updateEvent(0, "Otro nombre", "Otra descripción", 1672963200))
      .to.emit(agendaEventos, "EventoModificado")
      .withArgs(owner.address, 0, "Otro nombre");
  });

  it("Debería fallar al modificar un evento inexistente", async function () {
    await expect(agendaEventos.updateEvent(0, "Nuevo nombre", "Nueva descripción", 1673049600))
      .to.be.revertedWith("Evento no existe");
  });

  it("Debería permitir eliminar un evento existente", async function () {
    await agendaEventos.createEvent("Evento a eliminar", "Descripción", 1673136000);
    await agendaEventos.deleteEvent(0);
    await expect(agendaEventos.getEvent(0)).to.be.revertedWith("Evento no existe");

    // Verificamos que se emitió el evento EventoEliminado
    await expect(agendaEventos.deleteEvent(1)) // Intentamos eliminar un evento inexistente (ID 1)
      .to.be.revertedWith("Evento no existe");

    await agendaEventos.createEvent("Segundo evento", "Otra descripción", 1673222400);
    await expect(agendaEventos.deleteEvent(1))
      .to.emit(agendaEventos, "EventoEliminado")
      .withArgs(owner.address, 1);
  });

  it("Debería fallar al eliminar un evento inexistente", async function () {
    await expect(agendaEventos.deleteEvent(0)).to.be.revertedWith("Evento no existe");
  });

  it("Debería permitir listar todos los eventos de un usuario", async function () {
    await agendaEventos.createEvent("Evento 1", "Descripción 1", 1673308800);
    await agendaEventos.createEvent("Evento 2", "Descripción 2", 1673395200);
    const eventosUsuario = await agendaEventos.listEvents();
    expect(eventosUsuario.length).to.equal(2);
    expect(eventosUsuario[0].nombre).to.equal("Evento 1");
    expect(eventosUsuario[1].nombre).to.equal("Evento 2");
  });

  it("Debería retornar un array vacío si el usuario no tiene eventos", async function () {
    const eventosUsuario = await agendaEventos.listEvents();
    expect(eventosUsuario.length).to.equal(0);
  });

  it("Debería manejar eventos de diferentes usuarios correctamente", async function () {
      await agendaEventos.createEvent("Evento del owner", "Descripción", 1673481600);

      const agendaUser1 = agendaEventos.connect(user1);
      await agendaUser1.createEvent("Evento del usuario 1", "Otra descripción", 1673568000);

      const eventosOwner = await agendaEventos.listEvents();
      expect(eventosOwner.length).to.equal(1);
      expect(eventosOwner[0].nombre).to.equal("Evento del owner");

      const eventosUser1 = await agendaUser1.listEvents();
      expect(eventosUser1.length).to.equal(1);
      expect(eventosUser1[0].nombre).to.equal("Evento del usuario 1");
    });
});