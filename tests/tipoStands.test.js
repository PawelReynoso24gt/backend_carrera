const { find, findAll, findById, create, update, delete: deleteTipoStand } = require('../controllers/tipoStandsController');
const TipoStands = require('../models').tipo_stands;
jest.mock('../models');

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('find', () => {
    it('debería retornar los tipos de stands activos', async () => {
        const req = {};
        const res = mockResponse();
        TipoStands.findAll.mockResolvedValue([{ tipo: 'Exhibición', estado: 1 }]);

        await find(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith([{ tipo: 'Exhibición', estado: 1 }]);
    });

    it('debería retornar un error 500 si ocurre un problema', async () => {
        const req = {};
        const res = mockResponse();
        TipoStands.findAll.mockRejectedValue(new Error('Error en la base de datos'));

        await find(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ message: 'Ocurrió un error al recuperar los datos.' });
    });
});

describe('findAll', () => {
    it('debería retornar todos los tipos de stands', async () => {
        const req = {};
        const res = mockResponse();
        TipoStands.findAll.mockResolvedValue([{ tipo: 'Exhibición' }]);

        await findAll(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith([{ tipo: 'Exhibición' }]);
    });

    it('debería retornar un error 500 si ocurre un problema', async () => {
        const req = {};
        const res = mockResponse();
        TipoStands.findAll.mockRejectedValue(new Error('Error en la base de datos'));

        await findAll(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ message: 'Ocurrió un error al recuperar los datos.' });
    });
});

describe('findById', () => {
    it('debería retornar un tipo de stand por ID', async () => {
        const req = { params: { id: 1 } };
        const res = mockResponse();
        TipoStands.findByPk.mockResolvedValue({ tipo: 'Exhibición', idTipoStands: 1 });

        await findById(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({ tipo: 'Exhibición', idTipoStands: 1 });
    });

    it('debería retornar 404 si el tipo de stand no existe', async () => {
        const req = { params: { id: 999 } };
        const res = mockResponse();
        TipoStands.findByPk.mockResolvedValue(null);

        await findById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({ message: 'Tipo de stand no encontrado.' });
    });
});

describe('create', () => {
    it('debería crear un nuevo tipo de stand', async () => {
        const req = { body: { tipo: 'Exhibicion', descripcion: 'Stand de exhibicion', estado: 1 } };
        const res = mockResponse();
        TipoStands.create.mockResolvedValue({ tipo: 'Exhibicion' });

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith({ tipo: 'Exhibicion' });
    });

    it('debería retornar un error 400 si los datos no son válidos', async () => {
        const req = { body: { tipo: '123Inválido' } };
        const res = mockResponse();

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
});

describe('update', () => {
    it('debería actualizar un tipo de stand existente', async () => {
        const req = { params: { id: 1 }, body: { tipo: 'Promocional' } };
        const res = mockResponse();
        TipoStands.update.mockResolvedValue([1]);

        await update(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'El tipo de stand ha sido actualizado' });
    });

    it('debería retornar 404 si el tipo de stand no existe', async () => {
        const req = { params: { id: 999 }, body: { tipo: 'Promocional' } };
        const res = mockResponse();
        TipoStands.update.mockResolvedValue([0]);

        await update(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Tipo de stand no encontrado' });
    });
});

describe('deleteTipoStand', () => {
    it('debería eliminar un tipo de stand existente', async () => {
        const req = { params: { id: 1 } };
        const res = mockResponse();
        TipoStands.findByPk.mockResolvedValue({ destroy: jest.fn() });

        await deleteTipoStand(req, res);

        expect(res.json).toHaveBeenCalledWith({ message: 'Tipo de stand eliminado correctamente' });
    });

    it('debería retornar 404 si el tipo de stand no existe', async () => {
        const req = { params: { id: 999 } };
        const res = mockResponse();
        TipoStands.findByPk.mockResolvedValue(null);

        await deleteTipoStand(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Tipo de stand no encontrado' });
    });
});