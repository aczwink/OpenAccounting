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

import { APIController, Body, BodyProp, FormField, Get, NotFound, Path, Post, Put, Query } from "acts-util-apilib";
import { Payment, PaymentLink, PaymentsController } from "../data-access/PaymentsController";
import { ManualPaymentCreationData, PaymentsImportService } from "../services/PaymentsImportService";
import { UploadedFile } from "acts-util-node/dist/http/UploadedFile";
import { PaymentAssociationService } from "../services/PaymentAssociationService";
import { ItemsController } from "../data-access/ItemsController";
import { FinanceService } from "../services/FinanceService";
import { Of } from "acts-util-core";
import { AccountingMonthService } from "../services/AccountingMonthService";

interface PaymentDTO extends Payment
{
    netAmount: string;
}

interface PaymentDetailsDTO extends PaymentDTO
{
    links: PaymentLink[];
    linked: PaymentLink[];
}

@APIController("payments")
class _api_
{
    constructor(private paymentsController: PaymentsController, private paymentsImportService: PaymentsImportService, private paymentAssociationService: PaymentAssociationService, private itemsController: ItemsController,
        private financeService: FinanceService, private accountingMonthService: AccountingMonthService
    )
    {
    }

    @Get()
    public async RequestPayments(
        @Query month: number,
        @Query year: number
    )
    {
        const range = await this.accountingMonthService.CalculateUTCRangeOfAccountingMonth(year, month);
        const payments = await this.paymentsController.QueryPaymentsInRange(range.inclusiveStart, range.inclusiveEnd);
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

    @Post("manual")
    public async CreatePayment(
        @Body paymentData: ManualPaymentCreationData
    )
    {
        return await this.paymentsImportService.CreatePayment(paymentData);
    }

    @Put("cash/{paymentId}")
    public async UpdatePayment(
        @Path paymentId: number,
        @Body paymentData: ManualPaymentCreationData
    )
    {
        return await this.paymentsController.UpdatePayment(paymentId, paymentData);
    }

    @Post("link/{paymentId}")
    public async CreatePaymentLink(
        @Path paymentId: number,
        @Body link: PaymentLink,
    )
    {
        return await this.paymentAssociationService.AssociateWithPayment(paymentId, link);
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
        const dto = this.MapPayment(payment);
        const links = await this.paymentsController.QueryPaymentLinks(paymentId, "outgoing");
        const linked = await this.paymentsController.QueryPaymentLinks(paymentId, "incoming");

        return Of<PaymentDetailsDTO>({
            links,
            linked,
            ...dto,
        });
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
        await this.paymentAssociationService.AssociateWithItem(paymentId, itemId);
    }

    //Private methods
    private MapPayment(payment: Payment): PaymentDTO
    {
        return {
            netAmount: this.financeService.ComputeNetAmount(payment).toString(),
            ...payment
        };
    }

    private MapPayments(payments: Payment[])
    {
        return payments.map(this.MapPayment.bind(this));
    }
}