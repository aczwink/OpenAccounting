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
import { PaymentLink, PaymentsController } from "../data-access/PaymentsController";
import { ItemsController } from "../data-access/ItemsController";
import { Money } from "@dintero/money";

@Injectable
export class PaymentAssociationService
{
    constructor(private paymentsController: PaymentsController, private itemsController: ItemsController)
    {
    }

    //Public methods
    public async AssociateWithPayment(paymentId: number, link: PaymentLink)
    {
        await this.paymentsController.CreatePaymentLink(paymentId, link);

        await this.CheckOpenPaymentStatus(paymentId);
        await this.CheckOpenPaymentStatus(link.paymentId);
    }

    public async AssociateWithItem(paymentId: number, itemId: number)
    {
        await this.paymentsController.AddItemAssociation(paymentId, itemId);
        await this.itemsController.RemoveItemFromOpenItemsList(itemId);

        await this.CheckOpenPaymentStatus(paymentId);
    }

    //Private methods
    private async CheckOpenPaymentStatus(paymentId: number)
    {
        const payment = await this.paymentsController.QueryPayment(paymentId);
        if(payment === undefined)
            throw new Error("should never happen1");

        const itemIds = await this.paymentsController.QueryAssociatedItems(paymentId);
        const linked = await this.paymentsController.QueryPaymentLinks(paymentId, "outgoing");

        const amount = Money.of(payment.grossAmount, payment.currency);
        let sum = amount;
        for (const itemId of itemIds)
        {
            const item = await this.itemsController.QueryItem(itemId);
            if(item === undefined)
                throw new Error("should never happen2");

            const itemAmount = Money.of(item.amount, item.currency);
            sum = sum.subtract(itemAmount);
        }

        for (const link of linked)
        {
            const linkedPayment = await this.paymentsController.QueryPayment(link.paymentId);
            if(linkedPayment === undefined)
                throw new Error("should never happen3");

            const linkedAmount = Money.of(link.amount, linkedPayment.currency);
            sum = sum.subtract(linkedAmount);
        }

        if(sum.isZero())
        {
            await this.paymentsController.RemovePaymentFromOpenPaymentsList(paymentId);
        }
    }
}