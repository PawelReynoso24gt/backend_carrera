const { find, findAll, findById, create, update, delete: deleteHorario } = require('../controllers/horariosController');
const Horarios = require('../models').horarios;
jest.mock('../models');

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('find', () => {
    it('debería retornar los horarios activos', async () => {
        const req = {};
        const res = mockResponse();
        Horarios.findAll.mockResolvedValue([{ horarioInicio: '2024-10-31 03:00:00', estado: 1 }]);

        await find(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith([{ horarioInicio: '2024-10-31 03:00:00', estado: 1 }]);
    });

    it('debería retornar un error 500 si ocurre un problema', async () => {
        const req = {};
        const res = mockResponse();
        Horarios.findAll.mockRejectedValue(new Error('Error en la base de datos'));

        await find(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ message: 'Ocurrió un error al recuperar los datos.' });
    });
});

describe('findAll', () => {
    it('debería retornar todos los horarios', async () => {
        const req = {};
        const res = mockResponse();
        Horarios.findAll.mockResolvedValue([{ horarioInicio: '2024-10-31 03:00:00' }]);

        await findAll(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith([{ horarioInicio: '2024-10-31 03:00:00' }]);
    });

    it('debería retornar un error 500 si ocurre un problema', async () => {
        const req = {};
        const res = mockResponse();
        Horarios.findAll.mockRejectedValue(new Error('Error en la base de datos'));

        await findAll(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ message: 'Ocurrió un error al recuperar los datos.' });
    });
});

describe('findById', () => {
    it('debería retornar un horario por ID', async () => {
        const req = { params: { id: 1 } };
        const res = mockResponse();
        Horarios.findByPk.mockResolvedValue({ horarioInicio: '2024-10-31 03:00:00', idHorario: 1 });

        await findById(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({ horarioInicio: '2024-10-31 03:00:00', idHorario: 1 });
    });

    it('debería retornar 404 si el horario no existe', async () => {
        const req = { params: { id: 999 } };
        const res = mockResponse();
        Horarios.findByPk.mockResolvedValue(null);

        await findById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({ message: 'Horario no encontrado.' });
    });
});

describe('create', () => {
    it('debería crear un nuevo horario', async () => {
        const req = { body: { horarioInicio: '2024-10-31 03:00:00', horarioFinal: '2024-10-31 04:00:00', estado: 1 } };
        const res = mockResponse();
        Horarios.create.mockResolvedValue({ horarioInicio: '2024-10-31 03:00:00' });

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith({ horarioInicio: '2024-10-31 03:00:00' });
    });

    it('debería retornar un error 400 si los datos no son válidos', async () => {
        const req = { body: { horarioInicio: 'fecha inválida', horarioFinal: '2024-10-31 04:00:00' } };
        const res = mockResponse();

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
});

describe('update', () => {
    it('debería actualizar un horario existente', async () => {
        const req = { params: { id: 1 }, body: { horarioInicio: '2024-10-31 05:00:00', horarioFinal: '2024-10-31 06:00:00' } };
        const res = mockResponse();
        Horarios.update.mockResolvedValue([1]);

        await update(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith('El horario ha sido actualizado');
    });

    it('debería retornar 404 si el horario no existe', async () => {
        const req = { params: { id: 999 }, body: { horarioInicio: '2024-10-31 05:00:00', horarioFinal: '2024-10-31 06:00:00' } };
        const res = mockResponse();
        Horarios.update.mockResolvedValue([0]);

        await update(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({ message: 'Horario no encontrado' });
    });
});

describe('deleteHorario', () => {
    it('debería eliminar un horario existente', async () => {
        const req = { params: { id: 1 } };
        const res = mockResponse();
        Horarios.findByPk.mockResolvedValue({ destroy: jest.fn() });

        await deleteHorario(req, res);

        expect(res.json).toHaveBeenCalledWith({ message: 'Horario eliminado correctamente' });
    });

    it('debería retornar 404 si el horario no existe', async () => {
        const req = { params: { id: 999 } };
        const res = mockResponse();
        Horarios.findByPk.mockResolvedValue(null);

        await deleteHorario(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Horario no encontrado' });
    });
});