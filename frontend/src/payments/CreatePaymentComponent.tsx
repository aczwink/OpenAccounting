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

import { JSX_CreateElement, PushButton, Router, Use, UseDeferredAPI, UseState } from "acfrontend";
import { ManualPaymentCreationData, PaymentType } from "../../dist/api";
import { APIService } from "../APIService";
import { IsPaymentValid, PaymentEditor } from "./PaymentEditor";
import { Of } from "acts-util-core";

interface PaymentInitValues
{
    amount: string;
    senderId: number;
    timestamp: Date;
}

export function CreatePaymentComponent(input: { init: PaymentInitValues; })
{
    const state = UseState({
        ...Of<ManualPaymentCreationData>({
            currency: "EUR",
            externalTransactionId: "",
            grossAmount: input.init.amount,
            note: "",
            paymentServiceId: 0,
            receiverId: 0,
            senderId: input.init.senderId,
            timestamp: input.init.timestamp,
            type: PaymentType.Normal
        }),
    });
    const apiState = UseDeferredAPI(
        () => Use(APIService).payments.manual.post({
            currency: state.currency,
            externalTransactionId: state.externalTransactionId,
            grossAmount: state.grossAmount,
            note: state.note,
            paymentServiceId: state.paymentServiceId,
            receiverId: state.receiverId,
            senderId: state.senderId,
            timestamp: state.timestamp,
            type: state.type
        }),
        id => Use(Router).RouteTo("/payments/" + id)
    );

    if(apiState.started)
        return apiState.fallback;

    return <div className="container">
        <PaymentEditor payment={state} />
        <PushButton color="primary" enabled={IsPaymentValid(state)} onActivated={apiState.start}>Create</PushButton>
    </div>;
}