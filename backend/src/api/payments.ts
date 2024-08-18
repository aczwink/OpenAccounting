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

import { APIController, BodyProp, FormField, Get, NotFound, Path, Post, Query } from "acts-util-apilib";
import { Payment, PaymentsController } from "../data-access/PaymentsController";
import { PaymentsImportService } from "../services/PaymentsImportService";
import { UploadedFile } from "acts-util-node/dist/http/UploadedFile";
import { Money } from "@dintero/money";
import { PaymentAssociationService } from "../services/PaymentAssociationService";
import { ItemsController } from "../data-access/ItemsController";

interface PaymentDTO extends Payment
{
    netAmount: string;
}

@APIController("payments")
class _api_
{
    constructor(private paymentsController: PaymentsController, private paymentsImportService: PaymentsImportService, private paymentAssociationService: PaymentAssociationService, private itemsController: ItemsController)
    {
    }

    @Get()
    public async RequestPayments(
        @Query month: number,
        @Query year: number
    )
    {
        const payments = await this.paymentsController.QueryPayments(month, year);
        return this.MapPayments(payments);
    }

    @Post()
    public async ImportPayments(
        @Query paymentServiceId: number,
        @FormField paymentsData: UploadedFile
    )
    {
        return await this.paymentsImportService.ImportPayments(paymentServiceId, paymentsData.buffer);
    }

    @Get("open")
    public async RequestOpenPayments()
    {
        const payments = await this.paymentsController.QueryOpenPayments();
        return this.MapPayments(payments);
    }

    @Get("services")
    public async RequestPaymentServices()
    {
        return this.paymentsController.QueryServices();
    }

    @Get("services/{serviceId}")
    public async RequestPaymentService(
        @Path serviceId: number
    )
    {
        return this.paymentsController.QueryService(serviceId);
    }

    @Get("details/{paymentId}")
    public async RequestPayment(
        @Path paymentId: number
    )
    {
        const payment = await this.paymentsController.QueryPayment(paymentId);
        if(payment === undefined)
            return NotFound("payment does not exist");
        return this.MapPayment(payment);
    }

    @Get("items/{paymentId}")
    public async RequestAssociatedItems(
        @Path paymentId: number,
    )
    {
        const itemIds = await this.paymentsController.QueryAssociatedItems(paymentId);
        const items = itemIds.Values().Map(async x => {
            const item = await this.itemsController.QueryItem(x);
            return item!;
        }).PromiseAll();
        return items;
    }

    @Post("items/{paymentId}")
    public async AssociatePayment(
        @Path paymentId: number,
        @BodyProp itemId: number
    )
    {
        await this.paymentAssociationService.Associate(paymentId, itemId);
    }

    //Private methods
    private MapPayment(payment: Payment): PaymentDTO
    {
        return {
            netAmount: Money.of(payment.grossAmount, payment.currency).add(Money.of(payment.transactionFee, payment.currency)).toString(),
            ...payment
        };
    }

    private MapPayments(payments: Payment[])
    {
        return payments.map(this.MapPayment.bind(this));
    }
}