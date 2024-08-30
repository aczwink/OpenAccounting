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

import { BootstrapIcon, JSX_CreateElement, JSX_Fragment, PushButton, Router, RouterButton, Use, UseAPIs, UseDeferredAPI, UseRouteParameter, UseState } from "acfrontend";
import { APIService } from "../APIService";
import { ItemsListComponent } from "../booking/ItemsListComponent";
import { PaymentInfoDetailsComponent } from "./ViewPaymentDetailsComponent";

export function AssociatePaymentComponent()
{
    function OnAssociate(itemId: number)
    {
        state.selectedItemId = itemId;
        assocAPIState.start();
    }

    const paymentId = UseRouteParameter("route", "paymentId", "unsigned");

    const state = UseState({
        selectedItemId: 0
    });

    const apis = UseAPIs({
        payment: { call: () => Use(APIService).payments.details._any_.get(paymentId) },
        items: { call: () => Use(APIService).items.open.get() }
    });
    const assocAPIState = UseDeferredAPI(
        () => Use(APIService).payments.items._any_.post(paymentId, { itemId: state.selectedItemId }),
        () => Use(Router).RouteTo("/payments/list/open")
    );

    if(!apis.success)
        return apis.fallback;
    if(assocAPIState.started)
        return assocAPIState.fallback;

    return <>
        <h4>Associate payment:</h4>
        <PaymentInfoDetailsComponent payment={apis.data.payment} />
        <h5>With item:</h5>
        <ItemsListComponent items={apis.data.items} actionsColumnName="Select" renderAdditionalActions={i => <PushButton small color="success" enabled={true} onActivated={OnAssociate.bind(null, i.id)}>Associate</PushButton>} />
        <RouterButton color="primary" route={"/payments/" + paymentId + "/associate/createitem"}><BootstrapIcon>plus</BootstrapIcon> Create</RouterButton>
    </>;
}