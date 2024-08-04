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
import { Payment, PaymentsController } from "../data-access/PaymentsController";
import { GermanPayPalCSVParser } from "../payment-parsers/GermanPayPalCSVParser";
import { IdentitiesController } from "../data-access/IdentitiesController";
import { ParsedPayment } from "../payment-parsers/ParsedPayment";

@Injectable
export class PaymentsImportService
{
    constructor(private paymentsController: PaymentsController, private identitiesController: IdentitiesController)
    {
    }

    //Public methods
    public async ImportPayments(paymentServiceId: number, paymentsData: Buffer)
    {
        const type = await this.paymentsController.QueryServiceType(paymentServiceId);
        const paymentsParser = this.CreatePaymentsParser(type);
        const parsedPayments = await paymentsParser.Parse(paymentsData);

        for (const parsedPayment of parsedPayments)
        {
            this.ValidatePayment(parsedPayment);

            const foundPayment = await this.paymentsController.FindPayment(paymentServiceId, parsedPayment.transactionId);
            if(foundPayment === undefined)
                await this.AddPayment(paymentServiceId, parsedPayment);
            else
                await this.MergePayments(foundPayment, parsedPayment)
        }
    }

    //Private methods
    private async AddPayment(paymentServiceId: number, payment: ParsedPayment)
    {
        let senderId = await this.identitiesController.FindIdentity(paymentServiceId, payment.senderId);
        if(senderId === undefined)
        {
            senderId = await this.identitiesController.CreateIdentity(payment.senderId);
            await this.identitiesController.AddPaymentAccount(senderId, paymentServiceId, payment.senderId);
        }

        await this.paymentsController.AddPayment({
            currency: payment.currency,
            externalTransactionId: payment.transactionId,
            grossAmount: payment.grossAmount,
            paymentServiceId,
            senderId,
            timestamp: payment.timeStamp,
            transactionFee: payment.transactionFee
        });
    }

    private CreatePaymentsParser(type: string)
    {
        switch(type)
        {
            case "paypal":
                return new GermanPayPalCSVParser;
            default:
                throw new Error("Unknown payment service type: " + type);
        }
    }

    private async MergePayments(existingPayment: Payment, parsedPayment: ParsedPayment)
    {
        const sender = await this.identitiesController.QueryIdentity(existingPayment.senderId);
        
        const existingAsParsed: ParsedPayment = {
            currency: existingPayment.currency,
            timeStamp: existingPayment.timestamp,
            grossAmount: existingPayment.grossAmount,
            senderId: sender?.paymentAccounts.find(x => x.paymentServiceId === existingPayment.paymentServiceId)?.externalAccount ?? "",
            transactionFee: existingPayment.transactionFee,
            transactionId: existingPayment.externalTransactionId
        };
        if(!existingAsParsed.Equals(parsedPayment))
            throw new Error("TODO: not implemented");
    }

    private ValidatePayment(payment: ParsedPayment)
    {
        if(payment.senderId.trim().length === 0)
            throw new Error("Payment " + payment.transactionId + " does not contain a valid sender");
    }
}