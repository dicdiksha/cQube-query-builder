import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk'
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { Client } from 'minio';
import { BlobServiceClient } from '@azure/storage-blob';

@Injectable()
export class UpdatedDateService {
    private s3: S3;
    private readonly s3BucketName: string;
    private readonly containerFolderName: string;
    private minioClient: Minio.Client;
    private readonly storageType: string

    constructor(private readonly configService: ConfigService,) {
        this.s3BucketName = this.configService.get<string>('S3_BUCKET');
        this.containerFolderName = this.configService.get<string>('CONTAINER_FOLDER_NAME');
        this.storageType = this.configService.get<string>('STORAGE_TYPE');

        this.s3 = new S3({
            accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY'),
            secretAccessKey: this.configService.get<string>('AWS_SECRET_KEY'),
            region: this.configService.get<string>('AWS_BUCKET_REGION'),
        });
    }

    async getLastModified(inputData) {
        const programFolderName = inputData.ProgramName;
        console.log(programFolderName);
        try {
            if (this.storageType == 'aws') {
                const params = {
                    Bucket: this.s3BucketName,
                    Prefix: `${this.containerFolderName}/${programFolderName}/`,
                };
                const objects = await this.s3.listObjectsV2(params).promise();
                if (!objects.Contents || objects.Contents.length === 0) {
                    return {
                        code: 400,
                        error: "No data found"
                    };
                }
                const lastModifiedObject = objects.Contents.reduce((prev, current) => {
                    return prev.LastModified > current.LastModified ? prev : current;
                });
                console.log('last', lastModifiedObject);

                if (lastModifiedObject) {
                    return {
                        code: 200,
                        response: lastModifiedObject.LastModified
                    }
                }
            }
            else if (this.storageType == 'local') {
                this.minioClient = new Client({
                    endPoint: this.configService.get('MINIO_END_POINT'),
                    port: Number(this.configService.get('MINIO_PORT')),
                    useSSL: false,
                    accessKey: this.configService.get('MINIO_ACCESS_KEY'),
                    secretKey: this.configService.get('MINIO_SECRET_KEY'),
                });
                const minioBucket = this.configService.get<string>('MINIO_BUCKET')
                const objects = await this.minioClient.listObjectsV2(minioBucket, `${this.containerFolderName}/${programFolderName}`, true);
                let latestModifiedTime = new Date(0);
                for await (const obj of objects) {
                    if (obj.lastModified > latestModifiedTime) {
                        latestModifiedTime = obj.lastModified;
                        return { code: 200, response: latestModifiedTime }
                    }
                }
                if (latestModifiedTime > latestModifiedTime) {
                    return { code: 200, response: latestModifiedTime };
                }
                else {
                    return { code: 400, error: "No data found" }
                }
            } 
            else if (this.storageType == 'azure') {
                    const connectionString = this.configService.get<string>('AZURE_CONNECTION_STRING');
                const containerName = this.configService.get<string>('AZURE_CONTAINER');
                const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
                const containerClient = blobServiceClient.getContainerClient(containerName);

                const blobs = containerClient.listBlobsFlat({ prefix: `${this.containerFolderName}/${programFolderName}` });
                let latestDate: Date | null = null;
                for await (const blob of blobs) {
                    if (blob.properties.lastModified) {
                        const blobDate = new Date(blob.properties.lastModified);
                        if (!latestDate || blobDate > latestDate) {
                            latestDate = blobDate;
                            return { code: 200, response: latestDate }
                        }
                    }
                }
                if (latestDate) {
                    return { code: 200, response: latestDate }
                } 
                else {
                    return { code: 400, error: "No data found" }
                } 
            }
            else {
                return {
                    code: 400,
                    error: "No Storage Found "
                }
            }
        }
        catch (error) {
            console.error('impl.UpdatedDateService.error', error.message);
            return {
                code: 400,
                error: error.message
            }
        }

    }

}
