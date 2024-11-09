const { find, findAllUsers, findById, create, update, updatePassword, delete: deleteUser, hashPassword } = require('../controllers/usuariosController');
const USERS = require('../models').usuarios;
jest.mock('../models');

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('find', () => {
    it('debería retornar usuarios activos', async () => {
        const req = {};
        const res = mockResponse();
        USERS.findAll.mockResolvedValue([{ dataValues: { usuario: 'danipro', estado: 1 } }]);

        await find(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith([{ usuario: 'danipro', estado: 1 }]);
    });

    it('debería retornar un error 500 si ocurre un problema', async () => {
        const req = {};
        const res = mockResponse();
        USERS.findAll.mockRejectedValue(new Error('Error en la base de datos'));

        await find(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ message: 'Ocurrió un error al recuperar los datos.' });
    });
});

describe('findAllUsers', () => {
    it('debería retornar todos los usuarios', async () => {
        const req = {};
        const res = mockResponse();
        USERS.findAll.mockResolvedValue([{ dataValues: { usuario: 'testuser' } }]);

        await findAllUsers(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith([{ usuario: 'testuser' }]);
    });

    it('debería retornar un error 500 si ocurre un problema', async () => {
        const req = {};
        const res = mockResponse();
        USERS.findAll.mockRejectedValue(new Error('Error en la base de datos'));

        await findAllUsers(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ message: 'Ocurrió un error al recuperar los datos.' });
    });
});

describe('findById', () => {
    it('debería retornar un usuario por ID', async () => {
        const req = { params: { id: 1 } };
        const res = mockResponse();
        USERS.findByPk.mockResolvedValue({ dataValues: { usuario: 'danipro', id: 2 } });

        await findById(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({ usuario: 'danipro', id: 2 });
    });

    it('debería retornar 404 si el usuario no existe', async () => {
        const req = { params: { id: 999 } };
        const res = mockResponse();
        USERS.findByPk.mockResolvedValue(null);

        await findById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({ message: 'Usuario no encontrado.' });
    });
});

describe('create', () => {
    it('debería crear un nuevo usuario', async () => {
        const req = { body: { usuario: 'newuser', contrasenia: 'password123', idRol: 1, idSede: 1, idPersona: 1 } };
        const res = mockResponse();
        USERS.create.mockResolvedValue({ usuario: 'newuser' });

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith({ usuario: 'newuser' });
    });

    it('debería retornar un error 400 si hay problemas con los datos', async () => {
        const req = { body: { usuario: 'invaliduser!' } };
        const res = mockResponse();

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
});

describe('update', () => {
    it('debería actualizar un usuario existente', async () => {
        const req = { params: { id: 1 }, body: { usuario: 'updateduser' } };
        const res = mockResponse();
        USERS.update.mockResolvedValue([1]);

        await update(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith('El usuario ha sido actualizado');
    });

    it('debería retornar 404 si el usuario no existe', async () => {
        const req = { params: { id: 999 }, body: { usuario: 'updateduser' } };
        const res = mockResponse();
        USERS.update.mockResolvedValue([0]);

        await update(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
    });
});

describe('updatePassword', () => {
    it('debería actualizar la contraseña si la actual es correcta', async () => {
        const req = { params: { id: 3 }, body: { currentPassword: 'oldpassword', newPassword: 'newpassword123' } };
        const res = mockResponse();
        USERS.findByPk.mockResolvedValue({ contrasenia: hashPassword('oldpassword'), save: jest.fn() });

        await updatePassword(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith('La contraseña ha sido actualizada');
    });

    it('debería retornar 401 si la contraseña actual es incorrecta', async () => {
        const req = { params: { id: 1 }, body: { currentPassword: 'newpassword123', newPassword: 'newpassword123' } };
        const res = mockResponse();
        USERS.findByPk.mockResolvedValue({ contrasenia: hashPassword('oldpassword') });

        await updatePassword(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith({ message: 'Contraseña actual incorrecta' });
    });
});

describe('deleteUser', () => {
    it('debería eliminar un usuario existente', async () => {
        const req = { params: { id: 1 } };
        const res = mockResponse();
        USERS.findByPk.mockResolvedValue({ destroy: jest.fn() });

        await deleteUser(req, res);

        expect(res.json).toHaveBeenCalledWith({ message: 'Usuario eliminado correctamente' });
    });

    it('debería retornar 404 si el usuario no existe', async () => {
        const req = { params: { id: 999 } };
        const res = mockResponse();
        USERS.findByPk.mockResolvedValue(null);

        await deleteUser(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Usuario no encontrado' });
    });
});