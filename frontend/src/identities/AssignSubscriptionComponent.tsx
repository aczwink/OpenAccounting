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

import { DialogRef, FormField, JSX_CreateElement, JSX_Fragment, Select, Use, UseAPI, UseEffectOnce, UseState } from "acfrontend";
import { APIService } from "../APIService";
import { Subscription } from "../../dist/api";
import { NextMonth, YearMonthPicker } from "../shared/YearMonthPicker";

function AssignSubscriptionFormComponent(input: { identityId: number, subscriptions: Subscription[] })
{
    async function OnAssign()
    {
        dialogRef.waiting.Set(true);
        await Use(APIService).identities._any_.subscriptions.post(input.identityId, { startMonth: state.month, startYear: state.year, subscriptionId: state.subscriptionId! });
        dialogRef.Close();
    }

    function OnStartDateSelectionChanged(y: number, m: number)
    {
        state.month = m;
        state.year = y;
    }

    const dialogRef = Use(DialogRef);
    const state = UseState({
        subscriptionId: null as number | null,
        ...NextMonth()
    });

    UseEffectOnce( () => dialogRef.onAccept.Subscribe(OnAssign) );

    dialogRef.valid.Set(state.subscriptionId !== null);

    return <>
        <FormField title="Subscription">
            <Select onChanged={newValue => state.subscriptionId = parseInt(newValue[0])}>
                {input.subscriptions.map(x => <option value={x.id}>{x.name}</option>)}
            </Select>
        </FormField>
        <FormField title="Starting from" description="At which month does the subscription start?">
            <YearMonthPicker month={state.month} onChanged={OnStartDateSelectionChanged} year={state.year} />
        </FormField>
    </>;
}

export function AssignSubscriptionComponent(input: { identityId: number })
{
    const apiState = UseAPI(() => Use(APIService).subscriptions.get(), data => data.SortBy(x => x.name));
    return apiState.success ? <AssignSubscriptionFormComponent identityId={input.identityId} subscriptions={apiState.data} /> : apiState.fallback;
}