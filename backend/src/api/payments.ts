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

import { APIController, FormField, Get, Post, Query } from "acts-util-apilib";
import { Payment, PaymentsController } from "../data-access/PaymentsController";
import { PaymentsImportService } from "../services/PaymentsImportService";
import { UploadedFile } from "acts-util-node/dist/http/UploadedFile";
import { Money } from "@dintero/money";

interface PaymentDTO extends Payment
{
    netAmount: string;
}

@APIController("payments")
class _api_
{
    constructor(private paymentsController: PaymentsController, private paymentsImportService: PaymentsImportService)
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

    //Private methods
    private MapPayments(payments: Payment[])
    {
        return payments.map<PaymentDTO>(x => ({
            netAmount: Money.of(x.grossAmount, x.currency).add(Money.of(x.transactionFee, x.currency)).toString(),
            ...x
        }));
    }
}