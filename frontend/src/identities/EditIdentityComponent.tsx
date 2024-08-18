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

import { APIStateHandler, CallAPI, FormField, InitAPIState, JSX_CreateElement, JSX_Fragment, LineEdit, PushButton, Router, TextArea, Use, UseAPI, UseRouteParameter, UseState } from "acfrontend";
import { APIService } from "../APIService";
import { Identity } from "../../dist/api";

function EditIdentityFormComponent(input: { identity: Identity })
{
    function OnSave()
    {
        CallAPI(
            () => Use(APIService).identities._any_.put(input.identity.id, { newFirstName: state.firstName, newLastName: state.lastName, newNotes: state.notes }), state.links.updateAPIState,
            () => Use(Router).RouteTo("/identities/" + input.identity.id)
        );
    }

    const state = UseState({
        firstName: input.identity.firstName,
        lastName: input.identity.lastName,
        notes: input.identity.notes,
        updateAPIState: InitAPIState()
    });

    if(state.updateAPIState.started)
        return <APIStateHandler state={state.updateAPIState} />;

    const isValid = (state.firstName.trim().length > 0) && (state.lastName.trim().length > 0);
    return <>
        <FormField title="First name">
            <LineEdit link={state.links.firstName} />
        </FormField>
        <FormField title="Last name">
            <LineEdit link={state.links.lastName} />
        </FormField>
        <FormField title="Notes" description="Any additional notes to be memorized">
            <TextArea onChanged={newValue => state.notes = newValue} value={state.notes} />
        </FormField>
        <PushButton color="primary" enabled={isValid} onActivated={OnSave}>Save</PushButton>
    </>;
}

export function EditIdentityComponent()
{
    const identityId = UseRouteParameter("route", "identityId", "unsigned");

    const apiState = UseAPI(() => Use(APIService).identities._any_.get(identityId));
    return apiState.success ? <EditIdentityFormComponent identity={apiState.data} /> : apiState.fallback;
}