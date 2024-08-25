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
import { Payment, PaymentType, PaymentsController } from "../data-access/PaymentsController";
import { GermanActivityPayPalCSVParser } from "../payment-parsers/GermanActivityPayPalCSVParser";
import { IdentitiesController } from "../data-access/IdentitiesController";
import { ParsedPayment } from "../payment-parsers/ParsedPayment";
import { AccountingMonthService } from "./AccountingMonthService";

interface ImportResult
{
    invalid: string[];
    imported: number;
    found: number;
}

export interface ManualPaymentCreationData
{
    currency: string;
    grossAmount: string;
    note: string;
    paymentServiceId: number;
    receiverId: number;
    senderId: number;
    timestamp: DateTime;
    type: PaymentType;
}

@Injectable
export class PaymentsImportService
{
    constructor(private paymentsController: PaymentsController, private identitiesController: IdentitiesController, private accountingMonthService: AccountingMonthService)
    {
    }

    //Public methods
    public async CreatePayment(paymentData: ManualPaymentCreationData)
    {
        const service = await this.paymentsController.QueryService(paymentData.paymentServiceId);
        if(service.type !== "cash")
            throw new Error("Can only create manual payments for cash payments");

        const { year, month } = await this.accountingMonthService.FindAccountingMonth(paymentData.timestamp);
        const range = await this.accountingMonthService.CalculateUTCRangeOfAccountingMonth(year, month);
        const count = await this.paymentsController.QueryPaymentsCountForServiceInRange(paymentData.paymentServiceId, range.inclusiveStart, range.inclusiveEnd)
        console.log({ count });
        throw new Error("why the fuck is the count not of type str?");

        const transactionId = this.FormatCashTransactionId(year, month, count);

        return await this.paymentsController.CreatePayment({
            currency: paymentData.currency,
            externalTransactionId: transactionId,
            grossAmount: paymentData.grossAmount,
            note: paymentData.note,
            paymentServiceId: paymentData.paymentServiceId,
            receiverId: paymentData.receiverId,
            senderId: paymentData.senderId,
            timestamp: paymentData.timestamp,
            transactionFee: "0",
            type: paymentData.type
        });
    }

    public async ImportPayments(paymentServiceId: number, paymentsData: Buffer)
    {
        const result: ImportResult = {
            invalid: [],
            imported: 0,
            found: 0
        };

        const service = await this.paymentsController.QueryService(paymentServiceId);
        const paymentsParser = this.CreatePaymentsParser(service.type);
        const parsedPayments = await paymentsParser.Parse(paymentsData);

        for (const parsedPayment of parsedPayments)
        {
            const validationResult = this.ValidatePayment(parsedPayment);
            if(validationResult !== undefined)
            {
                result.invalid.push(validationResult);
                continue;
            }

            const foundPayment = await this.paymentsController.FindPayment(paymentServiceId, parsedPayment.transactionId);
            if(foundPayment === undefined)
            {
                await this.AddPayment(paymentServiceId, parsedPayment);
                result.imported++;
            }
            else
            {
                await this.MergePayments(foundPayment, parsedPayment);
                result.found++;
            }
        }

        return result;
    }

    //Private methods
    private async AddPayment(paymentServiceId: number, payment: ParsedPayment)
    {
        let senderId = await this.identitiesController.FindIdentity(paymentServiceId, payment.senderId);
        if(senderId === undefined)
        {
            senderId = await this.identitiesController.CreateIdentity(payment.senderName || payment.senderId);
            await this.identitiesController.AddPaymentAccount(senderId, paymentServiceId, payment.senderId);
        }

        let receiverId = await this.identitiesController.FindIdentity(paymentServiceId, payment.receiverId);
        if(receiverId === undefined)
        {
            receiverId = await this.identitiesController.CreateIdentity(payment.receiverName || payment.receiverId);
            await this.identitiesController.AddPaymentAccount(receiverId, paymentServiceId, payment.receiverId);
        }

        await this.paymentsController.CreatePayment({
            type: payment.type,
            currency: payment.currency,
            externalTransactionId: payment.transactionId,
            grossAmount: payment.grossAmount,
            paymentServiceId,
            receiverId: receiverId,
            senderId: senderId,
            timestamp: payment.timeStamp,
            transactionFee: payment.transactionFee,
            note: payment.note
        });
    }

    private CreatePaymentsParser(type: string)
    {
        switch(type)
        {
            case "paypal":
                return new GermanActivityPayPalCSVParser;
            default:
                throw new Error("Unknown payment service type: " + type);
        }
    }

    private FormatCashTransactionId(year: number, month: number, counter: number)
    {
        const monthStr = (month < 10) ? ("0" + month) : month.toString();
        const nr = counter + 1;
        const nrStr = nr.toString();
        return year + monthStr + "-" + nrStr;
    }

    private async MergePayments(existingPayment: Payment, parsedPayment: ParsedPayment)
    {
        const receiver = await this.identitiesController.QueryIdentity(existingPayment.receiverId);
        const sender = await this.identitiesController.QueryIdentity(existingPayment.senderId);
        
        const existingAsParsed: ParsedPayment = {
            type: existingPayment.type,
            currency: existingPayment.currency,
            timeStamp: existingPayment.timestamp,
            grossAmount: existingPayment.grossAmount,
            receiverId: receiver?.paymentAccounts.find(x => x.paymentServiceId === existingPayment.paymentServiceId)?.externalAccount ?? "",
            senderId: sender?.paymentAccounts.find(x => x.paymentServiceId === existingPayment.paymentServiceId)?.externalAccount ?? "",
            transactionFee: existingPayment.transactionFee,
            transactionId: existingPayment.externalTransactionId,
            note: existingPayment.note,

            //unimportant
            senderName: parsedPayment.senderName,
            receiverName: parsedPayment.receiverName
        };
        if(!existingAsParsed.Equals(parsedPayment))
        {
            console.log(existingAsParsed, parsedPayment);
            throw new Error("TODO: not implemented");
        }
    }

    private ValidatePayment(payment: ParsedPayment)
    {
        if(payment.senderId.trim().length === 0)
            return "Payment " + payment.transactionId + " does not contain a valid sender";
        if(payment.type === PaymentType.Withdrawal)
            payment.receiverId = payment.senderId;
        else
        {
            if(payment.receiverId.trim().length === 0)
                return "Payment " + payment.transactionId + " does not contain a valid receiver";
        }
    }
}