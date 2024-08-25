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

import { APIStateHandler, CallAPI, FormField, InitAPIState, JSX_CreateElement, JSX_Fragment, LineEdit, PushButton, Router, Use, UseState } from "acfrontend";
import { APIService } from "../APIService";

export function CreateProductComponent()
{
    async function OnAdd()
    {
        CallAPI(
            () => Use(APIService).products.post({ title: state.title, price: state.price }),
            state.links.apiState,
            id => Use(Router).RouteTo("/products/" + id)
        );
    }

    const state = UseState({
        title: "",
        price: "",
        apiState: InitAPIState<number>()
    });

    if(state.apiState.started)
        return <APIStateHandler state={state.apiState} />;

    const isValid = (state.title.trim().length > 0) && (state.price.match(/^[0-9]+(\.[0-9]+)?$/) !== null)
    return <>
        <FormField title="Title">
            <LineEdit link={state.links.title} />
        </FormField>
        <FormField title="Price">
            <LineEdit link={state.links.price} />
        </FormField>
        <PushButton color="primary" enabled={isValid} onActivated={OnAdd}>Save</PushButton>
    </>;
}