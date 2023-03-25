import { Injectable } from '@nestjs/common';
import * as csv from 'csvtojson';
import * as fs from 'fs';

@Injectable()
export class MetricCsvService {

    async convertCsvToJson() {
        try {
            const checkFile = fs.existsSync("./main_metrics.csv")
            const checkFile1 = fs.existsSync("./program_selector.csv")
            if (checkFile && checkFile1) {
                const filePath = 'main_metrics.csv';
                const filePath1 = 'program_selector.csv';
                const stream = fs.createReadStream(filePath);
                const stream1 = fs.createReadStream(filePath1);
                const jsonArray = await csv().fromStream(stream);
                const jsonArray1 = await csv().fromStream(stream1);
                let data = [];
                jsonArray1.forEach((row: any) => {
                    if (row['status'] == 'true') {
                        jsonArray.forEach((data1: any) => {
                            if (row['program_id'] == data1['Program Id']) {
                                let  temp = {
                                    programName: data1['Program Name'],
                                    tooltip: data1['Program Information'],
                                    navigationUrl: data1['Navigation URL'],
                                    imageUrl: data1['Image URL'],
                                    programID: data1['Program Id'],
                                    orderBy: data1['Sequence Number']
                                }
                                data.push(temp)
                            }
                        })
                    }
                });
                data.sort((a, b) => a.orderBy - b.orderBy);
                return {
                    code: 200,
                    message: 'Metric data returned successfully',
                    response: data
                };
            }
            else {
                return { code: 400, error: 'main_metrics.csv File not found' }
            }

        } catch (error) {
            console.log('csvToJson', error.message);
            return {
                "code": 400, "error": error.message
            }
        }
    }
}
