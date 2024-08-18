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

import { BootstrapIcon, Component, JSX_CreateElement, RouterButton } from "acfrontend";
import { PaymentDTO, PaymentType } from "../../dist/api";
import { PaymentServiceComponent } from "./PaymentServiceComponent";
import { IdentityReferenceComponent } from "../identities/IdentityReferenceComponent";
import { RenderMonetaryValue } from "../shared/money";
import { PaymentTypeToString } from "../shared/payments";

export class PaymentListComponent extends Component<{ payments: PaymentDTO[]; renderAdditionalActions?: (p: PaymentDTO) => RenderValue }>
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
        const addtionalActions = (this.input.renderAdditionalActions === undefined) ? null : this.input.renderAdditionalActions(p);
        return <tr>
            <td>{p.timestamp.toLocaleString()}</td>
            <td><PaymentServiceComponent paymentServiceId={p.paymentServiceId} /></td>
            <td>{p.externalTransactionId}</td>
            <td>{PaymentTypeToString(p.type, p.grossAmount)}</td>
            <td><IdentityReferenceComponent identityId={p.identityId} /></td>
            <td>{RenderMonetaryValue(p.grossAmount)}</td>
            <td>{RenderMonetaryValue(p.transactionFee)}</td>
            <td>{RenderMonetaryValue(p.netAmount)}</td>
            <td>{p.currency}</td>
            <td>{p.note}</td>
            <td>
                <div className="btn-group">
                    <RouterButton className="btn-sm" color="primary" route={"/payments/details/" + p.id}><BootstrapIcon>zoom-in</BootstrapIcon> View details</RouterButton>
                    {addtionalActions}
                </div>
            </td>
        </tr>;
    }
}