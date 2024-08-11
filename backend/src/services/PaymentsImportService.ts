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
import { GermanActivityPayPalCSVParser } from "../payment-parsers/GermanActivityPayPalCSVParser";
import { IdentitiesController } from "../data-access/IdentitiesController";
import { ParsedPayment } from "../payment-parsers/ParsedPayment";

interface ImportResult
{
    invalid: string[];
    imported: number;
    found: number;
}

@Injectable
export class PaymentsImportService
{
    constructor(private paymentsController: PaymentsController, private identitiesController: IdentitiesController)
    {
    }

    //Public methods
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
        let identityId = await this.identitiesController.FindIdentity(paymentServiceId, payment.participantId);
        if(identityId === undefined)
        {
            identityId = await this.identitiesController.CreateIdentity(payment.participantName || payment.participantId);
            await this.identitiesController.AddPaymentAccount(identityId, paymentServiceId, payment.participantId);
        }

        await this.paymentsController.AddPayment({
            type: payment.type,
            currency: payment.currency,
            externalTransactionId: payment.transactionId,
            grossAmount: payment.grossAmount,
            paymentServiceId,
            identityId: identityId,
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

    private async MergePayments(existingPayment: Payment, parsedPayment: ParsedPayment)
    {
        const sender = await this.identitiesController.QueryIdentity(existingPayment.identityId);
        
        const existingAsParsed: ParsedPayment = {
            type: existingPayment.type,
            currency: existingPayment.currency,
            timeStamp: existingPayment.timestamp,
            grossAmount: existingPayment.grossAmount,
            participantId: sender?.paymentAccounts.find(x => x.paymentServiceId === existingPayment.paymentServiceId)?.externalAccount ?? "",
            transactionFee: existingPayment.transactionFee,
            transactionId: existingPayment.externalTransactionId,
            note: existingPayment.note,

            //unimportant
            participantName: parsedPayment.participantName
        };
        if(!existingAsParsed.Equals(parsedPayment))
        {
            console.log(existingAsParsed, parsedPayment);
            throw new Error("TODO: not implemented");
        }
    }

    private ValidatePayment(payment: ParsedPayment)
    {
        if(payment.participantId.trim().length === 0)
            return "Payment " + payment.transactionId + " does not contain a valid sender/receiver";
    }
}