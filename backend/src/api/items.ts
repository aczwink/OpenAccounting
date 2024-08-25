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

import { APIController, Body, Get, Path, Post, Query } from "acts-util-apilib";
import { ItemsController } from "../data-access/ItemsController";
import { AccountingMonthService } from "../services/AccountingMonthService";
import { DateTime } from "acts-util-node";
import { ProductsController } from "../data-access/ProductsController";
import { LanguageService } from "../services/LanguageService";
import { SubscriptionsController } from "../data-access/SubscriptionsController";

type ItemSaleType = { type: "product"; productId: number } | { type: "subscription"; subscriptionId: number } | { type: "manual"; amount: string; currency: string; };

interface ItemCreationDataDTO
{
    timestamp: DateTime;
    debtorId: number;
    note: string;
    saleType: ItemSaleType;
}

@APIController("items")
class _api_
{
    constructor(private itemsController: ItemsController, private accountingMonthService: AccountingMonthService, private productsController: ProductsController, private languageService: LanguageService,
        private subscriptionsController: SubscriptionsController
    )
    {
    }

    @Post()
    public async CreateItem(
        @Body data: ItemCreationDataDTO
    )
    {
        switch(data.saleType.type)
        {
            case "manual":
                return await this.itemsController.CreateItem({
                    amount: data.saleType.amount,
                    currency: data.saleType.currency,
                    debtorId: data.debtorId,
                    note: data.note,
                    productId: null,
                    subscriptionId: null,
                    timestamp: data.timestamp
                });

            case "product":
            {
                const product = await this.productsController.QueryProduct(data.saleType.productId);
                const currency = await this.languageService.GetNativeCurrency();
                return await this.itemsController.CreateItem({
                    amount: product!.price,
                    currency: currency,
                    debtorId: data.debtorId,
                    note: data.note,
                    productId: data.saleType.productId,
                    subscriptionId: null,
                    timestamp: data.timestamp
                });
            }

            case "subscription":
            {
                const subscription = await this.subscriptionsController.QuerySubscription(data.saleType.subscriptionId);
                const currency = await this.languageService.GetNativeCurrency();
                return await this.itemsController.CreateItem({
                    amount: subscription!.price,
                    currency: currency,
                    debtorId: data.debtorId,
                    note: data.note,
                    productId: null,
                    subscriptionId: data.saleType.subscriptionId,
                    timestamp: data.timestamp
                });
            }
        }
    }

    @Get()
    public async RequestItems(
        @Query month: number,
        @Query year: number
    )
    {
        const range = await this.accountingMonthService.CalculateUTCRangeOfAccountingMonth(year, month);
        const items = await this.itemsController.QueryItemsInRange(range.inclusiveStart, range.inclusiveEnd);
        return items;
    }

    @Get("details/{itemId}")
    public async RequestItem(
        @Path itemId: number,
    )
    {
        return await this.itemsController.QueryItem(itemId);
    }

    @Get("open")
    public async RequestOpenItems()
    {
        const items = await this.itemsController.QueryOpenItems();
        return items;
    }
}