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

import { DialogRef, FormField, JSX_CreateElement, JSX_Fragment, LineEdit, Select, Use, UseAPI, UseEffectOnce, UseState } from "acfrontend";
import { APIService } from "../APIService";
import { PaymentService } from "../../dist/api";

function FormComponent(input: { identityId: number, paymentServices: PaymentService[] })
{
    async function OnAssign()
    {
        dialogRef.waiting.Set(true);
        await Use(APIService).identities._any_.paymentAccounts.post(input.identityId, { externalAccount: state.externalAccount, paymentServiceId: state.paymentServiceId });
        dialogRef.Close();
    }

    const dialogRef = Use(DialogRef);
    const state = UseState({
        paymentServiceId: 0,
        externalAccount: "",
    });

    UseEffectOnce( () => dialogRef.onAccept.Subscribe(OnAssign) );

    dialogRef.valid.Set((state.paymentServiceId !== 0) && (state.externalAccount.trim().length > 0));

    return <>
        <FormField title="Payment service">
            <Select onChanged={newValue => state.paymentServiceId = parseInt(newValue[0])}>
                {input.paymentServices.map(x => <option value={x.id}>{x.name}</option>)}
            </Select>
        </FormField>
        <FormField title="Account" description="IBAN for bank accounts, e-mail for PayPal, empty for cash">
            <LineEdit link={state.links.externalAccount} />
        </FormField>
    </>;
}

export function AddPaymentAccountComponent(input: { identityId: number })
{
    const apiState = UseAPI(() => Use(APIService).payments.services.get(), data => data.SortBy(x => x.name));
    return apiState.success ? <FormComponent identityId={input.identityId} paymentServices={apiState.data} /> : apiState.fallback;
}