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
import { JSX_CreateElement, Use, UseAPI, UseRouteParameter } from "acfrontend";
import { APIService } from "../APIService";
import { ProductDTO } from "../../dist/api";
import { RenderMonetaryValue } from "../shared/money";

function InternalShowSubscriptionComponent(input: { product: ProductDTO; })
{
    return <div className="container">
        <h3>{input.product.title}</h3>

        <ul>
            <li>Price: {RenderMonetaryValue(input.product.price, input.product.currency)}</li>
        </ul>
    </div>;
}

export function ViewProductComponent()
{
    const productId = UseRouteParameter("route", "productId", "unsigned");

    const apiState = UseAPI(() => Use(APIService).products._any_.get(productId));
    return apiState.success ? <InternalShowSubscriptionComponent product={apiState.data} /> : apiState.fallback;
}