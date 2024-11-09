const { find, findAll, findById, create, update, delete: deleteDetalleHorario } = require('../controllers/detalle_horariosController');
const DetalleHorarios = require('../models').detalle_horarios;
jest.mock('../models');

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('find', () => {
    it('debería retornar los detalles de horarios activos', async () => {
        const req = {};
        const res = mockResponse();
        DetalleHorarios.findAll.mockResolvedValue([{ cantidadPersonas: 10, estado: 1 }]);

        await find(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith([{ cantidadPersonas: 10, estado: 1 }]);
    });

    it('debería retornar un error 500 si ocurre un problema', async () => {
        const req = {};
        const res = mockResponse();
        DetalleHorarios.findAll.mockRejectedValue(new Error('Error en la base de datos'));

        await find(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ message: 'Ocurrió un error al recuperar los datos.' });
    });
});

describe('findAll', () => {
    it('debería retornar todos los detalles de horarios', async () => {
        const req = {};
        const res = mockResponse();
        DetalleHorarios.findAll.mockResolvedValue([{ cantidadPersonas: 10 }]);

        await findAll(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith([{ cantidadPersonas: 10 }]);
    });

    it('debería retornar un error 500 si ocurre un problema', async () => {
        const req = {};
        const res = mockResponse();
        DetalleHorarios.findAll.mockRejectedValue(new Error('Error en la base de datos'));

        await findAll(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ message: 'Ocurrió un error al recuperar los datos.' });
    });
});

describe('findById', () => {
    it('debería retornar un detalle de horario por ID', async () => {
        const req = { params: { id: 1 } };
        const res = mockResponse();
        DetalleHorarios.findByPk.mockResolvedValue({ cantidadPersonas: 10, idDetalleHorario: 1 });

        await findById(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({ cantidadPersonas: 10, idDetalleHorario: 1 });
    });

    it('debería retornar 404 si el detalle de horario no existe', async () => {
        const req = { params: { id: 999 } };
        const res = mockResponse();
        DetalleHorarios.findByPk.mockResolvedValue(null);

        await findById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({ message: 'Detalle de horario no encontrado.' });
    });
});

describe('create', () => {
    it('debería crear un nuevo detalle de horario', async () => {
        const req = { body: { cantidadPersonas: 10, idHorario: 1, idCategoriaHorario: 2 } };
        const res = mockResponse();
        DetalleHorarios.create.mockResolvedValue({ cantidadPersonas: 10 });

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith({ cantidadPersonas: 10 });
    });

    it('debería retornar un error 400 si los datos no son válidos', async () => {
        const req = { body: { cantidadPersonas: -5, idHorario: 'invalid', idCategoriaHorario: 'invalid' } };
        const res = mockResponse();

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
});

describe('update', () => {
    it('debería actualizar un detalle de horario existente', async () => {
        const req = { params: { id: 1 }, body: { cantidadPersonas: 20 } };
        const res = mockResponse();
        DetalleHorarios.update.mockResolvedValue([1]);

        await update(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith('El detalle de horario ha sido actualizado');
    });

    it('debería retornar 404 si el detalle de horario no existe', async () => {
        const req = { params: { id: 999 }, body: { cantidadPersonas: 20 } };
        const res = mockResponse();
        DetalleHorarios.update.mockResolvedValue([0]);

        await update(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({ message: 'Detalle de horario no encontrado' });
    });
});

describe('deleteDetalleHorario', () => {
    it('debería eliminar un detalle de horario existente', async () => {
        const req = { params: { id: 1 } };
        const res = mockResponse();
        DetalleHorarios.findByPk.mockResolvedValue({ destroy: jest.fn() });

        await deleteDetalleHorario(req, res);

        expect(res.json).toHaveBeenCalledWith({ message: 'Detalle de horario eliminado correctamente' });
    });

    it('debería retornar 404 si el detalle de horario no existe', async () => {
        const req = { params: { id: 999 } };
        const res = mockResponse();
        DetalleHorarios.findByPk.mockResolvedValue(null);

        await deleteDetalleHorario(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Detalle de horario no encontrado' });
    });
});
