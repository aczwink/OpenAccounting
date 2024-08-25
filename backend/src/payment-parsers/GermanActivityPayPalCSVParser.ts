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
import { PaymentType } from "../data-access/PaymentsController";
import { DateTime } from "acts-util-node";

export class GermanActivityPayPalCSVParser
{
    //Public methods
    public async Parse(paymentsData: Buffer)
    {
        const stream = this.BufferToStream(paymentsData);
        const rows = await this.ParseCSVData(stream);
        const filteredRows = rows.filter(x =>
            //skip transactions that paypal withhold (assumption: they are released later anyways)
            (this.ExtractField(x, "Typ", "string") !== "Allgemeine Einbehaltung")
            &&
            (this.ExtractField(x, "Typ", "string") !== "Freigabe allgemeiner Einbehaltung")
            &&
            //see https://developer.paypal.com/docs/reports/online-reports/activity-download/ and https://www.paypalobjects.com/webstatic/en_US/developer/docs/pdf/archive/PP_OrderMgmt_IntegrationGuide.pdf
            //memo entries have no effect on balance since they are never completed transactions
            (this.ExtractField(x, "Auswirkung auf Guthaben", "string") !== "Memo")
        );

        const payments: ParsedPayment[] = [];

        for (const row of filteredRows)
        {
            const date = this.ExtractField(row, "Datum", "string");
            const dateParts = date.split(".").map(x => parseInt(x));
            const time = this.ExtractField(row, "Uhrzeit", "string");
            const timeParts = time.split(":").map(x => parseInt(x));
            const timeZone = this.ExtractField(row, "Zeitzone", "string");

            const timeStamp = DateTime.Construct(dateParts[2], dateParts[1], dateParts[0], timeParts[0], timeParts[1], timeParts[2], timeZone);

            const type = (this.ExtractField(row, "Typ", "string") === "Allgemeine Abbuchung") ? PaymentType.Withdrawal : PaymentType.Normal;

            const isInbound = this.ExtractField(row, "Auswirkung auf Guthaben", "string") === "Haben";
            const nameIsSender = isInbound || (type === PaymentType.Withdrawal);

            const name = this.ExtractField(row, "Name", "string")
            payments.push({
                type,
                currency: this.ExtractField(row, "Währung", "string"),
                timeStamp,
                grossAmount: this.ExtractField(row, "Brutto", "german-decimal"),
                transactionFee: this.ExtractField(row, "Gebühr", "german-decimal"),
                senderId: this.ExtractField(row, "Absender E-Mail-Adresse", "string"),
                receiverId: this.ExtractField(row, "Empfänger E-Mail-Adresse", "string"),
                senderName: nameIsSender ? name : "",
                receiverName: !nameIsSender ? name : "",
                transactionId: this.ExtractField(row, "Transaktionscode", "string"),
                note: this.ExtractField(row, "Hinweis", "string")
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

    private ExtractField(row: any, column: string, format: "german-decimal" | "string")
    {
        const stringValue = row[column] as string;
        switch(format)
        {
            case "german-decimal":
                return stringValue.split(",").map(x => x.ReplaceAll(".", "")).join(".");
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