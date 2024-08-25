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

import { APIStateHandler, BootstrapIcon, CallAPI, InitAPIState, JSX_CreateElement, JSX_Fragment, PushButton, Router, RouterButton, Use, UseEffectOnce, UseRouteParameter, UseState } from "acfrontend";
import { APIService } from "../APIService";
import { Item, PaymentDTO } from "../../dist/api";
import { ItemsListComponent } from "../booking/ItemsListComponent";
import { PaymentInfoDetailsComponent } from "./ViewPaymentDetailsComponent";

export function AssociatePaymentComponent()
{
    function OnAssociate(itemId: number)
    {
        CallAPI(
            () => Use(APIService).payments.items._any_.post(paymentId, { itemId }),
            state.links.assocAPIState,
            () => Use(Router).RouteTo("/payments/list/open")
        );
    }

    const paymentId = UseRouteParameter("route", "paymentId", "unsigned");

    const state = UseState({
        assocAPIState: InitAPIState(),
        itemsAPIState: InitAPIState<Item[]>(),
        paymentAPIState: InitAPIState<PaymentDTO>(),
    });

    UseEffectOnce(() => {
        CallAPI(() => Use(APIService).payments.details._any_.get(paymentId), state.links.paymentAPIState);
        CallAPI(() => Use(APIService).items.open.get(), state.links.itemsAPIState);
    });

    if(!state.itemsAPIState.success)
        return <APIStateHandler state={state.itemsAPIState} />;
    if(!state.paymentAPIState.success)
        return <APIStateHandler state={state.paymentAPIState} />;
    if(state.assocAPIState.started)
        return <APIStateHandler state={state.assocAPIState} />;

    return <>
        <h4>Associate payment:</h4>
        <PaymentInfoDetailsComponent payment={state.paymentAPIState.data} />
        <h5>With item:</h5>
        <ItemsListComponent items={state.itemsAPIState.data} actionsColumnName="Select" renderAdditionalActions={i => <PushButton small color="success" enabled={true} onActivated={OnAssociate.bind(null, i.id)}>Associate</PushButton>} />
        <RouterButton color="primary" route={"/payments/" + paymentId + "/associate/createitem"}><BootstrapIcon>plus</BootstrapIcon> Create</RouterButton>
    </>;
}