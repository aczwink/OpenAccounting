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

import { Anchor, BootstrapIcon, JSX_CreateElement, RouterButton, Use, UseAPI } from "acfrontend";
import { Subscription } from "../../dist/api";
import { APIService } from "../APIService";

function InternalSubscriptionListComponent(input: { subscriptions: Subscription[] })
{
    return <table className="table table-sm table-striped">
        <thead>
            <th>Name</th>
            <th>Price</th>
        </thead>
        <tbody>
            {input.subscriptions.map(x => <tr>
            <td>
                <Anchor route={"/subscriptions/" + x.id}>{x.name}</Anchor>
            </td>
            <td>{x.price}</td>
        </tr>)}
    </tbody>
    <caption>Showing {input.subscriptions.length} subscriptions.</caption>
</table>;
}

export function SubscriptionListComponent()
{
    const apiState = UseAPI(() => Use(APIService).subscriptions.get(), data => data.SortBy(x => x.price));
    return <div className="container">
        {apiState.success ? <InternalSubscriptionListComponent subscriptions={apiState.data} /> : apiState.fallback}
        <RouterButton color="primary" route="/subscriptions/add"><BootstrapIcon>plus</BootstrapIcon></RouterButton>
    </div>;
}