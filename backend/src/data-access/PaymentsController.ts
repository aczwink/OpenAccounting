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

import { Injectable } from "acts-util-node";
import { DatabaseController } from "./DatabaseController";

interface PaymentCreationData
{
    paymentServiceId: number;
    externalTransactionId: string;
    senderId: number;
    timestamp: Date;
    grossAmount: string;
    transactionFee: string;
    currency: string;
}

export interface Payment extends PaymentCreationData
{
    id: number;
}

interface PaymentService
{
    id: number;
    name: string;
}

@Injectable
export class PaymentsController
{
    constructor(private dbController: DatabaseController)
    {
    }

    //Public methods
    public async AddPayment(payment: PaymentCreationData)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const result = await exector.InsertRow("payments", payment);
        await exector.InsertRow("payments_open", { paymentId: result.insertId });
        return result.insertId;
    }

    public async FindPayment(paymentServiceId: number, externalTransactionId: string)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const row = await exector.SelectOne("SELECT * FROM payments WHERE paymentServiceId = ? AND externalTransactionId = ?", paymentServiceId, externalTransactionId);
        if(row === undefined)
            return undefined;

        const result: Payment = {
            currency: row.currency,
            externalTransactionId: row.externalTransactionId,
            grossAmount: row.grossAmount,
            id: row.id,
            paymentServiceId: row.paymentServiceId,
            senderId: row.senderId,
            timestamp: this.dbController.ParseDateTime(row.timestamp),
            transactionFee: row.transactionFee
        };

        return result;
    }

    public async QueryServices()
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        return exector.Select<PaymentService>("SELECT id, name FROM paymentServices");
    }

    public async QueryServiceType(paymentServiceId: number)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const row = await exector.SelectOne("SELECT type FROM paymentServices WHERE id = ?", paymentServiceId);
        return row?.type as string;
    }
}