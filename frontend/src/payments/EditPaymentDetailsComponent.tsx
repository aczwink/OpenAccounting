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

import { CallAPI, InitAPIState, JSX_CreateElement, PushButton, Router, Use, UseAPI, UseRouteParameter, UseState } from "acfrontend";
import { IsPaymentValid, PaymentEditor } from "./PaymentEditor";
import { APIService } from "../APIService";
import { ManualPaymentCreationData, PaymentDTO } from "../../dist/api";
import { Of } from "acts-util-core";

function InternalEditPaymentDetailsComponent(input: { paymentId: number; payment: PaymentDTO })
{
    function OnUpdate()
    {
        CallAPI(
            () => Use(APIService).payments.cash._any_.put(input.paymentId, {
                currency: state.currency,
                grossAmount: state.grossAmount,
                note: state.note,
                paymentServiceId: state.paymentServiceId,
                receiverId: state.receiverId,
                senderId: state.senderId,
                timestamp: state.timestamp,
                type: state.type
            }),
            state.links.apiState,
            _ => Use(Router).RouteTo("/payments/details/" + input.paymentId)
        );
    }

    const p = input.payment;
    const state = UseState({
        ...Of<ManualPaymentCreationData>({
            currency: p.currency,
            grossAmount: p.grossAmount,
            note: p.note,
            paymentServiceId: p.paymentServiceId,
            receiverId: p.receiverId,
            senderId: p.senderId,
            timestamp: p.timestamp,
            type: p.type
        }),
        apiState: InitAPIState(),
    });

    return <div className="container">
        <PaymentEditor payment={state} />
        <PushButton color="primary" enabled={IsPaymentValid(state)} onActivated={OnUpdate}>Save</PushButton>
    </div>;
}

export function EditPaymentDetailsComponent()
{
    const paymentId = UseRouteParameter("route", "paymentId", "unsigned");

    const apiState = UseAPI(() => Use(APIService).payments.details._any_.get(paymentId));
    return apiState.success ? <InternalEditPaymentDetailsComponent paymentId={paymentId} payment={apiState.data} /> : apiState.fallback;
}