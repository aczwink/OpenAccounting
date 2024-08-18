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

import { DataLink, FormField, JSX_CreateElement, Select, Use, UseDataLink, UseEffectOnce, UseState } from "acfrontend";
import { CachedAPIService } from "../CachedAPIService";

export interface AccountingMonthSelection
{
    year: number;
    month: number;
}

export function AccountingMonthPicker(input: { selectionLink: DataLink<AccountingMonthSelection> })
{
    async function OnYearChanged(newValue: number)
    {
        input.selectionLink.Set({ month: input.selectionLink.value.month, year: newValue });

        state.months = await Use(CachedAPIService).RequestAccountingMonthsOfYear(newValue);
        if(state.months.length > 0)
            OnMonthChanged(state.months[state.months.length - 1]);
    }
    function OnMonthChanged(newValue: number)
    {
        input.selectionLink.Set({
            month: newValue,
            year: input.selectionLink.value.year
        });
    }

    const state = UseState({
        months: [] as number[], 
        years: [] as number[],
    });
    UseDataLink(input.selectionLink);

    UseEffectOnce( async () => {
        const years = await Use(CachedAPIService).RequestAccountingYears();
        state.years = years;
        if(state.years.length > 0)
            OnYearChanged(years[0]);
    })

    return <div className="row">
        <div className="col">
            <FormField title="Year">
                <Select onChanged={newValue => OnYearChanged(parseInt(newValue[0]))}>
                    {state.years.map(y => <option selected={input.selectionLink.value.year === y}>{y.toString()}</option>)}
                </Select>
            </FormField>
        </div>
        <div className="col">
            <FormField title="Month">
                <Select onChanged={newValue => OnMonthChanged(parseInt(newValue[0]))}>
                    {state.months.map(m => <option selected={input.selectionLink.value?.month === m}>{m.toString()}</option>)}
                </Select>
            </FormField>
        </div>
    </div>;
}