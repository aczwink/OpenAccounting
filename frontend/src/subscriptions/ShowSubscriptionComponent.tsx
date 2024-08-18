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
import { JSX_CreateElement, JSX_Fragment, Use, UseAPI, UseRouteParameter } from "acfrontend";
import { APIService } from "../APIService";
import { Subscription } from "../../dist/api";

function InternalShowSubscriptionComponent(input: { subscription: Subscription })
{
    return <>
        <h3>{input.subscription.name}</h3>

        <ul>
            <li>Price: {input.subscription.price}</li>
        </ul>
    </>;
}

export function ShowSubscriptionComponent()
{
    const subscriptionId = UseRouteParameter("route", "subscriptionId", "unsigned");

    const apiState = UseAPI(() => Use(APIService).subscriptions._any_.get(subscriptionId));
    return apiState.success ? <InternalShowSubscriptionComponent subscription={apiState.data} /> : apiState.fallback;
}