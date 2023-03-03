const dotenv = require("dotenv");
dotenv.config();

var AWS = require('aws-sdk'),
        region = "ap-south-1",
        secretName = "arn:aws:secretsmanager:ap-south-1:740247834186:secret:QA-k8CiYj",
        secret,
        decodedBinarySecret;

// Create a Secrets Manager client
var client = new AWS.SecretsManager({
        region: region,
        credentials: {
                accessKeyId: "access_key_id",
		secretAccessKey: "secret_key_id"
        }
});

async function loadSecrets(client) {
        return client.getSecretValue({ SecretId: secretName },async (err, data) =>{
                console.log('tfunction');
                if (err) {
                        if (err.code === 'DecryptionFailureException')
                                throw err;
                        else if (err.code === 'InternalServiceErrorException')
                                throw err;
                        else if (err.code === 'InvalidParameterException')
                                throw err;
                        else if (err.code === 'InvalidRequestException')
                                throw err;
                        else if (err.code === 'ResourceNotFoundException')
                                throw err;
                }
                else {
                        if ('SecretString' in data) {
                                secret = JSON.parse(data.SecretString);
                                await Object.keys(secret).forEach(key => { process.env[key] = secret[key]; });
                                console.log('secret--->', process.env);
                                console.log('testenvloading');
                                return process.env
                        } else {
                                let buff = new Buffer(data.SecretBinary, 'base64');
                                decodedBinarySecret = buff.toString('ascii');
                        }
                }
        }).promise()
}
loadSecrets(client).then(_ => { require('./dist/main')})
        .catch(err => {
                console.error(err); process.exit(0);
        })
        ;
