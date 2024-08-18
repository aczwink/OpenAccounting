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

interface ItemCreationData
{
    timestamp: DateTime;
    debtorId: number;
    amount: string;
    subscriptionId: number;
}

interface Item extends ItemCreationData
{
    id: number;
}

interface ItemDetails extends Item
{
    paymentIds: number[];
}

@Injectable
export class ItemsController
{
    constructor(private dbController: DatabaseController)
    {
    }

    //Public methods
    public async CreateSubscriptionItem(data: ItemCreationData)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const result = await exector.InsertRow("items", data);
        const itemId = result.insertId;

        await exector.InsertRow("items_open", { itemId });
    }

    public async QueryItem(itemId: number)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const row = await exector.SelectOne<Item>("SELECT * FROM items WHERE id = ?", itemId);
        if(row === undefined)
            return undefined;
        const item = row as ItemDetails;

        const rows = await exector.Select("SELECT paymentId FROM payments_items WHERE itemId = ?", itemId);

        item.paymentIds = rows.map(row => row.paymentId);
        return item;
    }

    public async QueryItemsInRange(inclusiveStart: DateTime, inclusiveEnd: DateTime)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const rows = await exector.Select<Item>("SELECT * FROM items WHERE timestamp >= ? AND timestamp <= ?", inclusiveStart, inclusiveEnd);
        return rows;
    }

    public async QueryOpenItems()
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const rows = await exector.Select<Item>("SELECT i.* FROM items i INNER JOIN items_open io ON io.itemId = i.id");
        return rows;
    }

    public async RemoveItemFromOpenItemsList(itemId: number)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        await exector.DeleteRows("items_open", "itemId = ?", itemId);
    }
}