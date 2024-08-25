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

import { APIController, Body, Get, NotFound, Path, Post } from "acts-util-apilib";
import { Product, ProductCreationData, ProductsController } from "../data-access/ProductsController";
import { LanguageService } from "../services/LanguageService";

interface ProductDTO extends Product
{
    currency: string;
}

@APIController("products")
class _api_
{
    constructor(private productsController: ProductsController, private languageService: LanguageService)
    {
    }

    @Get()
    public async RequestProducts()
    {
        const products = await this.productsController.QueryProducts();
        const currency = await this.languageService.GetNativeCurrency()
        return products.map(this.MapProduct.bind(this, currency));
    }

    @Post()
    public async CreateProducts(
        @Body data: ProductCreationData)
    {
        return this.productsController.CreateProduct(data);
    }

    @Get("{id}")
    public async RequestProduct(
        @Path id: number
    )
    {
        const product = await this.productsController.QueryProduct(id);
        if(product === undefined)
            return NotFound("product not found");
        const currency = await this.languageService.GetNativeCurrency()
        return this.MapProduct(currency, product);
    }

    //Private methods
    private MapProduct(currency: string, product: Product): ProductDTO
    {
        return {
            ...product,
            currency
        };
    }
}