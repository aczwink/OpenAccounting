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

import { DateTimePicker, FormField, FunctionState, JSX_CreateElement, JSX_Fragment, LineEdit, Select, TextArea, Use, UseAPIs } from "acfrontend";
import { IdentityOverviewData, ManualPaymentCreationData, PaymentService, PaymentType } from "../../dist/api";
import { PaymentTypeToString } from "../shared/payments";
import { APIService } from "../APIService";

function PaymentEditorFormComponent(input: { payment: FunctionState<ManualPaymentCreationData>; identities: IdentityOverviewData[]; paymentServices: PaymentService[]; })
{
    const p = input.payment;

    const types = [PaymentType.Normal, PaymentType.Withdrawal];
    const selectedService = input.paymentServices.find(x => x.id === p.paymentServiceId);
    return <>
        <FormField title="Date and time">
            <DateTimePicker value={p.timestamp} onChanged={newValue => p.timestamp = newValue} />
        </FormField>
        <FormField title="Type">
            <Select onChanged={newValue => p.type = parseInt(newValue[0])}>
                {types.map(t => <option selected={t === p.type} value={t}>{PaymentTypeToString(t, p.grossAmount)}</option>)}
            </Select>
        </FormField>
        <FormField title="Paid with">
            <Select onChanged={newValue => p.paymentServiceId = parseInt(newValue[0])}>
                {input.paymentServices.map(x => <option value={x.id} selected={x.id === p.paymentServiceId}>{x.name}</option>)}
            </Select>
        </FormField>
        <FormField title="Transaction code">
            {(selectedService?.type === "cash") ? <input type="text" placeholder="Automatically set" disabled className="form-control" /> : <LineEdit link={input.payment.links.externalTransactionId} />}
        </FormField>
        <div className="row">
            <div className="col">
                <FormField title="Sender">
                    <Select onChanged={newValue => p.senderId = parseInt(newValue[0])}>
                        {input.identities.map(x => <option value={x.id} selected={x.id === p.senderId}>{x.firstName + " " + x.lastName}</option>)}
                    </Select>
                </FormField>
            </div>
            <div className="col">
                <FormField title="Receiver">
                    <Select onChanged={newValue => p.receiverId = parseInt(newValue[0])}>
                        {input.identities.map(x => <option value={x.id} selected={x.id === p.receiverId}>{x.firstName + " " + x.lastName}</option>)}
                    </Select>
                </FormField>
            </div>
        </div>
        <div className="row">
            <div className="col">
                <FormField title="Amount">
                    <LineEdit link={p.links.grossAmount} />
                </FormField>
            </div>
            <div className="col">
                <FormField title="Currency">
                    <input className="form-control" type="text" disabled value={p.currency} />
                </FormField>
            </div>
        </div>
        <FormField title="Note">
            <TextArea value={p.note} onChanged={newValue => p.note = newValue} />
        </FormField>
    </>;
}

export function PaymentEditor(input: { payment: FunctionState<ManualPaymentCreationData> })
{
    const apis = UseAPIs({
        paymentServices: { call: () => Use(APIService).payments.services.get(), onSuccess: data => data.SortBy(x => x.name) },
        identities: { call: () => Use(APIService).identities.get(), onSuccess: data => data.SortBy(x => x.lastName) },
    });
    return apis.success ? <PaymentEditorFormComponent identities={apis.data.identities} paymentServices={apis.data.paymentServices} payment={input.payment} /> : apis.fallback;
}

export function IsPaymentValid(payment: ManualPaymentCreationData)
{
    const isValid = (payment.paymentServiceId !== 0) && (payment.senderId !== 0) && (payment.receiverId !== 0);
    return isValid;
}