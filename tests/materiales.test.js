// Pruebas unitarias para los métodos create y update
const { create, update } = require('../controllers/materialesController');
const MATERIALES_TEST = require('../models').materiales;
jest.mock('../models');

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('create', () => {
  it('debería crear un nuevo material', async () => {
    const req = { body: { material: 'Madera', cantidad: 10, descripcion: 'Material para construcción', estado: 1, idComision: 2 } };
    const res = mockResponse();
    MATERIALES_TEST.create.mockResolvedValue({ material: 'Madera' });

    await create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({ material: 'Madera' });
  });

  it('debería retornar un error 500 si hay problemas al crear', async () => {
    const req = { body: { material: 'Madera' } };
    const res = mockResponse();
    MATERIALES_TEST.create.mockRejectedValue(new Error('Error en la base de datos'));

    await create(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error al insertar material' });
  });
});

describe('update', () => {
  it('debería actualizar un material existente', async () => {
    const req = { params: { id: 1 }, body: { material: 'Metal' } };
    const res = mockResponse();
    MATERIALES_TEST.update.mockResolvedValue([1]);

    await update(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('El material ha sido actualizado');
  });

  it('debería retornar 404 si el material no existe', async () => {
    const req = { params: { id: 999 }, body: { material: 'Metal' } };
    const res = mockResponse();
    MATERIALES_TEST.update.mockResolvedValue([0]);

    await update(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({ message: 'Material no encontrado' });
  });
});