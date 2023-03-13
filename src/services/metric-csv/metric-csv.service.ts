import { Injectable } from '@nestjs/common';
import * as csv from 'csvtojson';
import * as fs from 'fs';

@Injectable()
export class MetricCsvService {

    async convertCsvToJson() {
        try {
            const checkFile = fs.existsSync("./main_metrics.csv")
            if (checkFile) {
                const filePath = 'main_metrics.csv';
                const stream = fs.createReadStream(filePath);
                const jsonArray = await csv().fromStream(stream);
                jsonArray.sort((a, b) => a['Sequence Number'] - b['Sequence Number']);
                let data = []
                jsonArray.forEach((row: any) => {
                    if (row['Show'] == 'TRUE') {
                        let temp = {
                            programName: row['Program Name'],
                            tooltip: row['Program Information'],
                            navigationUrl: row['Navigation URL'],
                            imageUrl: row['Image URL'],
                            menuName: row['Menu Name'],
                            programID:row['Program Id']
                        }
                        data.push(temp)
                    }
                });
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
