const Busboy = require('busboy');
const fs = require('fs');
global._babelPolyfill = false;
const { verifyDomain } = require('../shared/Verify.js');
const { getPinataSDK } = require('../shared/pinata.js');

const FUNCTION_NAME = 'pin-image-to-ipfs';

function parseMultipartForm(event) {
  return new Promise((resolve) => {
    // we'll store all form fields inside of this
    const fields = {};
    // let's instantiate our busboy instance!
    const busboy = Busboy({
      // it uses request headers
      // to extract the form boundary value (the ----WebKitFormBoundary thing)
      headers: event.headers,
    });

    // before parsing anything, we need to set up some handlers.
    // whenever busboy comes across a file ...
    busboy.on('file', async (fieldname, filestream, filename, transferEncoding) => {
      // ... we take a look at the file's data ...
      if (filename.mimeType && filename.mimeType.includes('image')) {
        const ws = fs.createWriteStream(filename.filename, {
          metadata: {
            contentType: filename.mimeType,
          },
        });
        filestream.pipe(ws);
        fields[fieldname] = {
          filename,
          type: filename.mimeType,
        };
      }
    });

    // whenever busboy comes across a normal field ...
    busboy.on('field', (fieldName, value) => {
      // ... we write its value into `fields`.
      fields[fieldName] = value;
    });

    // once busboy is finished, we resolve the promise with the resulted fields.
    busboy.on('finish', () => {
      resolve(fields);
    });

    // now that all handlers are set up, we can finally start processing our request!
    busboy.write(event.body);
  });
}

exports.handler = async function (event, context, callback) {
  console.log(`${FUNCTION_NAME} starting...`);
  const startTime = Date.now();
  const pinata = getPinataSDK(process.env.PINATA_RW_API_KEY, process.env.PINATA_RW_SECRET_KEY);

  try {
    if (!verifyDomain(event.headers.host)) {
      return { statusCode: 401, body: 'Unauthorized' };
    }

    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Unsupported Request Method' };
    }

    const data = await parseMultipartForm(event);
    const { file, options } = data;
    const readableStreamForFile = fs.createReadStream(file.filename.filename);
    const response = await pinata.pinFileToIPFS(readableStreamForFile, options);
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  } finally {
    console.log(`${FUNCTION_NAME} completed in ${Date.now() - startTime} ms`);
  }
};
