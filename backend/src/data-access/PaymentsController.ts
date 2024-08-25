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

import { DateTime, Injectable } from "acts-util-node";
import { DatabaseController } from "./DatabaseController";
import { ManualPaymentCreationData } from "../services/PaymentsImportService";

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
    senderId: number;
    receiverId: number;
    timestamp: DateTime;
    grossAmount: string;
    transactionFee: string;
    currency: string;
    note: string;
}

export interface Payment extends PaymentCreationData
{
    id: number;
}

export enum PaymentLinkReason
{
    CashDeposit = 0
}

export interface PaymentLink
{
    paymentId: number;
    amount: string;
    reason: PaymentLinkReason;
}

interface PaymentService
{
    id: number;
    name: string;
}

export type PaymentServiceType = "cash" | "paypal";
interface FullPaymentServiceData extends PaymentService
{
    type: PaymentServiceType;
    externalAccount: string;
}

@Injectable
export class PaymentsController
{
    constructor(private dbController: DatabaseController)
    {
    }

    //Public methods
    public async AddItemAssociation(paymentId: number, itemId: number)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        await exector.InsertRow("payments_items", { paymentId, itemId });
    }

    public async CreatePayment(payment: PaymentCreationData)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const result = await exector.InsertRow("payments", payment);
        await exector.InsertRow("payments_open", { paymentId: result.insertId });
        return result.insertId;
    }

    public async CreatePaymentLink(paymentId: number, link: PaymentLink)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        await exector.InsertRow("payments_links", {
            paymentId,
            linkedPaymentId: link.paymentId,
            amount: link.amount,
            reason: link.reason
        });
    }

    public async UpdatePayment(paymentId: number, paymentData: ManualPaymentCreationData)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        await exector.UpdateRows("payments", paymentData, "id = ?", paymentId);
    }

    public async FindPayment(paymentServiceId: number, externalTransactionId: string)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const row = await exector.SelectOne<Payment>("SELECT * FROM payments WHERE paymentServiceId = ? AND externalTransactionId = ?", paymentServiceId, externalTransactionId);
        return row;
    }

    public async QueryAssociatedItems(paymentId: number)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const rows = await exector.Select("SELECT itemId FROM payments_items WHERE paymentId = ?", paymentId);
        return rows.map(x => x.itemId as number);
    }

    public async QueryPayment(paymentId: number)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const row = await exector.SelectOne<Payment>("SELECT * FROM payments WHERE id = ?", paymentId);
        return row;
    }

    public async QueryPaymentLinks(paymentId: number, direction: "outgoing" | "incoming")
    {
        const columns = ["paymentId", "linkedPaymentId"];
        const filterColumn = direction === "outgoing" ? columns[0] : columns[1];
        const queryColumn = direction === "outgoing" ? columns[1] : columns[0];

        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const rows = await exector.Select<PaymentLink>("SELECT reason, amount, " + queryColumn + " AS paymentId FROM payments_links WHERE " + filterColumn + " = ?", paymentId);
        return rows;
    }

    public async QueryPaymentsCountForServiceInRange(paymentServiceId: number, inclusiveStart: DateTime, inclusiveEnd: DateTime)
    {
        const query = `
        SELECT COUNT(*) AS cnt
        FROM payments
        WHERE paymentServiceId = ?
        AND timestamp >= ? AND timestamp <= ?
        `;
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const row = await exector.SelectOne(query, paymentServiceId, inclusiveStart, inclusiveEnd);
        console.log(row);
        if(row === undefined)
            return 0;
        return parseInt(row.cnt);
    }

    public async QueryPaymentsInRange(inclusiveStart: DateTime, inclusiveEnd: DateTime)
    {
        const query = `
        SELECT * FROM payments
        WHERE timestamp >= ? AND timestamp <= ?
        ORDER BY timestamp ASC
        `;

        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const rows = await exector.Select<Payment>(query, inclusiveStart, inclusiveEnd);
        return rows;
    }

    public async QueryNonOpenPayments()
    {
        const query = `
        SELECT * FROM payments p
        LEFT JOIN payments_open po
        ON po.paymentId = p.id
        WHERE po.paymentId IS NULL
        `;
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const rows = await exector.Select<Payment>(query);
        return rows;
    }

    public async QueryOpenPayments()
    {
        const query = `
        SELECT p.*
        FROM payments p
        INNER JOIN payments_open po
            ON po.paymentId = p.id
        ORDER BY p.timestamp ASC
        LIMIT 50
        `;
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const rows = await exector.Select<Payment>(query);
        return rows;
    }

    public async QueryServices(type?: PaymentServiceType)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        if(type === undefined)
        {
            return exector.Select<PaymentService>("SELECT id, name FROM paymentServices");
        }
        return exector.Select<PaymentService>("SELECT id, name FROM paymentServices WHERE type = ?", type);
    }

    public async QueryService(paymentServiceId: number)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const row = await exector.SelectOne<FullPaymentServiceData>("SELECT * FROM paymentServices WHERE id = ?", paymentServiceId);
        return row!;
    }

    public async RemovePaymentFromOpenPaymentsList(paymentId: number)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        await exector.DeleteRows("payments_open", "paymentId = ?", paymentId);
    }
}