const express = require('express');
const formidable = require('formidable');
const fs = require('fs');
const swig = require('swig');

const app = express();
const port = process.env.PORT | 8080;
const httpsPort = process.env.PORT | 8443;

app.get('/', (req,res) => {
    let template = swig.compileFile(`${__dirname}/templates/form.html`);
    let output = template();
    res.send(output);
})

/**
 * 
 * @param {String} name Returns if the entry name contains "model" or "patt"
 */
function getFileType(name) {
    if (RegExp(/model/g).test(name)) {
        return 'model';
    } else if (RegExp(/patt/g).test(name)) {
        return 'patt';
    } else {
        return null;
    }
}

/**
 * 
 * @param {String} name Returns the index at the end of the entry name where the
 * entry name has the format: {type}_{index}
 */
function getFileIndex(name) {
    return parseInt(name.match(/\d$/g)[0]);
}

/**
 * 
 * @param {Object} fields Object of html form fields received in the POST request.
 * @param {Object} files Object of files sent in the POST request.
 */
function createExperience(fields, files) {
    return new Promise((res, rej) => {
        let experiencePath = `${__dirname}/experiences/${encodeURI(fields.experiencename)}`;
        let assets = [];
        Object.entries(files).forEach((name, index) => {
            let fileType = getFileType(name[0]);
            let fileIndex = getFileIndex(name[0]);
            let filePathOld = files[name[0]].path;
            let filePathNew = `${experiencePath}/${files[name[0]].name}`;
            if(!fs.existsSync(experiencePath)) {
                fs.mkdirSync(experiencePath);
            }
            fs.rename(filePathOld, filePathNew, function (err) {
                if (err) throw err;
            });
            if (!assets[fileIndex]) {
                assets[fileIndex] = {
                    model: null,
                    patt: null
                };
            }
            assets[fileIndex][fileType] = files[name[0]].name;
        });
        let content = `
            const assets = ${JSON.stringify(assets)};
            module.exports = {
                assets
            }
        `;
        fs.writeFile(`${experiencePath}/index.js`, content, 'utf8', (err) => {
            if (err) {
                rej(err);
            }
            res();
        });
    })
}
app.post('/createexperience', (req,res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        createExperience(fields, files).then(() => {
            res.end();
        }).catch(err => {
            throw err;
        });
    });
})

/**
 * 
 * @param {String} path Path to the experience (should be /experiences/${path}/index.js)
 * @param {String} url Url of the request (needed to request static assets)
 */
function getExperienceTemplate(path, url) {
    const modelData = require(path);
    let template = swig.compileFile(`${__dirname}/templates/ar.html`);
    let output = template({
        modelData: modelData,
        reqUrl: url
    });
    return output;
}
app.get('/experiences/:path', (req,res) => {
    let path = `${__dirname}/experiences/${req.params.path}/index.js`;
    let url = req.protocol + '://' + req.get('host') + req.originalUrl;
    let template = getExperienceTemplate(path, url);
    res.send(template);
})

app.get('/experiences/:path/:asset', (req,res) => {
    const path = `${__dirname}/experiences/${req.params.path}/${req.params.asset}`;
    res.sendFile(path);
})

app.listen(port, () => console.log(`Server listening at http://localhost:${port}`));