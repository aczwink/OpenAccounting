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

import { FormField, JSX_CreateElement, JSX_Fragment, LineEdit, PushButton, Router, Use, UseDeferredAPI, UseState } from "acfrontend";
import { APIService } from "../APIService";

export function AddSubscriptionComponent()
{
    const state = UseState({
        name: "",
        price: "",
    });
    const apiState = UseDeferredAPI(
        () => Use(APIService).subscriptions.post({ name: state.name, price: state.price }),
        id => Use(Router).RouteTo("/subscriptions/" + id)
    );

    if(apiState.started)
        return apiState.fallback;

    const isValid = (state.name.trim().length > 0) && (state.price.match(/^[0-9]+(\.[0-9]+)?$/) !== null)
    return <>
        <FormField title="Name">
            <LineEdit link={state.links.name} />
        </FormField>
        <FormField title="Price">
            <LineEdit link={state.links.price} />
        </FormField>
        <PushButton color="primary" enabled={isValid} onActivated={apiState.start}>Save</PushButton>
    </>;
}