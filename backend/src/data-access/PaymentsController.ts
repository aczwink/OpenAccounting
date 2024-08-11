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

export enum PaymentType
{
    Normal = 0,
    Withdrawal = 1
}

interface PaymentCreationData
{
    type: PaymentType;
    paymentServiceId: number;
    externalTransactionId: string;
    identityId: number;
    timestamp: Date;
    grossAmount: string;
    transactionFee: string;
    currency: string;
    note: string;
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

interface FullPaymentServiceData extends PaymentService
{
    type: string;
    externalAccount: string;
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

        return this.MapPayment(row);
    }

    public async QueryPayments(month: number, year: number)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const rows = await exector.Select("SELECT * FROM payments WHERE YEAR(timestamp) = ? AND MONTH(timestamp) = ?", year, month);
        return this.MapPayments(rows);
    }

    public async QueryOpenPayments()
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const rows = await exector.Select("SELECT p.* FROM payments p INNER JOIN payments_open po ON po.paymentId = p.id");
        return this.MapPayments(rows);
    }

    public async QueryServices()
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        return exector.Select<PaymentService>("SELECT id, name FROM paymentServices");
    }

    public async QueryService(paymentServiceId: number)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const row = await exector.SelectOne<FullPaymentServiceData>("SELECT * FROM paymentServices WHERE id = ?", paymentServiceId);
        return row!;
    }

    //Private methods
    private MapPayment(row: any)
    {
        const result: Payment = {
            type: row.type,
            currency: row.currency,
            externalTransactionId: row.externalTransactionId,
            grossAmount: row.grossAmount,
            id: row.id,
            paymentServiceId: row.paymentServiceId,
            identityId: row.identityId,
            timestamp: this.dbController.ParseDateTime(row.timestamp),
            transactionFee: row.transactionFee,
            note: row.note
        };

        return result;
    }

    private MapPayments(rows: any[])
    {
        return rows.map(this.MapPayment.bind(this));
    }
}