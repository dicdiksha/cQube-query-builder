import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { DatabaseService } from './database/database.service';
import {Response} from 'express';
import { MetricCsvService } from './services/metric-csv/metric-csv.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService, private databaseService: DatabaseService, private metricService: MetricCsvService) {
    }

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Post('/query')
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
    async csvtoJson(@Res()response: Response) {
        try {
            let result = await this.metricService.convertCsvToJson();
            if (result.code == 400) {
                response.status(400).send({message: result.error});
            } else {
                response.status(200).send({message: result.message,data:result.response});
            }
        } catch (e) {
            console.error('ingestion.controller.csvtojson: ', e);
            response.status(400).send({message: e.error || e.message});
        }
    }
}
