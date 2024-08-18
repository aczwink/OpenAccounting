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
import { PaymentDTO } from "../../dist/api";
import { PaymentServiceComponent } from "./PaymentServiceComponent";
import { PaymentTypeToString } from "../shared/payments";
import { IdentityReferenceComponent } from "../identities/IdentityReferenceComponent";
import { RenderMonetaryValue } from "../shared/money";
import { ItemsListComponent } from "../booking/ItemsListComponent";

function PaymentInfoDetailsComponent(input: { payment: PaymentDTO} )
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
                {RenderMonetaryValue(p.grossAmount)}

                <br /><br />

                <strong>Transaction fee</strong><br />
                {RenderMonetaryValue(p.transactionFee)}

                <br /><br />

                <strong>Amount (net)</strong><br />
                {RenderMonetaryValue(p.netAmount)}

                <br /><br />

                <strong>Currency</strong><br />
                {p.currency}
            </div>
            <div className="col">
                <strong>Sender/Receiver</strong><br />
                <IdentityReferenceComponent identityId={p.identityId} />

                <br /><br />

                <strong>Note</strong><br />
                {p.note}
            </div>
        </div>
    </div>;
}

function PaymentItemsAPIComponent(input: { paymentId: number })
{
    const apiState = UseAPI( () => Use(APIService).payments.items._any_.get(input.paymentId) );
    return apiState.success ? <ItemsListComponent items={apiState.data} /> : apiState.fallback;
}

function InternalViewPaymentDetails(input: { payment: PaymentDTO} )
{
    return <>
        <PaymentInfoDetailsComponent payment={input.payment} />

        <hr />
        <h5>Associated items</h5>
        <PaymentItemsAPIComponent paymentId={input.payment.id} />
    </>;
}

export function ViewPaymentDetailsComponent()
{
    const paymentId = UseRouteParameter("route", "paymentId", "unsigned");

    const apiState = UseAPI(() => Use(APIService).payments.details._any_.get(paymentId));
    return apiState.success ? <InternalViewPaymentDetails payment={apiState.data} /> : apiState.fallback;
}