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
import { JSX_CreateElement, JSX_Fragment, ProgressSpinner, Use, UseAPI, UseEffectOnce, UseRouteParameter, UseState } from "acfrontend";
import { APIService } from "../APIService";
import { ItemDetails, PaymentDTO } from "../../dist/api";
import { PaymentListComponent } from "../payments/PaymentListComponent";
import { IdentityReferenceComponent } from "../identities/IdentityReferenceComponent";
import { RenderMonetaryValue } from "../shared/money";
import { SubscriptionReferenceComponent } from "../subscriptions/SubscriptionReferenceComponent";

function InternalViewPaymentsDetailsComponent(input: { item: ItemDetails })
{
    const i = input.item;
    return <div className="container">
        <div className="row my-4">
            <div className="col">
                <strong>Date and time</strong><br />
                {i.timestamp.toLocaleString()}
            </div>
            <div className="col">
                <strong>Debtor</strong><br />
                <IdentityReferenceComponent identityId={i.debtorId} />
            </div>
            <div className="col">
                <strong>Amount</strong><br />
                {RenderMonetaryValue(i.amount)}
            </div>
            <div className="col">
                <strong>Subscription</strong><br />
                <SubscriptionReferenceComponent id={i.subscriptionId} />
            </div>
        </div>
    </div>;
}

function ItemPaymentsAPIComponent(input: { paymentIds: number[] })
{
    const state = UseState({
        payments: null as PaymentDTO[] | null
    });
    UseEffectOnce(async () => {
        const payments = await input.paymentIds.Values().Map(async x => {
            const response = await Use(APIService).payments.details._any_.get(x);
            if(response.statusCode !== 200)
            {
                alert("TODO: implment me");
                throw new Error("TODO: implment me");
            }
            return response.data;
        }).PromiseAll();
        state.payments = payments;
    });

    return state.payments === null ? <ProgressSpinner /> : <PaymentListComponent payments={state.payments} />;
}

function InternalViewItemDetails(input: { item: ItemDetails} )
{
    return <>
        <InternalViewPaymentsDetailsComponent item={input.item} />

        <hr />
        <h5>Associated payments</h5>
        <ItemPaymentsAPIComponent paymentIds={input.item.paymentIds} />
    </>;
}

export function ViewItemDetailsComponent()
{
    const itemId = UseRouteParameter("route", "itemId", "unsigned");

    const apiState = UseAPI(() => Use(APIService).items.details._any_.get(itemId));
    return apiState.success ? <InternalViewItemDetails item={apiState.data} /> : apiState.fallback;
}