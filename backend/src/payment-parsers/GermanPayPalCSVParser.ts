/**
 * OpenAccounting
 * Copyright (C) 2024 Amir Czwink (amir130@hotmail.de)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * */
import * as csv from "fast-csv";
import { Readable } from 'stream';
import { ParsedPayment } from "./ParsedPayment";
import moment from "moment-timezone";

export class GermanPayPalCSVParser
{
    //Public methods
    public async Parse(paymentsData: Buffer)
    {
        const stream = this.BufferToStream(paymentsData);
        const rows = await this.ParseCSVData(stream);

        const payments: ParsedPayment[] = [];

        for (const row of rows)
        {
            const date = this.ExtractField(row, "Datum", "string");
            const dateParts = date.split(".");
            const reorderedDate = dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0];
            const time = this.ExtractField(row, "Uhrzeit", "string");
            const timeZone = this.ExtractField(row, "Zeitzone", "string");

            const converted = moment.tz(reorderedDate + "T" + time, timeZone).utc();
            const timeStamp = new Date(converted.toISOString());

            payments.push({
                currency: this.ExtractField(row, "Währung", "string"),
                timeStamp: new Date(timeStamp),
                grossAmount: this.ExtractField(row, "Brutto", "german-decimal"),
                transactionFee: this.ExtractField(row, "Entgelt", "german-decimal"),
                senderId: this.ExtractField(row, "Absender E-Mail-Adresse", "string"),
                transactionId: this.ExtractField(row, "Transaktionscode", "string")
            });
        }

        return payments;
    }

    //Private methods
    private BufferToStream(buffer: Buffer)
    {
        const readable = new Readable();
        readable._read = () => {};
        readable.push(buffer);
        readable.push(null);

        return readable;
    }

    private ExtractDateField(row: any, column: string, format: "DD.MM.YYYY")
    {
        const stringValue = this.ExtractField(row, column, "string");
        switch(format)
        {
            case "DD.MM.YYYY":
            {
                const parts = stringValue.split(".").map(x => parseInt(x));
                return {
                    day: parts[0],
                    month: parts[1],
                    year: parts[2]
                };
            }
        }
    }

    private ExtractField(row: any, column: string, format: "german-decimal" | "string")
    {
        const stringValue = row[column] as string;
        switch(format)
        {
            case "german-decimal":
                return stringValue.split(",").join(".");
            case "string":
                return stringValue;
        }
    }

    private async ParseCSVData(stream: Readable)
    {
        return new Promise<any[]>( (resolve, reject) => {
            const rows: any[] = [];
            stream
            .pipe(csv.parse({ headers: true }))
            .on('error', reject)
            .on('data', row => rows.push(row))
            .on('end', () => resolve(rows));
        });
    };
}