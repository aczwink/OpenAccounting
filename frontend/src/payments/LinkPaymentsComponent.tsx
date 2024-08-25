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

import { UseRouteParameter, UseAPI, Use, JSX_CreateElement, JSX_Fragment, PushButton, UseState, CallAPI, InitAPIState, Router, LoadingButton, FormField } from "acfrontend";
import { APIService } from "../APIService";
import { PaymentDTO } from "../../dist/api";
import { PaymentInfoDetailsComponent } from "./ViewPaymentDetailsComponent";
import { PaymentsPerMonthComponent } from "./PaymentsPerMonthComponent";
import { Of } from "acts-util-core";
import { RenderMonetaryEditControl } from "../shared/money";

function LinkFinalComponent(input: { linkedPayment: PaymentDTO; paymentId: number })
{
    function OnAssociate()
    {
        CallAPI( 
            () => Use(APIService).payments.link._any_.post(input.paymentId, {
                amount: state.amount,
                paymentId: input.linkedPayment.id,
                reason: 0
            }),
            state.links.assocState,
            () => Use(Router).RouteTo("/payments/list/open")
        )
    }

    const state = UseState({
        assocState: InitAPIState(),
        amount: input.linkedPayment.grossAmount
    });

    return <>
        <PaymentInfoDetailsComponent payment={input.linkedPayment} />
        <div className="container">
            <FormField title="Amount" description="What amount of the original payment should be associated?">
                {RenderMonetaryEditControl(state.links.amount, input.linkedPayment.currency)}
            </FormField>
            <LoadingButton color="primary" enabled={!state.assocState.started} isLoading={state.assocState.started} onActivated={OnAssociate}>Associate</LoadingButton>
        </div>
    </>;
}

function InternalLinkPaymentsComponent(input: { payment: PaymentDTO })
{
    const state = UseState({
        linkedPayment: Of<PaymentDTO | null>(null),
    });

    return <>
        <div className="container">
            <h4>Associate payment:</h4>
        </div>
        <PaymentInfoDetailsComponent payment={input.payment} />
        <h5>With payment:</h5>
        {
            state.linkedPayment === null
            ? <PaymentsPerMonthComponent renderAdditionalActions={p => <PushButton small color="success" enabled={true} onActivated={() => state.linkedPayment = p}>Associate</PushButton>} />
            : <LinkFinalComponent linkedPayment={state.linkedPayment} paymentId={input.payment.id} />
        }
    </>;
}

export function LinkPaymentsComponent()
{
    const paymentId = UseRouteParameter("route", "paymentId", "unsigned");

    const apiState = UseAPI(() => Use(APIService).payments.details._any_.get(paymentId));
    return apiState.success ? <InternalLinkPaymentsComponent payment={apiState.data} /> : apiState.fallback;
}