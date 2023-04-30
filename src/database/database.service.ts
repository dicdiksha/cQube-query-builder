import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
const mappings = require('../maps/table_names.json')
@Injectable()
export class DatabaseService {
    private readonly logger = new Logger(DatabaseService.name);

    constructor(@Inject('DATABASE_POOL') private pool: Pool) {
    }

    preprocessQuery(queryText: string): string {
        let result = queryText
        const extendedNames = Object.keys(mappings);
        if (extendedNames.some(tableName => new RegExp(`\\b${tableName}\\b`, 'i').test(queryText))) {
            extendedNames.forEach(extendedName => result = result.replace(new RegExp(extendedName, 'gi'), mappings[extendedName]))
        }

        return result;
    }

    executeQuery(queryText: string, values: any[] = []): Promise<any[]> {
        // pre processing query here
        const preprocessedQuery = this.preprocessQuery(queryText);
        this.logger.debug(`Executing query: ${preprocessedQuery} (${values})`);
        return this.pool.query(preprocessedQuery, values).then((result: QueryResult) => {
            return result.rows;
        });
    }
}