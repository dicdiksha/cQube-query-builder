import { Body, Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { DatabaseService } from './database/database.service';
import { Response } from 'express';
import { MetricCsvService } from './services/metric-csv/metric-csv.service';
import * as jwt from 'jsonwebtoken';
import { UpdatedDateService } from './services/updated-date/updated-date.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Public } from 'nest-keycloak-connect';


@Controller()
export class AppController {
    constructor(private readonly appService: AppService, private databaseService: DatabaseService, private metricService: MetricCsvService,
        private updatesDate: UpdatedDateService, private configService: ConfigService, private httpService: HttpService) {
    }

    @Get()
    @Public()
    getHello(): string {
        return this.appService.getHello();
    }

    @Get('generatejwt')
    @Public()
    testJwt(@Res() res: Response): any {
        let jwtSecretKey = process.env.JWT_SECRET;
        let data = {
            time: Date(),
        }
        try {
            const token: string = jwt.sign(data, jwtSecretKey);
            if (token) {
                res.status(200).send({ token: token });
            }
            else {
                res.status(400).send("Could not generate token");
            }

        } catch (error) {
            res.status(400).send("Error Ocurred");
        }

    }

    @Post('/query')
    @Public()
    async executeQuery(@Body() body: any, @Res() response: Response) {
        try {
            let result = await this.databaseService.executeQuery(body?.query);
            response.status(200).send(result)
        }
        catch (e) {
            console.error('execute-query-impl: ', e.message);
            response.status(500).send("Error running SQL query: " + e.message)
            throw new Error(e);
        }
    }

    @Get('/metric')
    @Public()
    async csvtoJson(@Res() response: Response) {
        try {
            let result = await this.metricService.convertCsvToJson();
            if (result.code == 400) {
                response.status(400).send({ message: result.error });
            } else {
                response.status(200).send({ message: result.message, data: result.response });
            }
        } catch (e) {
            console.error('ingestion.controller.csvtojson: ', e);
            response.status(400).send({ message: e.error || e.message });
        }
    }

    //     @Get('lastModified')
    //   async getLastModified(): Promise<Date> {
    //     return this.s3Service.getLastModified();
    //   }


    @Get('lastmodified')
    @Public()
    async getFileStatus(@Query() query: any, @Res() response: Response) {
        try {
            let result: any = await this.updatesDate.getLastModified(query);
            if (result.code == 400) {
                response.status(400).send({ "message": result.error });
            } else {
                response.status(200).send({ "fileMetaData": result.response });
            }
        }
        catch (e) {
            console.error('get-filestatus-impl: ', e.message);
            throw new Error(e);
        }
    }


    @Post('login')
    @Public()
    async login(@Body() inputData: any, @Res() response: Response): Promise<any> {
        const keyClockurl = this.configService.get<String>('KEY_CLOCK_URL');
        const realm = this.configService.get<String>('REALM');
        const client_id = this.configService.get<string>('KEY_CLOAK_CLIENT_ID');
        const client_secret = this.configService.get<string>('KEY_CLOAK_SECRET');
        const username = inputData.username;
        const password = inputData.password;
        try {
            if (username && password) {
                // let payload = {
                //     client_id: client_id, client_secret: client_secret, grant_type: 'password', username: username, password: password
                // }
                let payload = `client_id=${client_id}&client_secret=${client_secret}&grant_type=password&username=${username}&password=${password}`

                const headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                };
                const config: any = { headers };
                const URL = `${keyClockurl}/realms/${realm}/protocol/openid-connect/token`;
                const result: any = await this.httpService.post(URL, payload, config).toPromise();
                if (result) {
                    response.status(200).send(result.data)
                }
                else {
                    response.status(401).send(result.data)
                }
                // this.httpService.post(URL, payload, { headers: headersRequest }).subscribe();
            }
            else {
                response.status(401)
            }
        } catch (error) {
            console.log('keyClock.impl.service', error.message);
            response.status(401).send({ error: error.message })
        }
    }

    @Post('refresh_token')
    @Public()
    async refreshToken(@Body() inputData: any, @Res() response: Response): Promise<any> {
        const keyClockurl = this.configService.get<String>('KEY_CLOCK_URL');
        const realm = this.configService.get<String>('REALM');
        const client_id = this.configService.get<string>('KEY_CLOAK_CLIENT_ID');
        const client_secret = this.configService.get<string>('KEY_CLOAK_SECRET');
        const refreshToken = inputData.refresh_token;
        try {
            let payload = `client_id=${client_id}&client_secret=${client_secret}&grant_type=refresh_token&refresh_token=${refreshToken}`
            let headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
            const URL = `${keyClockurl}/realms/${realm}/protocol/openid-connect/token`;
            const config: any = { headers };
            const result: any = await this.httpService.post(URL, payload, config).toPromise();
            if (result) {
                response.status(200).send(result.data)
            }
            else {
                response.status(401).send(result.data)
            }
        }
        catch (error) {
            console.log('keyClock.impl.service', error.message);
            response.status(401).send({ error: error.message })
        }

    }
}
