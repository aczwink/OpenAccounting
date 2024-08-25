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
import { RouterButton, JSX_CreateElement, BootstrapIcon, UseAPI, Use, Anchor } from "acfrontend";
import { APIService } from "../APIService";
import { ProductDTO } from "../../dist/api";
import { RenderMonetaryValue } from "../shared/money";

function InternalProductListComponent(input: { products: ProductDTO[] })
{
    return <table className="table table-sm table-striped">
        <thead>
            <th>Title</th>
            <th>Price</th>
        </thead>
        <tbody>
            {input.products.map(x => <tr>
            <td>
                <Anchor route={"/products/" + x.id}>{x.title}</Anchor>
            </td>
            <td>{RenderMonetaryValue(x.price, x.currency)}</td>
        </tr>)}
    </tbody>
    <caption>Showing {input.products.length} products.</caption>
</table>;
}

export function ProductListComponent()
{
    const apiState = UseAPI(() => Use(APIService).products.get(), data => data.SortBy(x => x.price));
    return <div className="container">
        {apiState.success ? <InternalProductListComponent products={apiState.data} /> : apiState.fallback}
        <RouterButton color="primary" route="/products/add"><BootstrapIcon>plus</BootstrapIcon></RouterButton>
    </div>;
}