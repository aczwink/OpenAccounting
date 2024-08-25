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

import { BootstrapIcon, JSX_CreateElement, RouterButton } from "acfrontend";
import { Item } from "../../dist/api";
import { IdentityReferenceComponent } from "../identities/IdentityReferenceComponent";
import { SubscriptionReferenceComponent } from "../subscriptions/SubscriptionReferenceComponent";
import { RenderMonetaryValue } from "../shared/money";
import { ProductReferenceComponent } from "../products/ProductReferenceComponent";

function RenderItemFor(item: Item)
{
    if(item.subscriptionId !== null)
        return <SubscriptionReferenceComponent id={item.subscriptionId} />;
    if(item.productId !== null)
        return <ProductReferenceComponent id={item.productId} />;
    return item.note;
}

function RenderItem(item: Item, extraActionsRenderer?: (i: Item) => RenderValue)
{
    const actions = extraActionsRenderer ?? (() => null);
    return <tr>
        <td>{item.timestamp.toLocaleString()}</td>
        <td><IdentityReferenceComponent identityId={item.debtorId} /></td>
        <td>{RenderMonetaryValue(item.amount, item.currency)}</td>
        <td>{RenderItemFor(item)}</td>
        <td>
            <div className="btn-group">
                <RouterButton className="btn-sm" color="primary" route={"/booking/items/" + item.id}><BootstrapIcon>zoom-in</BootstrapIcon> View details</RouterButton>
                {actions(item)}
            </div>
        </td>
    </tr>;
}

export function ItemsListComponent(input: { items: Item[]; actionsColumnName?: string; renderAdditionalActions?: (i: Item) => RenderValue; })
{
    const actionsColumnName = input.actionsColumnName ?? "Actions";
    return <table className="table table-sm table-striped">
        <thead>
            <th>Date and time</th>
            <th>Debtor</th>
            <th>Amount</th>
            <th>Goods</th>
            <th>{actionsColumnName}</th>
        </thead>
        <tbody>
            {input.items.map(x => RenderItem(x, input.renderAdditionalActions))}
        </tbody>
        <caption>Showing {input.items.length} items.</caption>
    </table>;
}