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

import { JSX_CreateElement, JSX_Fragment, PushButton, Router, Use, UseAPI, UseDeferredAPI, UseState } from "acfrontend";
import { YearMonthPicker } from "../shared/YearMonthPicker";
import { APIService } from "../APIService";

export function CreateAccountingMonthComponent()
{
    function OnMonthYearSelectionChanged(y: number, m: number)
    {
        state.month = m;
        state.year = y;
    }

    const state = UseState({
        month: 1,
        year: 1970,
    });
    const requestAPIState = UseAPI(
        () => Use(APIService).accounting.next.get(),
        data => {
            state.month = data.month;
            state.year = data.year
        }
    );
    const creationAPIState = UseDeferredAPI(
        () => Use(APIService).accounting.years._any_.months.post(state.year, { month: state.month }),
        () => Use(Router).RouteTo("/booking")
    );

    if(creationAPIState.started)
        return creationAPIState.fallback;
    if(!requestAPIState.success)
        return requestAPIState.fallback;

    return <>
        <YearMonthPicker month={state.month} onChanged={OnMonthYearSelectionChanged} year={state.year} />
        <PushButton color="primary" enabled={true} onActivated={creationAPIState.start}>Create</PushButton>
    </>;
}