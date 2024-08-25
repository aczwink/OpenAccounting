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
import { Anchor, BootstrapIcon, JSX_CreateElement, JSX_Fragment, ProgressSpinner, Use, UseAPI, UseEffectOnce, UseRouteParameter, UseState } from "acfrontend";
import { APIService } from "../APIService";
import { PaymentDTO, PaymentDetailsDTO, PaymentLink } from "../../dist/api";
import { PaymentServiceComponent } from "./PaymentServiceComponent";
import { PaymentTypeToString } from "../shared/payments";
import { IdentityReferenceComponent } from "../identities/IdentityReferenceComponent";
import { RenderMonetaryValue } from "../shared/money";
import { ItemsListComponent } from "../booking/ItemsListComponent";
import { Of } from "acts-util-core";
import { PaymentListComponent } from "./PaymentListComponent";

export function PaymentInfoDetailsComponent(input: { payment: PaymentDTO} )
{
    const p = input.payment;
    return <div className="container">
        <div className="row my-4">
            <div className="col">
                <strong>Date and time</strong><br />
                {p.timestamp.toLocaleString()}

                <br /><br />

                <strong>Type</strong><br />
                {PaymentTypeToString(p.type, p.grossAmount)}

                <br /><br />

                <strong>Paid with</strong><br />
                <PaymentServiceComponent paymentServiceId={p.paymentServiceId} />

                <br /><br />

                <strong>Transaction code</strong><br />
                {p.externalTransactionId}
            </div>
            <div className="col">
                <strong>Amount (gross)</strong><br />
                {RenderMonetaryValue(p.grossAmount, p.currency)}

                <br /><br />

                <strong>Transaction fee</strong><br />
                {RenderMonetaryValue(p.transactionFee, p.currency)}

                <br /><br />

                <strong>Amount (net)</strong><br />
                {RenderMonetaryValue(p.netAmount, p.currency)}
            </div>
            <div className="col">
                <strong>Sender</strong><br />
                <IdentityReferenceComponent identityId={p.senderId} />

                <br /><br />

                <strong>Receiver</strong><br />
                <IdentityReferenceComponent identityId={p.receiverId} />

                <br /><br />

                <strong>Note</strong><br />
                {p.note}
            </div>
            <div className="col-auto">
                <h2><Anchor route={"/payments/edit/" + p.id}><BootstrapIcon>pencil</BootstrapIcon></Anchor></h2>
            </div>
        </div>
    </div>;
}

function PaymentItemsAPIComponent(input: { paymentId: number })
{
    const apiState = UseAPI( () => Use(APIService).payments.items._any_.get(input.paymentId) );
    return apiState.success ? <ItemsListComponent items={apiState.data} /> : apiState.fallback;
}

interface PaymentWithLink extends PaymentDTO
{
    link: PaymentLink;
}

function PaymentLinksComponent(input: { payments: PaymentWithLink[]; })
{
    function RenderAdditional(column: number, p: PaymentWithLink)
    {
        switch(column)
        {
            case 0:
                return RenderMonetaryValue(p.link.amount, p.currency);
            case 1:
                return "cash deposit";
        }
    }

    return <PaymentListComponent payments={input.payments} additionalColumns={["Linked amount", "Reason"]} renderAdditionalColumns={RenderAdditional} />;
}

function PaymentLinksAPIComponent(input: { links: PaymentLink[] })
{
    const state = UseState({
        linkedPayments: Of<PaymentWithLink[] | null>(null)
    })
    UseEffectOnce( async () => {
        const responses = await input.links.Values().Map(async x => await Use(APIService).payments.details._any_.get(x.paymentId)).PromiseAll();
        const links = responses.map( (x, i) => {
            if(x.statusCode === 404)
                throw new Error("TODO: implment me correcly");
            return {
                ...x.data,
                link: input.links[i]
            };
        });
        state.linkedPayments = links;
    });

    if(state.linkedPayments === null)
        return <ProgressSpinner />;
    return <PaymentLinksComponent payments={state.linkedPayments} />;
}

function InternalViewPaymentDetails(input: { payment: PaymentDetailsDTO })
{
    return <>
        <PaymentInfoDetailsComponent payment={input.payment} />

        <hr />
        <h5>Associated items</h5>
        <PaymentItemsAPIComponent paymentId={input.payment.id} />

        <hr />
        <h5>Associated payments</h5>
        <PaymentLinksAPIComponent links={input.payment.links} />

        <hr />
        <h5>Payments this payment is associated with:</h5>
        <PaymentLinksAPIComponent links={input.payment.linked} />
    </>;
}

export function ViewPaymentDetailsComponent()
{
    const paymentId = UseRouteParameter("route", "paymentId", "unsigned");

    const apiState = UseAPI(() => Use(APIService).payments.details._any_.get(paymentId));
    return apiState.success ? <InternalViewPaymentDetails payment={apiState.data} /> : apiState.fallback;
}