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

import { Component, JSX_CreateElement } from "acfrontend";
import { PaymentDTO, PaymentType } from "../../dist/api";
import { PaymentServiceComponent } from "./PaymentServiceComponent";
import { IdentityReferenceComponent } from "../identities/IdentityReferenceComponent";

export class PaymentsComponent extends Component<{ payments: PaymentDTO[] }>
{
    protected Render(): RenderValue
    {
        return <table className="table table-sm table-striped">
            <thead>
                <th>Date and time</th>
                <th>Paid with</th>
                <th>Transaction code</th>
                <th>Type</th>
                <th>Sender/Receiver</th>
                <th>Amount (gross)</th>
                <th>Transaction fee</th>
                <th>Amount (net)</th>
                <th>Currency</th>
                <th>Note</th>
                <th>Actions</th>
            </thead>
            <tbody>
                {this.input.payments.map(this.RenderPayment.bind(this))}
            </tbody>
            <caption>Showing {this.input.payments.length} payments.</caption>
        </table>;
    }

    //Private methods
    private RenderPayment(p: PaymentDTO)
    {
        return <tr>
            <td>{p.timestamp.toLocaleString()}</td>
            <td><PaymentServiceComponent paymentServiceId={p.paymentServiceId} /></td>
            <td>{p.externalTransactionId}</td>
            <td>{this.RenderType(p.type, p.grossAmount)}</td>
            <td><IdentityReferenceComponent identityId={p.identityId} /></td>
            <td>{this.RenderMonetaryValue(p.grossAmount)}</td>
            <td>{this.RenderMonetaryValue(p.transactionFee)}</td>
            <td>{this.RenderMonetaryValue(p.netAmount)}</td>
            <td>{p.currency}</td>
            <td>{p.note}</td>
            <td>TODO</td>
        </tr>;
    }

    private RenderType(type: PaymentType, grossAmount: string)
    {
        switch(type)
        {
            case PaymentType.Normal:
                return grossAmount.startsWith("-") ? "Outbound" : "Inbound";
            case PaymentType.Withdrawal:
                return "Withdrawal";
        }
    }

    private RenderMonetaryValue(value: string)
    {
        if(value.startsWith("-"))
            return <span className="text-danger">{value}</span>;
        return value;
    }
}