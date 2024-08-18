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

import { APIController, Get, Path, Query } from "acts-util-apilib";
import { ItemsController } from "../data-access/ItemsController";
import { AccountingMonthService } from "../services/AccountingMonthService";

@APIController("items")
class _api_
{
    constructor(private itemsController: ItemsController, private accountingMonthService: AccountingMonthService)
    {
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