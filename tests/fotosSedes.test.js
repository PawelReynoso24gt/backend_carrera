const { find, find_all, findById, create, update, delete: deleteFotoSede } = require('../controllers/fotosSedesController');
const FotosSedes = require('../models').fotos_sedes;
jest.mock('../models');

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('find', () => {
    it('debería retornar las fotos de sedes activas', async () => {
        const req = {};
        const res = mockResponse();
        FotosSedes.findAll.mockResolvedValue([{ foto: 'data:image/jpeg;base64,example', estado: 1 }]);

        await find(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith([{ foto: 'data:image/jpeg;base64,example', estado: 1 }]);
    });

    it('debería retornar un error 500 si ocurre un problema', async () => {
        const req = {};
        const res = mockResponse();
        FotosSedes.findAll.mockRejectedValue(new Error('Error en la base de datos'));

        await find(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ message: 'Ocurrió un error al recuperar los datos.' });
    });
});

describe('find_all', () => {
    it('debería retornar todas las fotos de sedes', async () => {
        const req = {};
        const res = mockResponse();
        FotosSedes.findAll.mockResolvedValue([{ foto: 'data:image/jpeg;base64,example' }]);

        await find_all(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith([{ foto: 'data:image/jpeg;base64,example' }]);
    });

    it('debería retornar un error 500 si ocurre un problema', async () => {
        const req = {};
        const res = mockResponse();
        FotosSedes.findAll.mockRejectedValue(new Error('Error en la base de datos'));

        await find_all(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ message: 'Ocurrió un error al recuperar los datos.' });
    });
});

describe('findById', () => {
    it('debería retornar una foto de sede por ID', async () => {
        const req = { params: { id: 1 } };
        const res = mockResponse();
        FotosSedes.findByPk.mockResolvedValue({ foto: 'data:image/jpeg;base64,example', idFotoSede: 1 });

        await findById(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({ foto: 'data:image/jpeg;base64,example', idFotoSede: 1 });
    });

    it('debería retornar 404 si la foto de sede no existe', async () => {
        const req = { params: { id: 999 } };
        const res = mockResponse();
        FotosSedes.findByPk.mockResolvedValue(null);

        await findById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({ message: 'Foto de sede no encontrada.' });
    });
});

describe('create', () => {
    it('debería crear una nueva foto de sede', async () => {
        const req = { body: { foto: 'data:image/jpeg;base64,example', idSede: 1 } };
        const res = mockResponse();
        FotosSedes.create.mockResolvedValue({ foto: 'data:image/jpeg;base64,example', idSede: 1 });

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith({ foto: 'data:image/jpeg;base64,example', idSede: 1 });
    });

    it('debería retornar un error 400 si los datos no son válidos', async () => {
        const req = { body: { foto: 'invalid_base64_data', idSede: 'not_a_number' } };
        const res = mockResponse();

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
});

describe('update', () => {
    it('debería actualizar una foto de sede existente', async () => {
        const req = { params: { id: 1 }, body: { foto: 'data:image/jpeg;base64,updateddata', estado: 0, idSede: 1 } };
        const res = mockResponse();
        FotosSedes.update.mockResolvedValue([1]);

        await update(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith('La foto de sede ha sido actualizada');
    });

    it('debería retornar 404 si la foto de sede no existe', async () => {
        const req = { params: { id: 999 }, body: { foto: 'data:image/jpeg;base64,updateddata', idSede: 1 } };
        const res = mockResponse();
        FotosSedes.update.mockResolvedValue([0]);

        await update(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({ message: 'Foto de sede no encontrada' });
    });
});

describe('deleteFotoSede', () => {
    it('debería eliminar una foto de sede existente', async () => {
        const req = { params: { id: 1 } };
        const res = mockResponse();
        FotosSedes.findByPk.mockResolvedValue({ destroy: jest.fn() });

        await deleteFotoSede(req, res);

        expect(res.json).toHaveBeenCalledWith({ message: 'Foto de sede eliminada correctamente' });
    });

    it('debería retornar 404 si la foto de sede no existe', async () => {
        const req = { params: { id: 999 } };
        const res = mockResponse();
        FotosSedes.findByPk.mockResolvedValue(null);

        await deleteFotoSede(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Foto de sede no encontrada' });
    });
});
