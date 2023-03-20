import { Body, Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { DatabaseService } from './database/database.service';
import {Response} from 'express';
import { MetricCsvService } from './services/metric-csv/metric-csv.service';
import { JwtGuard } from './guards/jwt.guard';
import * as jwt from 'jsonwebtoken';
import { UpdatedDateService } from './services/updated-date/updated-date.service';


@Controller()
export class AppController {
    constructor(private readonly appService: AppService, private databaseService: DatabaseService, private metricService: MetricCsvService,
        private updatesDate:UpdatedDateService) {
    }

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Get('generatejwt')
    testJwt( @Res() res: Response):any {
        let jwtSecretKey = process.env.JWT_SECRET;
        let data = {
            time: Date(),
        }
        try{
        const token: string = jwt.sign(data, jwtSecretKey);
        if(token){
            res.status(200).send({token: token});
        }
        else{
            res.status(400).send("Could not generate token");
        }

        }catch(error){
            res.status(400).send("Error Ocurred");
        }

    }

    @Post('/query')
    @UseGuards(JwtGuard)
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
    @UseGuards(JwtGuard)
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

//     @Get('lastModified')
//   async getLastModified(): Promise<Date> {
//     return this.s3Service.getLastModified();
//   }


  @Get('lastmodified')
  async getFileStatus(@Query() query: any, @Res()response: Response) {
      try {
          let result: any = await this.updatesDate.getLastModified(query);
          if (result.code == 400) {
              response.status(400).send({"message": result.error});
          } else {
              response.status(200).send({"fileMetaData": result.response});
          }
      }
      catch (e) {
          console.error('get-filestatus-impl: ', e.message);
          throw new Error(e);
    }
  }
}
