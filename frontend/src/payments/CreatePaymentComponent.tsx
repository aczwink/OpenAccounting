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

import { APIStateHandler, CallAPI, InitAPIState, JSX_CreateElement, PushButton, Router, Use, UseState } from "acfrontend";
import { ManualPaymentCreationData, PaymentType } from "../../dist/api";
import { APIService } from "../APIService";
import { IsPaymentValid, PaymentEditor } from "./PaymentEditor";
import { Of } from "acts-util-core";

export function CreatePaymentComponent()
{
    function OnCreate()
    {
        CallAPI(
            () => Use(APIService).payments.cash.post({
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
            id => Use(Router).RouteTo("/payments/details/" + id)
        );
    }

    const state = UseState({
        ...Of<ManualPaymentCreationData>({
            currency: "EUR",
            grossAmount: "0",
            note: "",
            paymentServiceId: 0,
            receiverId: 0,
            senderId: 0,
            timestamp: new Date(),
            type: PaymentType.Normal
        }),
        apiState: InitAPIState<number>(),
    });

    if(state.apiState.started)
        return <APIStateHandler state={state.apiState} />;

    return <div className="container">
        <PaymentEditor payment={state} />
        <PushButton color="primary" enabled={IsPaymentValid(state)} onActivated={OnCreate}>Create</PushButton>
    </div>;
}