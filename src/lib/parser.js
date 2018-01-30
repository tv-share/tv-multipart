import multiparty from 'multiparty';
import path from 'path';
import fs from 'fs';

import { FileSystemException, FieldNameException } from './exceptions';

const UPLOAD_DIR = path.join(process.cwd(), 'temp');
const FIELD_NAME = 'files';

export class TVMultipart {
    constructor({ uploadDir = UPLOAD_DIR, fieldName = FIELD_NAME } = {}) {
        this.uploadDir = uploadDir;
        this.fieldName = fieldName;

        if(!fs.existsSync(uploadDir)) {
            try {
                fs.mkdirSync(uploadDir);
            } catch(e) {
                throw new FileSystemException(e);
            }
        }
    }

    parse(req) {
        const { fieldName, uploadDir } = this;

        return new Promise((resolve, reject) => {        
            const form = new multiparty.Form({ uploadDir });
            form.parse(req, (err, fields, files) => {
                if(err) {
                    reject(err);
                } else {

                    if(!files[fieldName]) {
                        reject(new FieldNameException("Invalid field name"));
                    }

                    Object.keys(fields).forEach(k => { fields[k] = fields[k][0]; });
                    const data = { fields };
                    data[fieldName] = files[fieldName];
                    resolve(data);
                }
            });
        });
    }
}