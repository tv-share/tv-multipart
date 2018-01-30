import express from 'express';
import request from 'supertest';
import path from 'path';

import { TVMultipart } from '../src';
import { FileSystemException } from '../src/lib/exceptions';

const app = express();

const FILE_FIELD_NAME = 'arquivos';
const FILE_NAME = 'thevelops.png'
const FILE_PATH =  path.join('tests/assets', FILE_NAME);
const KEY1 = 'extension';
const VALUE1 = 'png';
const KEY2 = 'name';
const VALUE2 = 'myfile';


app.post('/test/success', async (req, res) => {
    const multipart = new TVMultipart({ fieldName: FILE_FIELD_NAME });
    res.send(await multipart.parse(req));
});

test('Parse - Success', async () => {
    const response = await request(app)
        .post('/test/success')
        .field(KEY1, VALUE1)
        .field(KEY2, VALUE2)
        .attach(FILE_FIELD_NAME, FILE_PATH);

    expect(response).toHaveProperty('body');

    const { body } = response;
    const schema = { fields: {} };
    
    schema.fields[KEY1] = VALUE1;
    schema.fields[KEY2] = VALUE2;
    schema[FILE_FIELD_NAME] = [{
        fieldName: FILE_FIELD_NAME,
        originalFilename: FILE_NAME,
        path: expect.stringMatching(new RegExp(`^${process.cwd()}\/temp\/(.+)(.png)$`)),
        headers: expect.any(Object),
        size: expect.any(Number)
    }];
    expect(body).toMatchObject(schema);
    expect(body[FILE_FIELD_NAME][0].size).toBeGreaterThan(0);    
});

test('Invalid temp path', () => {
    expect(() => {
        new TVMultipart({ fieldName: FILE_FIELD_NAME, uploadDir: '/\/\/\/\\' });
    }).toThrow(FileSystemException.Error);
});

test('Invalid field name', async (cb) => {

    app.post('/test/invalid_field_name', async (req, res) => {
        const multipart = new TVMultipart();
        try {
            const response = await multipart.parse(req);
        } catch(e) {
            expect(e.message).toBe("Invalid field name");
        } finally {
            cb();
        }
    });

    await request(app)
        .post('/test/invalid_field_name')
        .field(KEY1, VALUE1)
        .field(KEY2, VALUE2)
        .attach(FILE_FIELD_NAME, FILE_PATH);
});
