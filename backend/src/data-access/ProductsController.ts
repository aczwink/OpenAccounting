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
import { DatabaseController } from "./DatabaseController";

export interface ProductCreationData
{
    title: string;
    price: string;
}

export interface Product extends ProductCreationData
{
    id: number;
}

@Injectable
export class ProductsController
{
    constructor(private dbController: DatabaseController)
    {
    }

    //Public methods
    public async CreateProduct(data: ProductCreationData)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const result = await exector.InsertRow("products", data);
        return result.insertId;
    }

    public async QueryProduct(id: number)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        return await exector.SelectOne<Product>("SELECT * FROM products WHERE id = ?", id);
    }

    public async QueryProducts()
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        return await exector.Select<Product>("SELECT * FROM products");
    }
}